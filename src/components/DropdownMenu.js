"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function DropdownMenu({ button, label, items, className = "" }) {
  return (
    <Menu>
      <MenuButton aria-label={label} className={className}>{button}</MenuButton>
      <MenuItems anchor="bottom end" className="z-40 w-72 rounded-xl border border-line bg-surface p-1 shadow-2xl [--anchor-gap:6px] focus:outline-none">
        {items.filter(Boolean).map((it) => {
          const Icon = it.icon;
          return (
            <MenuItem key={it.label}>
              <button
                onClick={it.onClick}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm data-[focus]:bg-line/60 ${it.danger ? "text-danger" : "text-text"}`}
              >
                {Icon && <Icon size={16} className="mt-0.5 shrink-0" />}
                <span>
                  <span className="block font-medium">{it.label}</span>
                  {it.desc && <span className="block text-xs text-muted">{it.desc}</span>}
                </span>
              </button>
            </MenuItem>
          );
        })}
      </MenuItems>
    </Menu>
  );
}
