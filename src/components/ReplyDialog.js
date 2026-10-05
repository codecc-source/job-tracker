"use client";
import { useState } from "react";
import Modal from "./Modal";
import { field, btnPrimary, btn, Field } from "./ui";

export default function ReplyDialog({ app, onSave, onClose }) {
  const [text, setText] = useState(app.next_step ?? "");
  const [date, setDate] = useState(app.next_step_date ?? "");

  const save = async (e) => {
    e.preventDefault();
    const status = date ? "interview" : ["saved", "applied"].includes(app.status) ? "contacted" : app.status;
    await onSave(app.id, { next_step: text.trim(), next_step_date: date, status, ghosted_auto: false });
    onClose();
  };

  return (
    <Modal title="Got a reply?" onClose={onClose}>
      <p className="text-sm text-muted">Did they email, message or call you? Write down what they said so you don't forget.</p>
      <form onSubmit={save} className="space-y-3">
        <Field label="What did they say?">
          <textarea rows={3} className={field} placeholder="Example: HR will call me on Friday at 3pm" value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Field label="Interview or next step date (if they gave one)" hint="With a date, this job moves to Interview. Without one, it moves to Response received.">
          <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div className="flex gap-2">
          <button className={btnPrimary}>Save update</button>
          <button type="button" onClick={onClose} className={btn}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
