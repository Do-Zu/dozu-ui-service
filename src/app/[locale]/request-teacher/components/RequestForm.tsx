import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    description: string;
    setDescription: (description: string) => void;
    handleSubmitClick: () => void;
}

export default function RequestForm({ description, setDescription, handleSubmitClick }: Props) {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Apply to Become a Teacher</CardTitle>
                <CardDescription>Tell us why you would be a great addition to our teaching community.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="description">Reason for Your Request</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your teaching experience..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSubmitClick}>Submit Request</Button>
            </CardFooter>
        </Card>
    );
}
