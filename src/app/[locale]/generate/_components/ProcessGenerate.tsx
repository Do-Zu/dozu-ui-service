import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessGenerateProps {
  isGenerating: boolean;
  onComplete?: (result: any) => void;
  className?: string;
  progressInitial?: number;
  status?: string;
}

const ProcessGenerate: React.FC<ProcessGenerateProps> = ({
  isGenerating,
  onComplete,
  className = '',
  progressInitial = 0,
  status = 'processing',
}) => {
  const [progress, setProgress] = useState(progressInitial);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const messages = [
    ' Đang xử lý yêu cầu...',
    ' Đang phân tích dữ liệu...',
    ' Đang xây dựng nội dung...',
    ' Đang rà soát chất lượng...',
    ' Sắp hoàn thành, xin vui lòng đợi...',
  ];

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;
    let elapsedInterval: NodeJS.Timeout;

    if (isGenerating) {
      setStartTime(Date.now());
      setProgress(0);
      setCurrentMessage(0);
      setElapsedTime(0);

      // Simulate progress - faster at first, then slower
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Fast progress until 95%, then slow down
          const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 95 ? 1 : 0.5;
          const next = Math.min(prev + increment, 99);

          // Update time remaining estimate
          if (startTime) {
            const elapsed = (Date.now() - startTime) / 1000;
            const estimatedTotal = (elapsed / (next / 100)) * (1 + (Math.random() * 0.1 - 0.05));
            const remaining = Math.max(1, Math.round(estimatedTotal - elapsed));
            setTimeRemaining(remaining);
          }

          return next;
        });
      }, 300);

      // Update messages periodically
      messageInterval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 4000);

      // Update elapsed time
      elapsedInterval = setInterval(() => {
        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearInterval(elapsedInterval);
    };
  }, [isGenerating, messages.length]);

  // Function to finalize loading (to be called when generation is complete)
  const finalizeLoading = () => {
    const finishInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(finishInterval);
          if (onComplete) {
            onComplete({});
          }
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  if (!isGenerating) return null;

  return (
    <Card className={cn('w-full max-w-3xl mx-auto bg-card shadow-lg', className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center mb-6">
          <Sparkles className="h-10 w-10 mb-4 animate-pulse text-primary" />
          <h2 className="text-xl font-bold text-center mb-2 text-primary animate-fade-in">
            {messages[currentMessage]}
          </h2>
        </div>

        <div className="progress-container relative mb-6">
          <Progress value={progress} className="max-w-[90%] h-2 m-auto " />
          <div className="progress-pulse" style={{ left: `${Math.min(98, progress)}%` }} />
        </div>

        <div className="ai-facts-container relative mb-6 bg-accent/10 rounded-lg p-4 border border-accent/20">
          <div className="absolute top-0 right-0 mt-1 mr-1">
            <div className="processing-dot-container">
              {[0, 1, 2].map((i) => (
                <div
                  key={`dot-${i}`}
                  className="processing-dot"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        .progress-pulse {
          position: absolute;
          top: 0;
          width: 8px;
          height: 10px;
          border-radius: 4px;
          background-color: #60a5fa;
          transform: translateX(-50%);
          filter: blur(2px);
          box-shadow: 0 0 8px 2px rgba(96, 165, 250, 0.7);
          animation: pulsate 2s infinite;
        }

        @keyframes pulsate {
          0% {
            opacity: 0.6;
            box-shadow: 0 0 5px 2px rgba(96, 165, 250, 0.4);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 12px 4px rgba(96, 165, 250, 0.8);
          }
          100% {
            opacity: 0.6;
            box-shadow: 0 0 5px 2px rgba(96, 165, 250, 0.4);
          }
        }

        .facts-carousel {
          position: relative;
          overflow: hidden;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fact-item {
          animation: fadeInOut 4s ease-in-out;
          text-align: center;
          padding: 0 10px;
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        .processing-dot-container {
          display: flex;
          gap: 3px;
        }

        .processing-dot {
          width: 6px;
          height: 6px;
          background-color: #60a5fa;
          border-radius: 50%;
          animation: dotBlink 1.5s infinite;
        }

        @keyframes dotBlink {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  );
};

export default ProcessGenerate;
