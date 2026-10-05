export function AuthField({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-ink-70">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-inner bg-white px-4 py-3 text-[14.5px] text-ink shadow-nav outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
      />
      {hint && <span className="mt-1.5 block text-[12px] text-ink-50">{hint}</span>}
    </label>
  );
}
