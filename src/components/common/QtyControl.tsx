interface Props {
  value: number;
  max: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}

export default function QtyControl({ value, max, onChange, disabled }: Props) {
  return (
    <div className="qty" role="group" aria-label="Quantity">
      <button type="button" aria-label="Decrease" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}>−</button>
      <span>{value}</span>
      <button type="button" aria-label="Increase" disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
