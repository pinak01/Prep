# Study Content Authoring Spec

Write COMPLETE interview-prep study material into TypeScript curriculum files.

## Output

Overwrite `/Users/pinak/Documents/LSEG/src/data/curriculum/dayN.ts` for your assigned day.

Import helpers from `../helpers`:
`createPage`, `section`, `p`, `h2`, `h3`, `ul`, `ol`, `code`, `table`, `callout`, `diagram`, `example`, `numerical`

Import type: `import type { Day } from '@/types/curriculum'`

## Page shape (every major page)

```ts
createPage('id', 'Title', minutes, ['objective1', ...], {
  sections: [
    section('concept', 'Concept', [p('...'), h3('Why it exists'), ...]),
    section('how', 'How it works', [...]),
    section('example', 'Worked example', [...]),
    section('tradeoffs', 'Trade-offs & edge cases', [...]),
    section('connections', 'Connections Between Concepts', [...]), // when relevant
    section('followups', 'Interview follow-up chain', [
      p('Candidate: "..."'),
      p('Interviewer: "Why?"'),
      p('Strong answer: "..."'),
      // continue How? / Data structure? / Complexity? / Trade-off?
    ]),
  ],
  commonMistakes: ['...', '...', '...'],
  interviewQuestions: ['basic1', ...], // exactly ~5
  intermediateInterviewQuestions: ['...', ...], // exactly ~5
  advancedInterviewQuestions: ['...', ...], // 5–10
  interviewReadyAnswers: [
    { question: '...', answer: '60–90s verbal model answer covering WHAT/WHY/HOW/TRADE-OFFS' },
  ],
  keyTakeaways: ['...', '...', '...'],
})
```

## Quality bar

- NO shallow one-liners. Explain WHAT / WHY / HOW / WHEN / TRADE-OFFS.
- Include SQL/Java/Bash code where useful with caption explaining takeaway.
- Include Mermaid diagrams where they teach (not decoration).
- Use `numerical({...})` for calc topics with problem, given, formula, steps, answer, shortcut, mistake.
- Prepare follow-up chains (Why? How? Complexity? Trade-off? Always?).
- Technically rigorous. No fake "LSEG asked this" claims.
- Security day: defensive only — what/how-it-happens-conceptually/why-dangerous/how-to-prevent — NO exploitation recipes.

## End-of-day module (REQUIRED)

Add a final module after existing ones:

```ts
{
  id: 'dN-m-revision',
  title: 'Revision & Interview Prep',
  description: '...',
  pages: [
    createPage('dN-rev', '10-Minute Revision', 10, [...], { ... dense checklist ... }),
    createPage('dN-traps', 'Interview Traps', 10, [...], { ... misconceptions ... }),
    createPage('dN-rapid', 'Rapid Fire — 20 Questions', 12, [...], {
      // put 20 Qs in interviewQuestions + intermediate + sections with model answers hints
    }),
  ],
}
```

Update `estimatedMinutes` on the Day to sum of page minutes.

Keep existing page IDs for study pages (dN-p1, etc.). Only new IDs for revision pages.

## After writing

Ensure `export const dayN: Day = { ... }` compiles. Do not leave empty sections arrays on study pages.
