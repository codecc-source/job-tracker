"use client";
import { HardDrive, Save, Smartphone, Eraser, Clock, Cloud } from "lucide-react";
import Modal from "./Modal";
import { btn, btnPrimary } from "./ui";

const POINTS = [
  [HardDrive, "Your list stays on this device", "There is no account. Everything you add is saved in this browser, on this device only."],
  [Save, "Save a backup often", "Tap Save backup to get a small file. Keep it in a folder you can easily find, like Documents on a laptop or the Files app on a phone. Putting a copy in Google Drive or emailing it to yourself is even safer."],
  [Smartphone, "Changing phone, laptop or browser?", "Your list will not come with you. Save a backup first, then open it on the other device with Backup and restore."],
  [Eraser, "Clearing browser data erases your list", "Clearing history, cookies or site data, or using a private window, will delete everything here."],
  [Clock, "On iPhone or iPad", "Safari erases saved data if you don't visit for 7 days. Tap Share, then Add to Home Screen, to prevent this."],
];

export default function WelcomeDialog({ onClose, onSignIn }) {
  const points = onSignIn
    ? [...POINTS, [Cloud, "Want your list on every device?", "Create a free account to sync your list between your phone and laptop. It is optional."]]
    : POINTS;
  return (
    <Modal title="Before you start" onClose={onClose}>
      <ul className="space-y-3">
        {points.map(([Icon, title, text]) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><Icon size={16} /></span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <button onClick={onClose} className={btnPrimary + " w-full justify-center"}>Got it</button>
        {onSignIn && <button onClick={onSignIn} className={btn + " w-full justify-center"}>Sign in to sync</button>}
      </div>
    </Modal>
  );
}
