'use client';

interface QuizFooterNavigatorProps {
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSubmit?: () => void;
    isLastQuestion: boolean;
}

export default function QuizFooterNavigator({
    hasPrev,
    hasNext,
    onPrev,
    onNext,
    onSubmit,
    isLastQuestion,
}: QuizFooterNavigatorProps) {
    return (
        <div className="w-full flex justify-between items-center mt-6 pt-4 border-t border-border">
            {/* Prev Button */}
            <button
                onClick={onPrev}
                disabled={!hasPrev}
                className={`px-4 py-2 text-sm rounded-md border transition
                    ${hasPrev ? 'bg-muted hover:bg-accent cursor-pointer' : 'bg-muted/50 opacity-50 cursor-not-allowed'}
                `}
            >
                ← Back
            </button>

            {/* Next or Submit */}
            {!isLastQuestion && (
                <button
                    onClick={onNext}
                    disabled={!hasNext}
                    className={`px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition
                        ${hasNext ? '' : 'opacity-50 cursor-not-allowed'}
                    `}
                >
                    Next →
                </button>
            )}

            {/* Submit */}
            {isLastQuestion && (
                <button
                    onClick={onSubmit}
                    className="px-4 py-2 text-sm rounded-md bg-destructive text-white hover:bg-destructive/90 transition"
                >
                    Submit
                </button>
            )}
        </div>
    );
}
