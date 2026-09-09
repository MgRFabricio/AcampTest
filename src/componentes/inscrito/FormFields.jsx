import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function Section({ num, title, children, className }) {
  return (
    <div className={`bg-white rounded-xl border border-border p-5 ${className || ''}`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <span className="w-7 h-7 rounded-full bg-hero text-white text-xs font-bold flex items-center justify-center">{num}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

export function Field({ label, required, error, hint, children, full }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-1">{children}</div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

export function TextField({ label, required, error, value, onChange, ...props }) {
  return (
    <Field label={label} required={required} error={error}>
      <Input value={value || ''} onChange={(e) => onChange?.(e.target.value)} {...props} />
    </Field>
  );
}

export function SelectField({ label, required, error, value, onChange, options, placeholder, full }) {
  return (
    <Field label={label} required={required} error={error} full={full}>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={placeholder || '—'} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function RadioChoice({ label, value, onChange, options, full }) {
  return (
    <Field label={label} full={full}>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${value === o.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-white hover:bg-accent border-input'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function TextareaField({ label, required, error, value, onChange, full, ...props }) {
  return (
    <Field label={label} required={required} error={error} full={full}>
      <Textarea value={value || ''} onChange={(e) => onChange?.(e.target.value)} {...props} />
    </Field>
  );
}