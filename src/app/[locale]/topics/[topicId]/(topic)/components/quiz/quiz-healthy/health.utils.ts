import type { HealthLevel, QuestionHealthDTO } from '../types/questionHealth.type';

export const HEALTH_COLOR: Record<HealthLevel, string> = {
  critical: 'text-red-600 bg-red-50',
  weak: 'text-orange-600 bg-orange-50',
  fair: 'text-yellow-600 bg-yellow-50',
  healthy: 'text-green-600 bg-green-50',
  mastered: 'text-emerald-600 bg-emerald-50',
};

export const HEALTH_ICON: Record<HealthLevel, string> = {
  critical: '🔴',
  weak: '🟠',
  fair: '🟡',
  healthy: '🟢',
  mastered: '💎',
};

export function sortByHealthAsc(a: QuestionHealthDTO, b: QuestionHealthDTO) {
  return a.healthScore - b.healthScore;
}

export function countByHealth(items: QuestionHealthDTO[]): Record<HealthLevel, number> {
  return items.reduce(
    (acc, q) => {
      acc[q.healthLevel] += 1;
      return acc;
    },
    { critical: 0, weak: 0, fair: 0, healthy: 0, mastered: 0 }
  );
}

export function buildHealthPrompt(topicName: string, items: QuestionHealthDTO[]): string {
  const summary = countByHealth(items);

  return [
    `SYSTEM: You are an expert learning-design AI specialized in spaced repetition (SM-2 style).`,
    ``,
    `TASK: Analyze the questions + SR health signals below, then generate NEW high-quality questions for this topic.`,
    `You MUST:`,
    `- Understand each question's intent from questionText + choices + correctIndex (if provided).`,
    `- Use SR health to decide what kind of new questions to create (reinforcement, variation, misconception checks, harder/easier, etc.).`,
    `- Prefer generating questions that improve weak/critical areas and diversify patterns.`,
    ``,
    `DEFINITION (Health Guide):`,
    `- HEALTH SCORE (0..100): higher = more stable memory & consistent review performance.`,
    `- HEALTH LEVEL:`,
    `  - critical (0-29): unstable/forgotten often, needs relearn + simpler variants.`,
    `  - weak (30-49): still shaky, needs more practice + clearer distractors.`,
    `  - fair (50-69): ok but not robust, needs mixed practice + moderate difficulty.`,
    `  - healthy (70-84): stable, can add transfer questions + application.`,
    `  - mastered (85-100): very strong, generate advanced/edge-case questions.`,
    `- SR STATUS: new/learning/review/relearning indicates stage in spaced repetition.`,
    `- EF (Easiness Factor): lower EF means harder/less stable; higher EF means easier/stable.`,
    `- Reps: number of successful repetitions; higher reps often means stronger retention.`,
    `- Next review: how soon it will be tested again.`,
    ``,
    `OUTPUT REQUIREMENTS:`,
    `- Generate 10-20 new questions.`,
    `- Keep same topic scope.`,
    `- Provide each new question with: questionText, choices[], correctIndex, brief explain.`,
    `- Tag each new question with: (targetHealthLevel: critical|weak|fair|healthy|mastered) based on what it aims to improve.`,
    ``,
    `=== TOPIC CONTEXT ===`,
    `Topic name: ${topicName}`,
    `Total existing questions: ${items.length}`,
    ``,
    `=== HEALTH SUMMARY ===`,
    `critical: ${summary.critical}`,
    `weak: ${summary.weak}`,
    `fair: ${summary.fair}`,
    `healthy: ${summary.healthy}`,
    `mastered: ${summary.mastered}`,
    ``,
    `=== EXISTING QUESTIONS + HEALTH DATA (GROUND TRUTH) ===`,
    ...items.map(buildQuestionBlock),
    ``,
    `=== NOW GENERATE NEW QUESTIONS ===`,
  ].join('\n');
}

function buildQuestionBlock(q: QuestionHealthDTO): string {
  const choices = q.choices ?? [];
  const correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : -1;

  const choicesBlock =
    choices.length > 0
      ? choices
          .map((c, i) => {
            const label = String.fromCharCode(65 + i);
            const mark = i === correctIndex ? ' ✅(correct)' : '';
            return `${label}. ${c}${mark}`;
          })
          .join('\n')
      : `(choices not provided)`;

  const reasonsBlock =
    q.reasons?.length ? q.reasons.map((r) => `- ${r}`).join('\n') : `- (no reasons)`;

  return [
    `--------------------------------------------------`,
    `Question ID: ${q.questionId}`,
    `Health Level: ${q.healthLevel.toUpperCase()}`,
    `Health Score: ${q.healthScore}`,
    `SR Status: ${q.status}`,
    ``,
    `Question Text:`,
    `"${q.questionText}"`,
    ``,
    `Choices:`,
    choicesBlock,
    ``,
    `SR Metrics:`,
    `- Repetitions: ${q.metrics.repetitionNumber ?? '—'}`,
    `- Easiness Factor: ${q.metrics.easinessFactor ?? '—'}`,
    `- Next Review: ${q.metrics.nextReview ?? '—'}`,
    ``,
    `Reasons / Notes:`,
    reasonsBlock,
    `--------------------------------------------------`,
  ].join('\n');
}
