# Project Delivery Assistant

An n8n workflow that turns project meeting transcripts into tracked actions and risks, calculates project health, drafts a weekly status report, and sends it to the project manager on Telegram for approval.

Built as the capstone project for the **Gen AI for Business** course (Project 2: Consulting or Project Delivery Assistant). All data in this repository is **fictional**.

By [SanthoshKamatchiP](https://github.com/SanthoshKamatchiP)

## The problem

After every project meeting, someone turns the discussion into actions, risks and a weekly report. Owners and dates stay vague ("someone should ask Finance"), the same blockers repeat across meetings, and unapproved requests (such as an added WhatsApp feature) can quietly become part of the plan.

## What it does

1. Reads meeting transcripts (a Google Drive folder, or a form).
2. Gemini extracts actions, risks, issues, decisions and scope changes as JSON.
3. A Code node cleans the result: flags missing owners and unclear dates, and marks scope changes as "not approved".
4. Results are logged in Google Sheets (`actions_log`, `risks_log`).
5. Sheet formulas calculate project health (overdue tasks, schedule variance, Red/Amber/Green status).
6. Gemini drafts a one-page weekly report, saved in the `weekly_report` tab.
7. A dashboard chart (drawn by QuickChart from the Sheet numbers) and a short summary go to Telegram.
8. The project manager taps **Approve** or **Decline** in Telegram. The decision is saved in the Sheet.

## Where AI is used, and where it isn't

| Generative AI (Gemini) | Code and formulas (no AI) |
|---|---|
| Reads transcripts and extracts items | Overdue tasks, progress and RAG status (Sheet formulas) |
| Drafts the weekly report | Missing-owner flags and the "not approved" note on scope changes |
| | The dashboard chart, drawn from Sheet numbers so figures cannot be misprinted |
| | Human approval before a report is final |

## Tech stack

n8n (Cloud) · Google Gemini API · Google Sheets · Google Drive · Telegram Bot API · QuickChart

## Repository structure

```
project-delivery-assistant/
├── README.md
├── CHANGELOG.md
├── workflows/        n8n workflow export (JSON)
├── prompts/          extraction prompt and report prompt
├── scripts/          JavaScript used in the n8n Code nodes
├── data/             project tracker (.xlsx) and fictional transcripts
├── docs/             overview PDF, presentation, flow diagram
└── screenshots/      dashboard, Telegram, Sheets, workflow canvas
```

## How to run it

Credentials are not included. You need your own accounts.

1. In n8n, choose **Import from file** and select the JSON in `workflows/`.
2. Select or create credentials for each node: Google Gemini API key (Google AI Studio), Google Sheets OAuth2, Google Drive OAuth2, Telegram bot token (from @BotFather).
3. Upload `data/CRM_Rollout_Project_Tracker.xlsx` to Google Drive, open it with Google Sheets and choose **File > Save as Google Sheets**. Select this copy in each Google Sheets node.
4. Put the transcripts from `data/transcripts/` in a Google Drive folder and select it in the `List transcripts` node. Alternatively, use the form trigger and paste one transcript at a time, starting at the `MEETING:` line.
5. Replace the placeholders in the imported workflow:
   - `YOUR_TELEGRAM_CHAT_ID` in the three Telegram nodes
   - `YOUR_GOOGLE_SHEET_ID` in each Google Sheets node (select your Sheet; tabs are matched by name)
   - `YOUR_DRIVE_FOLDER_ID` in the `List transcripts` node and the (deactivated) Drive trigger
   - `PASTE_YOUR_GOOGLE_SHEET_LINK_HERE` in the `Build short summary` Code node (see `scripts/03_build_short_summary.js`)
6. Check the Gemini model names in the Gemini nodes, because model names change over time.
7. Click **Execute workflow**, then tap **Approve** in Telegram.

## Results from the test run

Test on three fictional transcripts (not a real deployment):

- 14 actions and 19 other items (risks, issues, decisions, scope changes) logged
- 13 of 14 actions (93%) had a named owner; the other was flagged for review
- Project health: Amber (41% complete vs 46.7% planned)
- Report approved by the project manager in Telegram

Time saved was not measured.

## Limitations

- AI output varies between runs. Owners, flags, classifications and duplicate items can differ, so every report needs human review.
- The free Gemini tier has daily request limits, so a real deployment needs a paid plan.
- Real transcripts are confidential and need approved tools, privacy controls and restricted Sheet access.
- Triggers (form and Drive folder) are alternatives for testing. A real deployment would receive transcripts automatically from the meeting tool.

## Ideas for future versions

- Split into two workflows: one extracts each transcript, one writes the weekly report on a schedule
- Error alerts and retries
- Use the current date instead of a fixed report date
- Auto-capture from Teams, Meet or Zoom
- Portfolio view and health trends over time
- Client reports in more languages

See [CHANGELOG.md](CHANGELOG.md) for the version history.
