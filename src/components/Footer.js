"use client";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";

export default function Footer({ onInfo }) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  const link = "underline hover:text-text";

  return (
    <footer className="mt-12 space-y-2 border-t border-line pt-4 text-xs text-muted">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>Created by: CTJR {year}</span>
        <button onClick={onInfo} className="inline-flex items-center gap-1 hover:text-text">
          <Info size={13} />How your data is saved
        </button>
      </div>
      <p>
        Icons created by{" "}
        <a href="https://www.flaticon.com/authors/magnific" target="_blank" rel="noopener noreferrer" className={link}>Magnific</a>
        {" - "}
        <a href="https://www.flaticon.com" target="_blank" rel="noopener noreferrer" className={link}>Flaticon</a>
      </p>
    </footer>
  );
}
