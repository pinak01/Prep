import { curriculum, getAllPages, pageHasContent } from '../src/data/curriculum/index'
import { validateQuestionBank } from '../src/lib/quiz'

const issues: string[] = []

for (const d of curriculum) {
  console.log(
    `Day ${d.number} | ${d.title} | pages ${d.modules.reduce((n, m) => n + m.pages.length, 0)} | quiz ${d.quiz.questions.length}`,
  )
  for (const m of d.modules) {
    for (const p of m.pages) {
      if (!pageHasContent(p)) issues.push(`${p.id} empty`)
      for (const s of p.sections) {
        if (!s.blocks.length) issues.push(`${p.id}/${s.id} empty section`)
      }
    }
  }
  issues.push(
    ...validateQuestionBank(d.quiz.questions, 30).map((e) => `${d.id}: ${e}`),
  )
}

const texts = new Map<string, string>()
for (const d of curriculum) {
  for (const q of d.quiz.questions) {
    const k = q.question.trim().toLowerCase()
    if (texts.has(k)) issues.push(`dup ${q.id} ${texts.get(k)}`)
    else texts.set(k, q.id)
  }
}

console.log('pages', getAllPages().length)
console.log('ISSUES', issues.length)
for (const i of issues) console.log(i)
if (issues.length) process.exit(1)
