import { Fragment } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface IHistoryCard {
    content: string;
    ts: number;
}
interface IProps {
    history: IHistoryCard[];
    setText: (text: string) => void;
}

export default function History({ history, setText }: IProps) {
    return (
        <Fragment>
            {history.length > 0 && (
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Version History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {history.map((h, i) => (
                            <div key={h.ts} className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setText(h.content)}>
                                    Restore
                                </Button>
                                <div className="text-xs text-muted-foreground truncate">
                                    {new Date(h.ts).toLocaleString()} — {h.content.slice(0, 80)}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </Fragment>
    );
}
