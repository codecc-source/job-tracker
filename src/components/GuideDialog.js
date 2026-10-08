"use client";
import { ChevronDown } from "lucide-react";
import Modal from "./Modal";
import { btnPrimary } from "./ui";

const SECTIONS = [
  ["Getting started", [
    ["No account needed.", "Everything you add is saved in this browser, on this device. Refreshing or closing the page does not remove it."],
    ["Add a job.", "Click Add a job at the top right (on a phone, the round + button). You need at least a title, a company, or a link."],
    ["Back up your list.", "Open the menu (the three dots), then Save backup. Without an account, clearing your browser's site data or using a private window can erase your list."],
  ]],
  ["Adding and editing a job", [
    ["Job title, Company.", "The role and the employer."],
    ["Link to the job post.", "Paste the link with or without https://. The app tidies it, removes tracking bits like utm_ parameters, and rejects things that aren't web addresses. A matching Where did you find it? fills in for known sites."],
    ["Date you applied.", "Defaults to today."],
    ["Where are you in the process?", "The job's status."],
    ["More details.", "Source, location, work setup, job type, salary (currency, from, to, paid per), application deadline, a 1 to 5 star rating of how much you want it, contact person, resume version, notes, and a pasted job description."],
    ["When editing.", "You also get What did they say?, Interview or next step date, and Rejection reason or feedback."],
  ]],
  ["Statuses", [
    ["Saved.", "Found it, haven't applied yet."],
    ["Applied.", "You sent your application."],
    ["Contacted / Response received.", "They replied."],
    ["Interview.", "You have an interview or a scheduled next step."],
    ["Offer, Rejected, Withdrawn.", "Closed outcomes."],
    ["Ghosted.", "They never replied. The app can set this for you (see Automatic Ghosted)."],
  ]],
  ["Buttons on a job card", [
    ["Status dropdown.", "Changes the status."],
    ["Got a reply?", "Record what they said and an optional date. With a date the job moves to Interview. Without one it moves to Contacted."],
    ["View job details / Edit.", "See everything saved, or change it."],
    ["Link icon.", "Opens the job post in a new tab."],
    ["More actions: I followed up.", "Use after you email or call them. It restarts the \"no news\" count."],
    ["More actions: Add to calendar.", "Download events for the interview, the deadline, and an optional follow-up reminder."],
    ["More actions: Delete.", "Removes the job. A message with an Undo button appears for a few seconds."],
  ]],
  ["Select several jobs at once", [
    ["Select.", "Click Select above the list, then tick the jobs you want. Select all picks every job currently shown (after search and filters)."],
    ["Change status to.", "Applies one status to all selected jobs."],
    ["Delete.", "Asks for confirmation, then deletes them. You get an Undo button for a few seconds."],
    ["Done.", "Leaves selection mode."],
  ]],
  ["Reminders (Needs attention)", [
    ["Interview or next step.", "Shows from 7 days before, and for 2 weeks after it passes (with an Add update button)."],
    ["Deadline.", "For Saved jobs, from 14 days before the deadline and after it passes."],
    ["No news.", "For Applied, Contacted, and Interview jobs, it counts days since you last touched the job. Edits, status changes, Got a reply?, I followed up, and Apply again count. Colors turn yellow, orange, and red at the limits in Settings."],
    ["Apply again.", "For Rejected or Ghosted jobs, after the Settings limit (3 or 6 months) since the last update. Apply again moves it back to Applied. Not now hides the suggestion."],
  ]],
  ["Automatic Ghosted", [
    ["When.", "An Applied, Contacted, or Interview job becomes Ghosted when its most recent date (applied, deadline, or next step) and its last edit are all older than your limit in Settings (1, 2, or 3 months). A Saved job becomes Ghosted when its deadline passed that long ago."],
    ["Late entries count.", "Jobs you add with old dates are checked too."],
    ["Restart the clock.", "Edit the job or change its status."],
  ]],
  ["Search, filter, and sort", [
    ["Search and filters.", "Search by company or title, filter by status or source, and use Clear filters to reset."],
    ["Sort.", "Needs attention first, Deadline soonest, Highest priority, Newest applied, Recently updated, or Company A to Z."],
    ["Tiles.", "The tiles at the top jump to jobs that need attention, are waiting for a reply, or are at Interview."],
  ]],
  ["Calendar and weekly stats", [
    ["Calendar.", "Per job: More actions > Add to calendar. For everything: Menu > Add upcoming dates to calendar. You get a file to open in Apple, Google, or Outlook calendar."],
    ["Weekly stats.", "Jobs applied this week, waiting for a reply, interviews, how often companies responded, applications per week, and results by source and by resume version."],
  ]],
  ["Account and sync (optional)", [
    ["Invite-only.", "Only emails the owner has added can sign in. Others keep using the app on their own device."],
    ["Sign in.", "Click the cloud icon, enter your email, and type the code we email you. Check spam."],
    ["When it syncs.", "A couple of seconds after you add, edit, or delete a job, when your device comes back online, every 10 minutes while the page is open, and when you click Sync now."],
    ["Settings sync too.", "Your reminder limits, default status, default currency, and starting view follow you across devices. Look (dark or light) stays per device."],
    ["Sign out.", "Syncs your latest changes, then removes the list from this device. It stays safe in your account and returns when you sign back in."],
    ["Delete my account.", "Permanently deletes your account, your online list, and the list on this device."],
  ]],
  ["Backup, restore, and spreadsheet", [
    ["Save backup file / Copy backup.", "Keeps a copy of your list and settings."],
    ["Choose file or paste.", "Restore a backup. Add to my list merges; Replace my list makes your list match the file."],
    ["Save as spreadsheet.", "Exports a CSV to read in Excel or Google Sheets. It can't be restored into the app."],
    ["Clear all data.", "Deletes every job from this device and, if you're signed in, from your account."],
  ]],
  ["Settings", [
    ["Look and What to show first.", "Dark, light, or device default, and whether to open on all jobs or only those needing attention."],
    ["Starting status and currency.", "Defaults for new jobs."],
    ["No news limits.", "Days before the yellow, orange, and red reminders."],
    ["Ghosted and Apply again limits.", "How long before jobs are auto-Ghosted or you're nudged to apply again."],
  ]],
];

export default function GuideDialog({ onClose }) {
  return (
    <Modal title="How Job Tracker works" onClose={onClose} wide>
      <p className="text-sm text-muted">Tap a topic to open it.</p>
      <div className="space-y-2">
        {SECTIONS.map(([title, points], i) => (
          <details key={title} open={i === 0} className="group rounded-xl border border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-medium">
              <span>{title}</span>
              <ChevronDown size={16} className="text-muted transition-transform group-open:rotate-180" />
            </summary>
            <ul className="space-y-2 border-t border-line p-3 text-sm">
              {points.map(([label, text]) => (
                <li key={label}><span className="font-medium">{label}</span> <span className="text-muted">{text}</span></li>
              ))}
            </ul>
          </details>
        ))}
      </div>
      <button onClick={onClose} className={btnPrimary}>Got it</button>
    </Modal>
  );
}
