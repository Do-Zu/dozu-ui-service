// app/[locale]/quiz/page.tsx
import dynamic from 'next/dynamic'

const SurveyQuiz = dynamic(() => import('@/components/demo/SurveyQuiz'), { ssr: false })

export default function QuizPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">Làm bài quiz</h1>
      <SurveyQuiz />
    </main>
  )
}
