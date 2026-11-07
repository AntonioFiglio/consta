import { Search, X } from "lucide-react";

export function SearchField({ value, onChange, placeholder, label }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="search-field" role="search" aria-label={label}>
      <Search size={16} strokeWidth={1.8} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {value && <button type="button" className="search-field-clear" aria-label="Limpar pesquisa" title="Limpar pesquisa" onClick={event => {
        const input = event.currentTarget.parentElement?.querySelector("input");
        onChange("");
        input?.focus();
      }}><X size={14} aria-hidden="true" /></button>}
    </div>
  );
}
