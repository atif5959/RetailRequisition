import { supabaseAdmin } from './supabaseClient';
import { retailItems } from './retailRequisitionFields';
import type { RetailItem } from './retailRequisitionFields';

export type RetailItemRow = {
  id: string;
  key: string;
  label: string;
  price: number;
  price_key: string;
  total_key: string;
  sort_order: number;
};

export async function getRetailItemRows(): Promise<RetailItemRow[]> {
  const supabase = supabaseAdmin();

  const { count, error: countErr } = await supabase
    .from('retail_items')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (countErr) return [];

  if ((count ?? 0) === 0) {
    await supabase.from('retail_items').upsert(
      retailItems.map((item, i) => ({
        key:        item.key,
        label:      item.label,
        price:      item.price,
        price_key:  item.priceKey,
        total_key:  item.totalKey,
        sort_order: i + 1,
        is_active:  true,
      })),
      { onConflict: 'key', ignoreDuplicates: true },
    );
  }

  const { data } = await supabase
    .from('retail_items')
    .select('id, key, label, price, price_key, total_key, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (data || []).map((row) => ({ ...row, price: Number(row.price) }));
}

export async function getRetailItems(): Promise<RetailItem[]> {
  const rows = await getRetailItemRows();
  if (rows.length === 0) return retailItems;
  return rows.map((row) => ({
    key:      row.key,
    label:    row.label,
    price:    row.price,
    priceKey: row.price_key,
    totalKey: row.total_key,
  }));
}
