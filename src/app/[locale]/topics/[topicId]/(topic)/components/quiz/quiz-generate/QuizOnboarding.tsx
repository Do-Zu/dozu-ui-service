'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import QuizTypeAccordion from './QuizTypeAccordion';

interface QuizOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuizOnboarding({
  open,
  onOpenChange,
}: QuizOnboardingProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* scrollable dialog */}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Guide</DialogTitle>
          <DialogDescription>
            Learn when to use each quiz type and how recommendations work (based
            on your spaced repetition progress).
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <QuizTypeAccordion />
        </div>

        {/* About Recommendations (detailed + scroll inside) */}
        <div className="mt-6 rounded-lg border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <b className="text-sm">About Recommendations</b>
            <span className="text-xs text-muted-foreground">
              Step-by-step learning flow
            </span>
          </div>

          {/* inner scroll if long */}
          <div className="mt-3 max-h-[42vh] overflow-y-auto pr-2 text-sm leading-relaxed">
            <p className="text-muted-foreground">
              Recommendations are meant to help you pick the{' '}
              <b>best next action</b>, not to restrict you. The system looks at
              your <b>question statuses</b> and groups questions into quiz types.
              Then it recommends the type that gives you the biggest learning
              benefit right now (example priority:{' '}
              <i>Wrong → Weak → Review → Learning → New</i>).
            </p>

            <div className="mt-4 space-y-3">
              <SectionTitle>
                How “N questions with the same status” are learned (step-by-step)
              </SectionTitle>

              <StepBlock
                step="Step 1 — You open Quiz"
                text={
                  <>
                    The system checks your topic and counts how many questions
                    belong to each learning bucket: <b>Wrong, Weak, Review, Learning, New</b>.
                    These buckets come from your spaced repetition tracking records.
                  </>
                }
              />

              <StepBlock
                step="Step 2 — It picks the best focus"
                text={
                  <>
                    If you have many questions in the same “high priority”
                    status (for example <b>Wrong</b>), that type becomes a strong
                    candidate for recommendation because it usually delivers the
                    fastest improvement.
                    <br />
                    <span className="text-muted-foreground">
                      Example: You have <b>5 Wrong questions</b> → practicing them
                      prevents repeated mistakes.
                    </span>
                  </>
                }
              />

              <StepBlock
                step="Step 3 — It generates a quiz from that group"
                text={
                  <>
                    When you select a quiz type (or click <b>Start now</b> from
                    Recommendation), the app fetches questions matching that
                    type’s filter (status / EF / due rules).
                    <br />
                    You get a quiz that is focused: all questions come from the
                    same “goal”.
                  </>
                }
              />

              <StepBlock
                step="Step 4 — You answer N questions"
                text={
                  <>
                    During the quiz, you answer a batch of questions that share
                    the same learning intention:
                    <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                      <li>
                        <b>Wrong</b>: fix mistakes (relearning)
                      </li>
                      <li>
                        <b>Weak</b>: strengthen difficult questions (low easiness
                        factor)
                      </li>
                      <li>
                        <b>Review</b>: refresh questions that are due now (scheduled
                        reviews)
                      </li>
                      <li>
                        <b>Learning</b>: stabilize new knowledge still being built
                      </li>
                      <li>
                        <b>New</b>: first exposure (no tracking record yet)
                      </li>
                    </ul>
                  </>
                }
              />

              <StepBlock
                step="Step 5 — The system updates your status after submission"
                text={
                  <>
                    After you submit, each question’s tracking record is updated.
                    This is where spaced repetition “moves” questions between
                    statuses.
                    <div className="mt-2 rounded-md border bg-background/60 p-3 text-muted-foreground">
                      <b className="text-foreground">Typical movement (simplified)</b>
                      <ul className="mt-2 list-disc pl-5">
                        <li>
                          If you answer correctly and confidently, the question is
                          more likely to move toward <b>Review</b> with a longer interval.
                        </li>
                        <li>
                          If you answer incorrectly, it becomes <b>Wrong</b> /{' '}
                          <b>Relearning</b> so you see it again sooner.
                        </li>
                        <li>
                          If you keep struggling with it, its difficulty stays high,
                          so it may remain <b>Weak</b> (low EF) and appear more often.
                        </li>
                      </ul>
                    </div>
                  </>
                }
              />

              <StepBlock
                step="Step 6 — Next time, recommendations adapt"
                text={
                  <>
                    The next time you open Quiz, counts update and the recommendation
                    may change. That’s why it feels “personalized”: it follows what
                    you actually did in the last sessions.
                  </>
                }
              />

              <Divider />

              <SectionTitle>What each recommendation priority means</SectionTitle>

              <InfoRow
                title="Wrong (highest urgency)"
                body={
                  <>
                    You recently got these wrong and they are typically tagged as{' '}
                    <b>relearning</b>. Doing them now reduces repeated mistakes fast.
                  </>
                }
              />
              <InfoRow
                title="Weak"
                body={
                  <>
                    These are questions with a <b>low easiness factor</b> (you often
                    find them hard). Practicing them improves long-term stability.
                  </>
                }
              />
              <InfoRow
                title="Review"
                body={
                  <>
                    These are scheduled review questions that are <b>due now</b>.
                    This is the classic spaced repetition “right time” practice.
                  </>
                }
              />
              <InfoRow
                title="Learning"
                body={
                  <>
                    Questions still in the early learning phase. Doing them helps you
                    move items into stable review.
                  </>
                }
              />
              <InfoRow
                title="New (lowest urgency)"
                body={
                  <>
                    Fresh, unseen items. Great when you want to expand coverage, but
                    not always the best next step if you have many wrong/weak items.
                  </>
                }
              />

              <Divider />

              <SectionTitle>Important notes</SectionTitle>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>
                  Recommendation is a <b>hint</b>, not a rule — you can always choose
                  any quiz type.
                </li>
                <li>
                  Counts can differ slightly between “Recommendation counts” and
                  “Generate quiz counts” if your tracking updates between requests
                  (for example, after finishing a quiz).
                </li>
                <li>
                  “Review” is usually the only type that must be <b>due</b> (based
                  on next review time). Other types are often based on status/EF,
                  so they can still appear even if next review time is in the future.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- small UI blocks ----------------------------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-semibold text-foreground">
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px w-full bg-border" />;
}

function StepBlock({
  step,
  text,
}: {
  step: string;
  text: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="text-sm font-semibold">{step}</div>
      <div className="mt-1 text-sm text-muted-foreground">{text}</div>
    </div>
  );
}

function InfoRow({
  title,
  body,
}: {
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{body}</div>
    </div>
  );
}
