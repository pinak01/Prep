# 7-Day CS Interview Preparation

Localhost study platform for LSEG Engineering Graduate Assessment Centre prep.

Focus: DBMS, Networks, OS, Linux, OOP, Cybersecurity, and cross-topic system thinking.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- localStorage progress (no backend)

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Structure

```
src/
  types/curriculum.ts      # Data model
  data/curriculum/         # Day → Module → Page curriculum
  context/ProgressContext  # Progress + localStorage
  pages/                   # Dashboard, Day, Study, Quiz, Interview, Progress
  components/              # Layout, sidebar, study renderers
```

## Progress rules

A day is **Completed** when:

1. All study pages for that day are marked complete
2. The day's assessment has been attempted

Future days are never locked.

## Next steps

Detailed study content and quiz question banks are authored into the data files under `src/data/curriculum/`.
