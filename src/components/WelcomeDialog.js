"use client";
import { HardDrive, Save, Smartphone, Eraser, Clock, Cloud } from "lucide-react";
import Modal from "./Modal";
import { btn, btnPrimary } from "./ui";

const POINTS = [
  [HardDrive, "No account? Your list stays on this device", "You can use the app without creating an account. Everything you add is saved in this browser, on this device only."],
  [Cloud, "Add an approved account for cloud saves", "An account is optional and needs to be approved by the app owner. If you add an approved account, your list can be saved to the cloud so your data is safely available beyond this one device."],
  [Smartphone, "Easy access on other devices", "With an approved account, you can sign in on another phone, tablet, or computer and access your saved data without manually moving backup files between devices."],
  [Save, "Backups are still a good idea", "You can also tap Save backup to download a small file. Keep it somewhere safe, like Documents on a laptop or the Files app on a phone. A backup gives you an extra copy of your data."],
  [Eraser, "Clearing browser data can erase local data", "If you're using the app without an account, clearing browser data, cookies or site data, or using a private window may delete your local list. An account or backup helps protect your data."],
  [Clock, "On iPhone or iPad", "Safari may remove saved website data if you don't visit for 7 days. Tap Share, then Add to Home Screen, to help prevent this. With an approved account, your cloud-saved data remains accessible when you sign back in."],
];

export default function WelcomeDialog({ onClose, onSignIn }) {
  const points = onSignIn
    ? [...POINTS, [Cloud, "Want your list on every device?", "Ask the app owner to add your email address for you to be able to sync your data automatically on the cloud. It is optional."]]
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
