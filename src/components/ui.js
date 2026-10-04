const focus = "outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export const field = `w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted/60 ${focus}`;
export const selectSm = `rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm text-text ${focus}`;
export const btn = "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-line/60 disabled:opacity-50";
export const btnPrimary = "inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50";
export const btnDanger = "inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger/10";

export function Field({ label, children }) {
  return (
    <label className="block text-xs font-medium text-muted">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
