import type { StudyPage, StudySection, ContentBlock } from '@/types/curriculum'

type PageExtras = Partial<
  Pick<
    StudyPage,
    | 'prerequisites'
    | 'commonMistakes'
    | 'interviewQuestions'
    | 'intermediateInterviewQuestions'
    | 'advancedInterviewQuestions'
    | 'interviewReadyAnswers'
    | 'keyTakeaways'
    | 'sections'
  >
>

/** Factory for a study page */
export function createPage(
  id: string,
  title: string,
  estimatedMinutes: number,
  learningObjectives: string[] = [],
  extras: PageExtras = {},
): StudyPage {
  return {
    id,
    title,
    estimatedMinutes,
    learningObjectives,
    sections: extras.sections ?? [],
    commonMistakes: extras.commonMistakes ?? [],
    interviewQuestions: extras.interviewQuestions ?? [],
    intermediateInterviewQuestions: extras.intermediateInterviewQuestions ?? [],
    advancedInterviewQuestions: extras.advancedInterviewQuestions ?? [],
    interviewReadyAnswers: extras.interviewReadyAnswers ?? [],
    keyTakeaways: extras.keyTakeaways ?? [],
    prerequisites: extras.prerequisites,
  }
}

export function section(
  id: string,
  title: string,
  blocks: ContentBlock[],
): StudySection {
  return { id, title, blocks }
}

export function p(text: string): ContentBlock {
  return { type: 'paragraph', text }
}

export function h2(text: string): ContentBlock {
  return { type: 'heading', level: 2, text }
}

export function h3(text: string): ContentBlock {
  return { type: 'heading', level: 3, text }
}

export function ul(items: string[]): ContentBlock {
  return { type: 'list', items }
}

export function ol(items: string[]): ContentBlock {
  return { type: 'list', ordered: true, items }
}

export function code(
  language: string,
  codeStr: string,
  caption?: string,
): ContentBlock {
  return { type: 'code', language, code: codeStr, caption }
}

export function table(
  headers: string[],
  rows: string[][],
  caption?: string,
): ContentBlock {
  return { type: 'table', headers, rows, caption }
}

export function callout(
  variant: 'info' | 'tip' | 'warning' | 'mistake',
  text: string,
  title?: string,
): ContentBlock {
  return { type: 'callout', variant, text, title }
}

export function diagram(mermaid: string, caption?: string): ContentBlock {
  return { type: 'diagram', mermaid, caption }
}

export function example(title: string, blocks: ContentBlock[]): ContentBlock {
  return { type: 'example', title, blocks }
}

/** Worked numerical with mandatory interview fields */
export function numerical(opts: {
  title: string
  problem: string
  given: string
  formula: string
  steps: string
  answer: string
  shortcut: string
  mistake: string
}): ContentBlock {
  return {
    type: 'numerical',
    title: opts.title,
    problem: opts.problem,
    solution: [
      `Given: ${opts.given}`,
      `Formula: ${opts.formula}`,
      `Steps:\n${opts.steps}`,
      `Final answer: ${opts.answer}`,
      `Interview shortcut: ${opts.shortcut}`,
      `Common mistake: ${opts.mistake}`,
    ].join('\n\n'),
  }
}

export function sumPageMinutes(
  pages: { estimatedMinutes: number }[],
): number {
  return pages.reduce((sum, p) => sum + p.estimatedMinutes, 0)
}
