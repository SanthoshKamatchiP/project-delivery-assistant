# Changelog

All notable changes to this project are listed here. Newest first.

## [Unreleased]

- (add your next changes here)

## [1.0.0] - Capstone version (October 2026)

First working version, submitted as the Gen AI for Business capstone.

### Added
- n8n workflow: Drive folder or form -> Gemini extraction -> Code cleanup -> Google Sheets logs
- Project tracker with formulas (overdue tasks, schedule variance, RAG status)
- Weekly report drafted by Gemini and saved in the `weekly_report` tab
- Dashboard chart (QuickChart) and short summary sent to Telegram
- Telegram Approve/Decline step, with the decision recorded in the Sheet
- Three fictional meeting transcripts, prompts and Code node scripts

### Known limitations
- AI output varies between runs, so every report needs human review
- Free Gemini tier request limits
- Extraction and reporting run in one workflow
