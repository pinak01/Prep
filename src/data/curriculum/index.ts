import type { Day, StudyPage, Module, Quiz } from '@/types/curriculum'
import { quizBanks, moduleQuizBanks } from '../quizzes'
import { attachQuizBanks } from '../quizzes/moduleMeta'
import { day1 } from './day1'
import { day2 } from './day2'
import { day3 } from './day3'
import { day4 } from './day4'
import { day5 } from './day5'
import { day6 } from './day6'
import { day7 } from './day7'

export const curriculum: Day[] = [day1, day2, day3, day4, day5, day6, day7]

attachQuizBanks(curriculum, quizBanks, moduleQuizBanks)

export function getDayById(dayId: string): Day | undefined {
  return curriculum.find((d) => d.id === dayId)
}

export function getDayByNumber(num: number): Day | undefined {
  return curriculum.find((d) => d.number === num)
}

export function getAllPages(): StudyPage[] {
  return curriculum.flatMap((d) => d.modules.flatMap((m) => m.pages))
}

export function getTotalPageCount(): number {
  return getAllPages().length
}

export function findPageLocation(pageId: string): {
  day: Day
  module: Module
  page: StudyPage
  pageIndexInDay: number
  pageIndexInModule: number
  allDayPages: StudyPage[]
} | null {
  for (const day of curriculum) {
    const allDayPages = day.modules.flatMap((m) => m.pages)
    let idx = 0
    for (const mod of day.modules) {
      for (let pi = 0; pi < mod.pages.length; pi++) {
        const page = mod.pages[pi]
        if (page.id === pageId) {
          return {
            day,
            module: mod,
            page,
            pageIndexInDay: idx,
            pageIndexInModule: pi,
            allDayPages,
          }
        }
        idx++
      }
    }
  }
  return null
}

export function getAdjacentPages(pageId: string): {
  prev: StudyPage | null
  next: StudyPage | null
  day: Day
  nextIsModuleQuiz: boolean
  module: Module
} | null {
  const loc = findPageLocation(pageId)
  if (!loc) return null
  const { allDayPages, pageIndexInDay, day, module, pageIndexInModule } = loc
  const isLastInModule = pageIndexInModule === module.pages.length - 1
  const hasModuleQuiz = Boolean(module.quiz && module.quiz.questions.length > 0)

  return {
    prev: pageIndexInDay > 0 ? allDayPages[pageIndexInDay - 1] : null,
    next:
      pageIndexInDay < allDayPages.length - 1
        ? allDayPages[pageIndexInDay + 1]
        : null,
    day,
    nextIsModuleQuiz: isLastInModule && hasModuleQuiz,
    module,
  }
}

export function getQuizForDay(dayId: string): Quiz | undefined {
  return getDayById(dayId)?.quiz
}

export function getModuleQuiz(
  dayNumber: number,
  moduleId: string,
): { day: Day; module: Module; quiz: Quiz } | null {
  const day = getDayByNumber(dayNumber)
  if (!day) return null
  const mod = day.modules.find((m) => m.id === moduleId)
  if (!mod?.quiz) return null
  return { day, module: mod, quiz: mod.quiz }
}

export function collectInterviewQuestions(): {
  dayId: string
  dayNumber: number
  dayTitle: string
  pageId: string
  pageTitle: string
  question: string
  advanced: boolean
}[] {
  const results: {
    dayId: string
    dayNumber: number
    dayTitle: string
    pageId: string
    pageTitle: string
    question: string
    advanced: boolean
  }[] = []

  for (const day of curriculum) {
    for (const mod of day.modules) {
      for (const page of mod.pages) {
        for (const q of [
          ...page.interviewQuestions,
          ...page.intermediateInterviewQuestions,
        ]) {
          results.push({
            dayId: day.id,
            dayNumber: day.number,
            dayTitle: day.shortTitle,
            pageId: page.id,
            pageTitle: page.title,
            question: q,
            advanced: false,
          })
        }
        for (const q of page.advancedInterviewQuestions) {
          results.push({
            dayId: day.id,
            dayNumber: day.number,
            dayTitle: day.shortTitle,
            pageId: page.id,
            pageTitle: page.title,
            question: q,
            advanced: true,
          })
        }
      }
    }
  }
  return results
}

export function pageHasContent(page: StudyPage): boolean {
  return (
    page.sections.length > 0 &&
    page.sections.some((s) => s.blocks.length > 0)
  )
}
