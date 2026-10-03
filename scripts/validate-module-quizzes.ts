import { curriculum } from '../src/data/curriculum'
import { moduleQuizBanks } from '../src/data/quizzes/modules'

const keys = Object.keys(moduleQuizBanks).sort()
console.log('module banks:', keys.length, keys.join(', '))

let ok = true
for (const d of curriculum) {
  for (const m of d.modules) {
    const n = m.quiz?.questions.length ?? 0
    const expect =
      /revision|final|battery|must/i.test(`${m.id} ${m.title}`) ? 0 : 8
    if (n !== expect) {
      console.log('MISMATCH', m.id, 'got', n, 'expected', expect)
      ok = false
    } else {
      console.log('OK', m.id, n)
    }
  }
}
if (!ok) process.exit(1)
console.log('all module quiz attachments OK')
