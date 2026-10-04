export const STATUSES = [
  { id: "saved",     label: "Saved",                         active: false },
  { id: "applied",   label: "Applied",                       active: true  },
  { id: "contacted", label: "Contacted / Response received", active: true  },
  { id: "interview", label: "Interview",                     active: true  },
  { id: "offer",     label: "Offer",                         active: false },
  { id: "rejected",  label: "Rejected",                      active: false },
  { id: "withdrawn", label: "Withdrawn",                     active: false },
  { id: "ghosted",   label: "Ghosted",                       active: false },
];

export const isActive = (id) => STATUSES.find((s) => s.id === id)?.active ?? false;
export const statusLabel = (id) => STATUSES.find((s) => s.id === id)?.label ?? id;
