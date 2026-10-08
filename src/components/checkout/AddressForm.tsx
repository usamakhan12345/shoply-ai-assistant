import type { Address } from '@/types';

interface Props {
  value: Address;
  onChange: (a: Address) => void;
  errors: Partial<Record<keyof Address, string>>;
}

const FIELDS: { key: keyof Address; label: string; placeholder?: string; type?: string; full?: boolean }[] = [
  { key: 'full_name', label: 'Full name', full: true },
  { key: 'phone', label: 'Phone number', placeholder: '+92 300 1234567', type: 'tel' },
  { key: 'country', label: 'Country' },
  { key: 'line1', label: 'Street address', placeholder: 'House / street / area', full: true },
  { key: 'city', label: 'City' },
  { key: 'postal_code', label: 'Postal code' },
];

export default function AddressForm({ value, onChange, errors }: Props) {
  return (
    <div className="fields">
      {FIELDS.map((f) => (
        <div key={f.key} className={`field${f.full ? ' full' : ''}`}>
          <label htmlFor={`addr-${f.key}`}>{f.label}</label>
          <input
            id={`addr-${f.key}`}
            className="input"
            type={f.type ?? 'text'}
            placeholder={f.placeholder}
            value={value[f.key]}
            onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
            aria-invalid={!!errors[f.key]}
          />
          {errors[f.key] && <span className="err">{errors[f.key]}</span>}
        </div>
      ))}
    </div>
  );
}
