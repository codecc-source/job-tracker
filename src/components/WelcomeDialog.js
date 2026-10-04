"use client";
import { HardDrive, Download, Smartphone, Eraser, Clock } from "lucide-react";
import Modal from "./Modal";
import { btnPrimary } from "./ui";

const POINTS = [
  [HardDrive, "Stored on this device only", "No account and no server. Your applications live in this browser."],
  [Download, "Back up regularly", "Use Export to save a .json file somewhere safe: Drive, email, a USB stick."],
  [Smartphone, "Switching devices or browsers", "Your data doesn't follow you. Export on one, Import on the other. Chrome and Safari on the same phone don't share data."],
  [Eraser, "Clearing data wipes everything", "Clearing cache, cookies or site data, or using a private window, deletes all your applications."],
  [Clock, "iPhone and iPad Safari", "Safari deletes site data after 7 days without a visit. Use Add to Home Screen to avoid this."],
];

export default function WelcomeDialog({ onClose }) {
  return (
    <Modal title="Before you start" onClose={onClose}>
      <ul className="space-y-3">
        {POINTS.map(([Icon, title, text]) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><Icon size={16} /></span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={onClose} className={btnPrimary + " w-full justify-center"}>Got it</button>
    </Modal>
  );
}
