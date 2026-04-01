/**
 * Behavioral interview coach with STAR format evaluation.
 */

export interface BehavioralQuestion {
  question: string;
  themes: string[];
  companies: string[];
}

export const BEHAVIORAL_QUESTIONS: BehavioralQuestion[] = [
  // Amazon Leadership Principles
  { question: "Tell me about a time you had to make a decision without all the information.", themes: ['bias_for_action', 'judgment'], companies: ['Amazon'] },
  { question: "Describe a time you disagreed with your manager.", themes: ['have_backbone', 'conflict_resolution'], companies: ['Amazon'] },
  { question: "Tell me about a time you simplified a complex process.", themes: ['invent_and_simplify'], companies: ['Amazon'] },
  { question: "Give me an example of when you took ownership of a problem.", themes: ['ownership'], companies: ['Amazon'] },
  { question: "Describe a time you delivered results under a tight deadline.", themes: ['deliver_results', 'bias_for_action'], companies: ['Amazon'] },
  { question: "Tell me about a time you earned the trust of a skeptical stakeholder.", themes: ['earn_trust'], companies: ['Amazon'] },

  // Google
  { question: "Tell me about a time you had to influence without authority.", themes: ['leadership', 'influence'], companies: ['Google'] },
  { question: "Describe a technically challenging project and how you approached it.", themes: ['technical_depth', 'problem_solving'], companies: ['Google'] },
  { question: "Tell me about a time you received critical feedback and how you responded.", themes: ['growth_mindset', 'humility'], companies: ['Google'] },
  { question: "Give me an example of when you had to work with ambiguity.", themes: ['ambiguity', 'decision_making'], companies: ['Google'] },

  // Meta
  { question: "Tell me about a time you moved fast and broke things.", themes: ['speed', 'risk_taking'], companies: ['Meta'] },
  { question: "Describe a time you had to build consensus across teams.", themes: ['collaboration', 'communication'], companies: ['Meta'] },
  { question: "Tell me about your biggest technical failure and what you learned.", themes: ['failure', 'growth_mindset'], companies: ['Meta'] },
  { question: "How do you prioritize when everything is a priority?", themes: ['prioritization', 'judgment'], companies: ['Meta'] },

  // General
  { question: "Tell me about a time you mentored someone.", themes: ['mentorship', 'leadership'], companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'] },
  { question: "Describe a situation where you had to handle conflicting priorities from different stakeholders.", themes: ['conflict_resolution', 'communication'], companies: ['Google', 'Meta', 'Amazon', 'Microsoft'] },
  { question: "Tell me about a project where the requirements changed midway.", themes: ['adaptability', 'communication'], companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'] },
  { question: "Give an example of a time you went above and beyond.", themes: ['ownership', 'drive'], companies: ['Amazon', 'Google', 'Meta'] },
  { question: "Describe a time you had to learn something quickly to complete a project.", themes: ['learning_agility', 'growth_mindset'], companies: ['Google', 'Meta', 'Microsoft'] },
  { question: "Tell me about a time you had to say no to a stakeholder.", themes: ['judgment', 'communication'], companies: ['Amazon', 'Google', 'Meta'] },
];

export function getQuestionsForCompany(company: string): BehavioralQuestion[] {
  return BEHAVIORAL_QUESTIONS.filter((q) =>
    q.companies.some((c) => c.toLowerCase() === company.toLowerCase())
  );
}

export function getRandomQuestion(company?: string): BehavioralQuestion {
  const pool = company ? getQuestionsForCompany(company) : BEHAVIORAL_QUESTIONS;
  const candidates = pool.length > 0 ? pool : BEHAVIORAL_QUESTIONS;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function buildBehavioralPrompt(params: {
  question: BehavioralQuestion;
  company?: string;
  candidateLevel?: string;
}): string {
  const { question, company, candidateLevel = 'mid' } = params;

  return `You are Alex, a senior engineer conducting a behavioral interview.${company ? ` You work at ${company}.` : ''}

## BEHAVIORAL INTERVIEW MODE

There is NO code editor. This is a purely conversational round focused on past experiences and decision-making.

## THE QUESTION

"${question.question}"

Themes being evaluated: ${question.themes.join(', ')}

## INTERVIEW PROTOCOL (30 minutes)

### Phase 1 — Ask the Question (1 min)
State the question clearly. Give the candidate a moment to think.
"Take a moment to think of a good example."

### Phase 2 — Listen to the STAR Response (5-8 min)
Listen for the STAR structure:
- **S**ituation: What was the context?
- **T**ask: What was your specific responsibility?
- **A**ction: What did YOU do (not the team)?
- **R**esult: What was the measurable outcome?

If they're vague: "Can you be more specific about what YOU did?"
If they skip the result: "What was the outcome? Any metrics?"
If too short: "Tell me more about the situation."

### Phase 3 — Follow-up Questions (3-5 min)
Dig deeper:
- "What would you do differently if you faced this again?"
- "How did the other person/team react?"
- "What did you learn from this experience?"
- "How has this changed how you approach similar situations?"

### Phase 4 — Next Question (repeat for 2-3 questions total)
After each story, briefly acknowledge and move on:
"Thanks for sharing that. Let me ask you about a different situation..."

## EVALUATION (internal)

Score each story on:
1. **Specificity** (1-4): Did they give a real, specific example? Not hypothetical?
2. **STAR structure** (1-4): Were all four components present?
3. **Impact** (1-4): Was the result meaningful and measurable?
4. **Self-awareness** (1-4): Did they show reflection and growth?

## VOICE RULES
- Listen more than you talk (70/30 candidate/interviewer)
- Short follow-ups: "Tell me more", "What happened next?", "How did that feel?"
- Don't interrupt their story unless it goes over 3 minutes
- Be warm and encouraging — behavioral rounds should feel conversational
- Candidate level: ${candidateLevel}

Remember: you are speaking out loud. Be concise and natural.`;
}
