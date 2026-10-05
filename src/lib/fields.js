export const MODES = ["Remote", "Hybrid", "On-site"];
export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

export const PERIODS = [
  { id: "month", label: "per month" },
  { id: "year", label: "per year" },
  { id: "hour", label: "per hour" },
  { id: "day", label: "per day" },
];

export const CURRENCIES = [
  ["PHP", "Philippine peso"], ["USD", "US dollar"], ["EUR", "Euro"], ["GBP", "British pound"],
  ["PLN", "Polish zloty"], ["AUD", "Australian dollar"], ["CAD", "Canadian dollar"], ["SGD", "Singapore dollar"],
  ["JPY", "Japanese yen"], ["INR", "Indian rupee"], ["AED", "UAE dirham"], ["NZD", "New Zealand dollar"],
  ["CHF", "Swiss franc"], ["SEK", "Swedish krona"], ["HKD", "Hong Kong dollar"], ["MYR", "Malaysian ringgit"],
  ["IDR", "Indonesian rupiah"], ["THB", "Thai baht"], ["KRW", "South Korean won"], ["CNY", "Chinese yuan"],
  ["BRL", "Brazilian real"], ["MXN", "Mexican peso"], ["ZAR", "South African rand"],
].map(([code, name]) => ({ code, name }));

export const EDITABLE = [
  "title", "company", "url", "applied_at", "source", "location", "work_mode", "job_type",
  "salary_currency", "salary_min", "salary_max", "salary_period", "deadline", "priority",
  "contact_name", "contact_email", "contact_phone", "resume_version",
  "next_step", "next_step_date", "notes", "job_description", "rejection_reason",
];

export const emptyFields = () => Object.fromEntries(EDITABLE.map((k) => [k, k === "priority" ? 0 : ""]));

export function makeTombstone(id) {
  const now = new Date().toISOString();
  return {
    ...emptyFields(), id, status: "applied", applied_at: now.slice(0, 10), salary: "",
    notes: "", job_description: "", ghosted_auto: false, reapply_dismissed: false,
    last_update_at: now, updated_at: now, deleted_at: now,
  };
}
