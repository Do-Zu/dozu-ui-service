import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ProcessProps {
  /**
   * Title displayed during processing
   */
  title?: string;
  /**
   * Description text shown under the title
   */
  description?: string;
  /**
   * Current progress value (0-100)
   */
  progress?: number;
  /**
   * Custom footer message
   */
  footer?: string;
  /**
   * Whether to show animated progress
   */
  animated?: boolean;
  /**
   * Optional className for custom styling
   */
  className?: string;
  /**
   * Optional callback when processing reaches 100%
   */
  onComplete?: () => void;
  /**
   * Optional callback when animation timeout is reached
   */
  onTimeout?: () => void;
  /**
   * Timeout duration in milliseconds for animated mode
   */
  timeoutDuration?: number;
}

/**
 * Process component displays a loading indicator with progress bar
 * for long-running operations
 */
export function Process({
  title,
  description,
  progress = 0,
  footer,
  animated = true,
  className,
  onComplete,
  onTimeout,
  timeoutDuration = 10000,
}: ProcessProps) {
  const [internalProgress, setInternalProgress] = useState(progress);

  useEffect(() => {
    // External progress reached 100%, trigger completion
    if (progress >= 100 && onComplete) {
      setInternalProgress(100);
      onComplete();
      return;
    }

    // Use external progress when provided or animation is disabled
    if (!animated || progress > 0) {
      setInternalProgress(progress);
      return;
    }

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 90 ? 1 : 0.5;
        // Stop at 95% for realistic animation
        return Math.min(prev + increment, 98);
      });
    }, 100);

    // When timeout is reached, set progress to 100% and call onTimeout if provided
    const completionTimer = setTimeout(() => {
      setInternalProgress(100);

      // Call onTimeout instead of onComplete when animation times out
      if (onTimeout) {
        onTimeout();
      } else {
        toast({
          title: 'Process timeout',
          description: 'Could not resolve process',
          variant: 'destructive',
        });
      }
    }, timeoutDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(completionTimer);
    };
  }, [progress, animated, onComplete, onTimeout, timeoutDuration]);

  return (
    <div
      className={cn('py-10 space-y-4', className)}
      role="status"
      aria-live="polite"
      aria-busy={internalProgress < 100}
    >
      <div className="text-center">
        <Sparkles
          className={cn('h-10 w-10 mx-auto mb-4', animated && 'animate-pulse')}
          aria-hidden="true"
        />
        {title && <h3 className="text-lg font-medium mb-1">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <Progress
        value={internalProgress}
        className="max-w-[90%] h-2 m-auto"
        aria-label="Processing progress"
        aria-valuenow={Math.round(internalProgress)}
      />

      {footer && <p className="text-xs text-center text-muted-foreground">{footer}</p>}
    </div>
  );
}

export default Process;
