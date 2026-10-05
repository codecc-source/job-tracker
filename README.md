# Job Tracker

A local-first job application tracker. Your data stays in your browser, so you can start using it right away without an account. Optional, invite-only cloud sync lets approved users see the same list on their phone and laptop.

## Features

- Track applications, statuses, notes, ratings, salary info + other useful information for job searchers
- Works without an account. Cloud sync is optional.
- Passwordless sign-in with a one-time email code
- Sync across devices, with each user able to read only their own data
- Reminders for jobs that need attention: upcoming interviews, deadlines, and jobs with no news
- Backup and restore, CSV export, weekly stats, and calendar events

---

## Using the app

### Getting started

- **No account needed.** Everything you add is saved in your browser, on this device only. Refreshing or closing the page does not remove it.
- Clearing your browser's site data, or using a private window, can delete a list that isn't backed up or synced. Save a backup now and then (see [Backup and restore](#backup-and-restore)).
- On iPhone or iPad, Safari may remove saved website data if you don't visit for a while. Tap **Share > Add to Home Screen** to help prevent this.
- The **Menu (⋯) > How your data is saved** option shows the welcome notes again.

### Creating an account and syncing (optional)

Cloud sync is invite-only. You need the owner of the app to add your email first.

1. Click the **cloud icon** at the top right.
2. Enter your email and click **Email me a sign-in code**.
3. Open the email, copy the code, and type it into the app, then click **Sign in**. Check your spam folder if you don't see it.
4. After you sign in, your list syncs automatically, and a list you already built on this device is merged into your account.

Good to know:

- If you see "This app is invite-only", your email hasn't been added yet. Ask the owner, then try again.
- After a code is sent, you must wait 60 seconds before requesting another.
- Use **Use a different email** if you typed the wrong address.
- No password is needed. You get a new code each time you sign in.

**Your account screen**

| Button | What it does |
|---|---|
| **Sync now** | Syncs your list right away. It also syncs by itself a few seconds after each change, and when you come back to the page. |
| **Sign out** | Asks you to confirm. Your latest changes are synced first, then you're signed out and your list is **removed from this device**. It stays safe in your account, and signing back in restores it. If the final sync fails (for example, you're offline), you stay signed in so nothing is lost. |
| **Delete my account** | Asks you to confirm. Deletes your account, your online copy, and the list on this device. This can't be undone. |

### Adding a job

Click **Add a job** at the top right of the page (on a phone, use the round **+** button at the bottom right).

| Field | What to enter |
|---|---|
| **Job title** | The role, for example "Frontend Developer". |
| **Company** | The company name. |
| **Link to the job post** | The URL of the listing. "Where did you find it?" fills in automatically from known sites, and you'll be warned if you already added the same link. |
| **Date you applied** | Defaults to today. |
| **Where are you in the process?** | The status of the job (see [Statuses](#statuses)). |

You need at least a title, a company, or a link to add a job. Open **More details** for the rest:

| Field | What to enter |
|---|---|
| **Where did you find it?** | LinkedIn, a friend, the company website, and so on. Used for filters and stats. |
| **Location** | Where the job is. |
| **Work setup** | Remote, Hybrid, or On-site. |
| **Job type** | Full-time, Part-time, Contract, Freelance, or Internship. |
| **Salary: Currency, From, To, Paid** | The pay range and how it's paid (per month, year, hour, or day). |
| **Application deadline** | The last day to apply. |
| **How much do you want this job?** | A 1 to 5 star rating of how much you want it. |
| **Contact person: Name, Phone, Email** | Your recruiter or hiring manager. |
| **Resume or cover letter version** | Which version you sent, for example "Resume v3". Used in stats. |
| **Your notes** | Anything you want to remember. |
| **Job description** | Paste a copy of the post, because job posts often disappear. |

Click **Add to my list** to save. Editing a job later adds a **Next step** section (what they said, and the interview or next step date) and a field for a **rejection reason or feedback**.

### Statuses

| Status | Meaning |
|---|---|
| **Saved** | You found the job but haven't applied yet. |
| **Applied** | You sent your application. |
| **Contacted / Response received** | They replied to you. |
| **Interview** | You have an interview or a scheduled next step. |
| **Offer** | You received an offer. |
| **Rejected** | They said no. |
| **Withdrawn** | You pulled out. |
| **Ghosted** | They never replied. |

### Your job list

**Top tiles** (click one to jump to those jobs)

- **Need attention**: jobs with something to act on.
- **Waiting for a reply**: jobs at Applied.
- **Interviews**: jobs at Interview.
- **Applied this week**: opens the stats page.

**Needs attention** shows jobs with an interview or next step in the coming week (or one that just passed), a "Saved" job with an approaching or passed deadline, jobs with no news for a while, and rejected or ghosted jobs you may want to apply to again. Switch between **All** and **Needs attention** with the buttons above the list.

**Search, filter, and sort**

- **Search company or title** finds jobs by text.
- **All statuses** and **All sources** filter the list.
- **Sort** by: Needs attention first, Deadline soonest, Highest priority, Newest applied, Recently updated, or Company A to Z.
- **Clear filters** resets everything.

### What each job card lets you do

| Control | What it does |
|---|---|
| **Status dropdown** | Changes the status of the job. |
| **Got a reply?** | Opens a short form. Write what they said and, if they gave one, the interview or next step date. With a date the job moves to **Interview**. Without one it moves to **Response received**. |
| **View job details** | Shows everything you saved for the job. |
| **Edit** | Change any field. |
| **Open link icon** | Opens the job post in a new tab. |
| **More actions (⋯) > I followed up** | Use this after you email or call them. It restarts the "no news" count. |
| **More actions (⋯) > Add to calendar** | Downloads calendar events (see below). |
| **More actions (⋯) > Delete** | Removes the job after a confirmation. |

Buttons also appear inside attention notes: **Mark as Ghosted**, **Add update**, **Apply again**, and **Not now**.

**Colored bars** on the cards show how urgent a job is.

**No news reminders:** for jobs at Applied, Contacted, or Interview, the app counts the days since you last touched the job. Saving an edit, changing the status, **Got a reply?**, **I followed up**, and **Apply again** all count. Past the yellow, orange, and red limits in Settings, the card shows "No news for N days".

**Automatic Ghosted:** a job at Applied, Contacted, or Interview is marked Ghosted when its most recent date (the date you applied, the deadline, or the interview or next step date) is more than 1, 2, or 3 months in the past (your choice in Settings, 3 months by default), and you haven't edited or updated it since. A Saved job is marked Ghosted when its deadline passed that long ago. This also applies to jobs you add late with old dates, and it runs again whenever your list changes.

### Calendar

- On a job, **More actions > Add to calendar** lets you download a `.ics` file with the interview or next step date, the application deadline, and an optional follow-up reminder (tick **Also remind me to follow up** and pick a date). Events include the job link, contact person, and notes, with reminders the day before and on the day at 9 AM. There's also a **Google Calendar** link for each event.
- **Menu (⋯) > Add upcoming dates to calendar** downloads one file with every upcoming interview and deadline.
- Open the downloaded file and your calendar app will ask to add it. It works with Apple Calendar, Google Calendar, and Outlook.

### Weekly stats

Open **Weekly stats** at the top of the page.

- **Applied this week**, **Waiting for a reply**, **Interviews**, and **Heard back** (the share of jobs that moved past Applied).
- A bar chart of **applications per week** (weeks start on Monday).
- Tables of results by **where you found the job** and by **resume or cover letter version**.
- A count of all your jobs by status.

### Backup and restore

Open **Menu (⋯) > Backup and restore**.

- **Save backup file** downloads your list as a file. Keep it somewhere safe, like Documents or Google Drive.
- **Copy backup** copies it so you can paste it into a note or email.
- **Save as spreadsheet** exports your jobs as a CSV file.
- **Choose file** restores from a backup. You'll see a preview, then pick **Add to my list** (recommended, keeps what you have) or **Replace my list**. If you can't pick a file, open **Paste your backup instead**.
- **Menu (⋯) > Save backup** is a shortcut for saving the file.
- A yellow banner reminds you to back up after a while, with **Save backup** and **Remind me tomorrow** buttons.
- **Clear all data** deletes every job (and, if you're signed in, your online copy). It asks for confirmation and offers **Save backup first**. This can't be undone.

### Settings

Open **Menu (⋯) > Settings**.

| Setting | What it does |
|---|---|
| **Look** | Dark, Light, or the same as your device. |
| **What to show first** | Open on All jobs, or only jobs that need attention. |
| **Starting status for new jobs** | The status new jobs start with. |
| **Usual currency for salaries** | The default currency in the salary field. |
| **Remind me when there is no news for this many days** | Yellow, Orange, and Red warning levels (each must be larger than the one before). |
| **Mark as Ghosted when nothing has happened for** | 1, 2, or 3 months. |
| **Suggest applying again after a rejection or no reply, after** | 3 or 6 months. |

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) and React
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) for optional auth and database
- IndexedDB for local storage

## Credits

Icon created by [Magnific](https://www.flaticon.com/authors/magnific) - [Flaticon](https://www.flaticon.com)
