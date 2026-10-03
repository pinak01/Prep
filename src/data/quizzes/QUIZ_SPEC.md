# Quiz bank authoring

Write `/Users/pinak/Documents/LSEG/src/data/quizzes/dayN.ts` exporting:
`export const dayNQuestions: QuizQuestion[]`

Import helpers: `import { q, tf } from './helpers'`
Import type: `import type { QuizQuestion } from '@/types/curriculum'`

## Requirements
- Exactly 30 questions: 10 easy, 10 medium, 10 hard
- Mix types: mcq, multi, truefalse, numerical, code, scenario
- Every question needs: learningObjective, explanation, interviewTakeaway, topics[], whyWrong for likely wrong options
- Test understanding not memorization
- Hard questions combine concepts
- Validate correctAnswer indices against options length
- Use backticks for multiline strings
- IDs: `dN-q01` ... `dN-q30`

## Day topics
See user request for day focus.
