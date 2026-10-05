"use client";
import { useEffect, useState } from "react";
import { CURRENCIES } from "@/lib/fields";
import { field, btn } from "./ui";

export default function CurrencyInput({ value, onChange }) {
  const known = CURRENCIES.some((c) => c.code === value);
  const [other, setOther] = useState(!!value && !known);

  useEffect(() => { if (other && known) setOther(false); }, [value]);

  if (other) {
    return (
      <div className="flex gap-1">
        <input className={field} value={value} maxLength={12} placeholder="Type it" onChange={(e) => onChange(e.target.value.toUpperCase())} />
        <button type="button" className={btn} onClick={() => { setOther(false); onChange(""); }}>List</button>
      </div>
    );
  }

  return (
    <select
      className={field}
      value={value}
      onChange={(e) => {
        if (e.target.value === "__other") { setOther(true); onChange(""); }
        else onChange(e.target.value);
      }}
    >
      <option value="">—</option>
      {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}
      <option value="__other">Other (type it)…</option>
    </select>
  );
}
