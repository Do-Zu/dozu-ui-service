// components/SurveyQuiz.tsx
'use client'

import 'survey-core/modern.min.css'
import '@/styles/survey-override.css' 

import { useEffect, useState } from 'react'
import { StylesManager, Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { useTheme } from 'next-themes'

const quizJson = {
  title: 'Mini Quiz về Thủ đô',
  showProgressBar: 'top',
  pages: [
    {
      elements: [
        {
          type: 'radiogroup',
          name: 'q1',
          title: 'Thủ đô của Việt Nam là gì?',
          choices: ['Hà Nội', 'TP.HCM', 'Đà Nẵng'],
          correctAnswer: 'Hà Nội',
        },
        {
          type: 'text',
          name: 'q2',
          title: 'Nhập thủ đô của Nhật Bản:',
          correctAnswer: 'Tokyo',
        },
      ],
    },
  ],
}

export default function SurveyQuiz() {
  const [survey] = useState(() => new Model(quizJson))
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (resolvedTheme === 'dark') {
      StylesManager.applyTheme('modern-dark')
    } else {
      StylesManager.applyTheme('modern')
    }
  }, [resolvedTheme])

  survey.onComplete.add((sender) => {
    console.log('Kết quả:', sender.data)
    alert('Kết quả: ' + JSON.stringify(sender.data))
  })

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-zinc-900 rounded shadow">
      <Survey model={survey} />
    </div>
  )
}
