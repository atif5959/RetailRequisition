import FormRenderer from '@/components/FormRenderer';
import { supabaseAdmin } from '@/lib/supabaseClient';

export default async function RetailFormPage() {
  const supabase = supabaseAdmin();
  const { data: fields } = await supabase
    .from('form_fields')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Retail Requisition Form</h1>
          <p className="text-slate-600 mt-2">Please fill the required details and submit your request.</p>
        </div>
        <FormRenderer fields={fields || []} />
      </div>
    </main>
  );
}
