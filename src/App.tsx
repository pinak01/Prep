import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { DayOverview } from '@/pages/DayOverview'
import { StudyPage } from '@/pages/StudyPage'
import { QuizPage } from '@/pages/QuizPage'
import { QuizResults } from '@/pages/QuizResults'
import { InterviewMode } from '@/pages/InterviewMode'
import { ProgressPage } from '@/pages/ProgressPage'
import { LoginPage } from '@/pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="interview" element={<InterviewMode />} />
              <Route path="day/:dayNumber" element={<DayOverview />} />
              <Route path="day/:dayNumber/page/:pageId" element={<StudyPage />} />
              <Route path="day/:dayNumber/quiz" element={<QuizPage />} />
              <Route
                path="day/:dayNumber/quiz/results"
                element={<QuizResults />}
              />
              <Route
                path="day/:dayNumber/module/:moduleId/quiz"
                element={<QuizPage />}
              />
              <Route
                path="day/:dayNumber/module/:moduleId/quiz/results"
                element={<QuizResults />}
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
