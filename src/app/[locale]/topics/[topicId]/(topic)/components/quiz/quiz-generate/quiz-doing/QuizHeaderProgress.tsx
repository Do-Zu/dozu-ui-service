'use client';

interface QuizHeaderProgressProps {
    current: number;
    total: number;
}

export default function QuizHeaderProgress({ current, total }: QuizHeaderProgressProps) {
    const progressPercent = (current / total) * 100;

    return (
        <div className="w-full py-4">
        
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                    Question {current} / {total}
                </span>
            </div>

           
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
