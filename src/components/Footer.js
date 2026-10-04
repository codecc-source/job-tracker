"use client";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";

export default function Footer({ onInfo }) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  return (
    <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs text-muted">
      <span>Created by: CTJR {year}</span>
      <button onClick={onInfo} className="inline-flex items-center gap-1 hover:text-text">
        <Info size={13} />Where is my data?
      </button>
    </footer>
  );
}
