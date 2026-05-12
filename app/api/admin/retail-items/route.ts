import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getRetailItemRows } from '@/lib/getRetailItems';

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (profile.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const items = await getRetailItemRows();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (profile.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { label, price } = (await req.json()) as { label: string; price: number };
  if (!label?.trim()) return NextResponse.json({ error: 'Label is required' }, { status: 400 });
  if (price == null || isNaN(Number(price)) || Number(price) < 0) {
    return NextResponse.json({ error: 'Enter a valid price' }, { status: 400 });
  }

  const key = label.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!key) return NextResponse.json({ error: 'Label must contain at least one letter or digit' }, { status: 400 });

  const supabase = supabaseAdmin();

  const { data: existing } = await supabase
    .from('retail_items')
    .select('price_key, sort_order');

  const priceNums = (existing || [])
    .map((r) => r.price_key as string)
    .filter((k) => k?.startsWith('Price'))
    .map((k) => parseInt(k.replace('Price', '')) || 1);

  const nextNum   = priceNums.length > 0 ? Math.max(...priceNums) + 1 : 37;
  const maxOrder  = (existing || []).reduce((m, r) => Math.max(m, r.sort_order ?? 0), 0);
  const priceKey  = `Price${nextNum}`;
  const totalKey  = `Total${nextNum}`;

  const { data, error } = await supabase
    .from('retail_items')
    .insert({
      key,
      label: label.trim(),
      price: Number(price),
      price_key:  priceKey,
      total_key:  totalKey,
      sort_order: maxOrder + 1,
      is_active:  true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'An item with this name already exists' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: { ...data, price: Number(data.price) } });
}
