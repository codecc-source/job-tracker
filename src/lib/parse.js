const SOURCES = {
  "linkedin.com": "LinkedIn", "indeed.com": "Indeed", "jobstreet.com": "JobStreet",
  "kalibrr.com": "Kalibrr", "pracuj.pl": "Pracuj.pl", "justjoin.it": "Just Join IT",
  "nofluffjobs.com": "No Fluff Jobs",
};

export function parsePaste(text) {
  const t = text.trim();
  const url = t.match(/https?:\/\/\S+/)?.[0] ?? "";
  const rest = t.replace(url, "").trim();
  const [title = "", ...tail] = rest.split(/\s+(?:at|@|-|–|\|)\s+/i);
  let source = "";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    source = Object.entries(SOURCES).find(([d]) => host.endsWith(d))?.[1] ?? host;
  } catch {}
  return { title: title.trim(), company: tail.join(" - ").trim(), url, source };
}
