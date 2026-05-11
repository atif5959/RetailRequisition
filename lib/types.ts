export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';

export type FormField = {
  id: string;
  label: string;
  field_key: string;
  field_type: FieldType;
  required: boolean;
  options: string[] | null;
  sort_order: number;
  is_active: boolean;
};

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
