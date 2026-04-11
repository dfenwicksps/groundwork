export interface Activity {
  id: string;
  type: "journal" | "values_picker" | "challenge" | "milestone_letter";
  title: string;
  subtitle: string;
  prompt: string;
  secondaryPrompt?: string;
  isMilestone?: boolean;
  isChallenge?: boolean;
  challengeDebriefDays?: number;
  valuesOptions?: string[];
  valuesCount?: number;
  locked?: boolean;
  /** Context paragraph — why this step matters in the journey */
  intro?: string;
  /** An easier lead-in question to warm up before the main prompt */
  warmUp?: string;
  /** Index (0-based) of this mission's story to surface before this activity */
  storyBefore?: number;
  /** Numbered sub-questions that break the main prompt into smaller, guided steps */
  scaffoldingSteps?: string[];
  /** Clickable sentence openers to help with the blank-page moment */
  sentenceStarters?: string[];
}

export interface Mission {
  id: number;
  title: string;
  subtitle: string;
  question: string;
  description: string;
  colour: string;
  textColour: string;
  activities: Activity[];
  /** Identity development phase from Erikson's framework */
  phase: "exploration" | "commitment" | "integration";
  /** Short phase label shown in UI */
  phaseLabel: string;
  /** One-sentence description of what this phase involves */
  phaseDescription: string;
}

export const VALUES_LIST = [
  "Courage",
  "Kindness",
  "Honesty",
  "Creativity",
  "Loyalty",
  "Fairness",
  "Growth",
  "Family",
  "Independence",
  "Humour",
  "Compassion",
  "Adventure",
  "Justice",
  "Faith",
  "Discipline",
  "Connection",
  "Curiosity",
  "Service",
  "Resilience",
  "Authenticity",
];

/**
 * Definitions for all 20 values — used wherever values are presented
 * so users always understand what they're choosing.
 */
export const VALUES_WITH_DEFINITIONS: Record<string, string> = {
  Courage:
    "Acting despite fear, not in the absence of it. Whether it's speaking up in a room that disagrees with you, trying something you might fail at, or letting someone actually see how you feel.",
  Kindness:
    "Choosing warmth and generosity, especially when it costs you something. It shows up in the small moments: the text you didn't have to send, the extra patience, the willingness to put someone else first.",
  Honesty:
    "Telling the truth — to others and to yourself. It's more than not lying. It's the hard feedback you give, the uncomfortable things you admit, and not pretending everything's fine when it isn't.",
  Creativity:
    "Finding new ways to see, solve, and express. You don't just accept the obvious answer — you ask what else is possible, and you're willing to make something imperfect rather than make nothing at all.",
  Loyalty:
    "Standing by the people and commitments you care about, even when it's inconvenient or costs you something.",
  Fairness:
    "The conviction that everyone deserves to be treated with equal dignity. When you see unfairness, it bothers you — and you believe it's worth speaking up, even when it isn't your fight.",
  Growth:
    "The belief that where you are now isn't where you have to stay. You're drawn to discomfort, feedback, and challenge — not because they're fun, but because they're how you actually move forward.",
  Family:
    "The people closest to you — by blood or by bond — are at the centre of what you care about. Their wellbeing matters deeply, and your relationships with them shape a lot of who you are.",
  Independence:
    "Trusting your own judgment and carving your own path, rather than needing others to define your direction for you.",
  Humour:
    "Finding the lightness in life, even in difficult moments. You use laughter to connect, to cope, and to keep perspective — and you believe that not taking everything too seriously is a kind of wisdom.",
  Compassion:
    "Feeling what others feel, and being moved to do something about it. Not sympathy from a distance — a genuine pull toward people who are struggling, and the impulse to actually help.",
  Adventure:
    "Seeking out new experiences and being willing to go where you haven't been before — physically, mentally, or emotionally.",
  Justice:
    "The belief that wrongs should be made right, and that being a bystander to unfairness isn't neutrality — it's a choice.",
  Faith:
    "Trusting in something larger than yourself — whether that's a spiritual belief, a community, or a set of principles that holds you steady.",
  Discipline:
    "Showing up and doing the work even when motivation has run out — because consistency matters more than inspiration.",
  Connection:
    "Building genuine relationships where you're truly known and you truly know others — not just surrounded by people, but actually seen.",
  Curiosity:
    "A genuine hunger to understand — people, ideas, how things work, why the world is the way it is. You ask questions not to seem smart, but because you actually want to know the answers.",
  Service:
    "Finding meaning in contributing to others — whether in small daily acts or bigger commitments to a community or cause.",
  Resilience:
    "Getting back up — not because the hard thing didn't hurt, but because you don't let it define you. You bend, you feel it fully, and then you find a way through. Again and again.",
  Authenticity:
    "Showing up as yourself, not a version shaped by what others expect. It means saying what you actually think, living by what you actually believe, and refusing to perform a role that isn't yours.",
};

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Identity",
    subtitle: "Mission 1",
    question: "Who am I becoming?",
    phase: "exploration",
    phaseLabel: "Phase 1 — Exploration",
    phaseDescription:
      "Looking inward without pressure to have it figured out yet.",
    description:
      "Identity isn't fixed — it's something you actively build and rebuild throughout your life. This mission begins that work: mapping your strengths, naming what you value, and noticing where you're most genuinely yourself. There are no right answers here. The goal is honest self-knowledge, not a finished picture.",
    colour: "#1B3A5C",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "strengths-mapping",
        type: "journal",
        title: "Strengths Mapping",
        subtitle: "Step 1 of 5",
        intro:
          "Every identity starts somewhere concrete. Before the bigger questions, let's begin with something grounded — what you're actually good at. Not what you've been told you're good at. What you've felt.",
        warmUp:
          "Think of one moment this week where you felt capable. Not perfect. Just: 'I can do this.' Hold that moment in your mind before you write.",
        prompt:
          "Think about a moment recently when you felt genuinely good at something. What were you doing, and what made it feel natural?",
        secondaryPrompt:
          "Try to be specific — not 'I'm good at sport' but what exactly were you doing, and what about it felt right?",
        scaffoldingSteps: [
          "Describe the moment: where were you, and what were you actually doing?",
          "What about it felt natural or right — not just that you did it well, but that it felt like you?",
          "Think of another time you felt this way. What do those moments have in common?",
          "What does this pattern suggest about who you are?",
        ],
        sentenceStarters: [
          "I felt genuinely capable when...",
          "Something that seems easy for me but hard for others is...",
          "I lose track of time when I'm...",
        ],
      },
      {
        id: "values-clarifier",
        type: "values_picker",
        title: "Values Clarifier",
        subtitle: "Step 2 of 5",
        intro:
          "Strengths are about what you can do. Values are about what you care about. This step asks you to move from ability to belief — from 'I'm good at this' to 'this matters to me.' They're different things, and both shape who you are. Hover over any value to read its definition.",
        prompt:
          "From the list below, choose the five values that feel most like you — not the ones you think you should have, but the ones that are actually true.",
        valuesOptions: VALUES_LIST,
        valuesCount: 5,
      },
      {
        id: "mask-check",
        type: "journal",
        title: "The Mask Check",
        subtitle: "Step 3 of 5",
        intro:
          "Most people have a version of themselves they show the world and a version they keep private. That's normal. But if the gap between those two gets too wide, it can feel like you're losing track of which one is real. This step is about noticing where the gap is biggest — not judging it, just seeing it clearly.",
        warmUp:
          "Think of three places you spend time — school, home, with close friends. In which one do you feel most relaxed? In which are you most careful about what you say?",
        storyBefore: 0,
        prompt:
          "Think about who you are at school, at home, and with your closest friends. Where do you feel most like yourself? Where do you feel like you're performing?",
        secondaryPrompt:
          "What would it look like to bring a little more of the real you into one of those spaces?",
        scaffoldingSteps: [
          "Pick one of these settings — school, home, or with close friends. Describe the version of yourself people see there.",
          "Where is the gap biggest between how you present yourself and how you actually feel inside?",
          "What are you afraid would happen if you showed more of the real you in that space?",
          "What would one small step toward closing that gap look like?",
        ],
        sentenceStarters: [
          "I feel most like myself when...",
          "I tend to hide the part of me that...",
          "I wish people knew that I...",
        ],
      },
      {
        id: "identity-letter",
        type: "milestone_letter",
        title: "Identity Letter",
        subtitle: "Step 4 of 5 — Milestone",
        intro:
          "You've mapped your strengths, named your values, and noticed where you're real versus where you perform. Now comes the part that ties it together. This letter isn't a summary — it's an honest note to yourself about who you actually are right now. Not who you're becoming. Not who you hope to be. Just: you, now.",
        warmUp:
          "If you had to describe yourself to someone who'd never met you — not your achievements, not your appearance, just your inner self — what three things would you say?",
        storyBefore: 1,
        prompt:
          "Write a short letter to yourself — not who you think you should be, but who you actually are right now. Be honest. Be kind.",
        secondaryPrompt:
          "This letter is private. Nobody else will ever read it. That's the whole point.",
        isMilestone: true,
        scaffoldingSteps: [
          "Describe who you are today — your personality, your quirks, what genuinely matters to you (not your achievements or roles).",
          "Acknowledge something difficult or uncertain about who you are right now. It's okay if things aren't settled.",
          "Say something kind and honest about yourself that you rarely admit out loud.",
          "What would you want your future self to remember about who you are at this exact moment?",
        ],
        sentenceStarters: [
          "Right now, you are someone who...",
          "Something true about you that you don't say enough is...",
          "The version of you that nobody sees is...",
        ],
      },
      {
        id: "weekly-challenge",
        type: "challenge",
        title: "Weekly Challenge",
        subtitle: "Step 5 of 5",
        intro:
          "Identity isn't just what you think about yourself — it's what you do. This final step asks you to take something you've discovered in this mission and act on it in the real world. Small is fine. Real is the point.",
        prompt:
          "Do one thing this week that feels like the real you — something you'd do even if nobody was watching.",
        isChallenge: true,
        challengeDebriefDays: 7,
      },
    ],
  },
  {
    id: 2,
    title: "Purpose",
    subtitle: "Mission 2",
    question: "What do I care about?",
    phase: "commitment",
    phaseLabel: "Phase 2 — Commitment",
    phaseDescription:
      "Moving from self-knowledge to conscious choices about what matters.",
    description:
      "Once you have a clearer sense of who you are, the next question is what you're going to do about it. Purpose isn't found — it's built, gradually, by paying attention to what genuinely pulls you. This mission helps you identify the problems you can't ignore and the causes that feel like yours.",
    colour: "#2E7D8C",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "what-matters",
        type: "journal",
        title: "What Matters",
        subtitle: "Step 1",
        intro:
          "Purpose often starts not with a grand vision, but with a quiet anger or a persistent pull — something in the world that bothers you, or something you find yourself drawn back to again and again. This step is about naming that thing.",
        prompt:
          "Write about something that genuinely matters to you — a problem in the world, a person you admire, a cause you care about. Why does it matter?",
        scaffoldingSteps: [
          "What's a problem in the world — local or global — that actually bothers you? Not one you feel you should care about, but one you actually do.",
          "Is there a person you admire — real or historical — whose life or work pulls you toward something? What is it about them?",
          "When you think about your future, what kind of impact, however small, would feel meaningful?",
          "What do all of these have in common?",
        ],
        sentenceStarters: [
          "Something in the world that genuinely bothers me is...",
          "When I see this kind of thing, I feel...",
          "I keep coming back to this because...",
        ],
        locked: false,
      },
      {
        id: "purpose-2",
        type: "journal",
        title: "Coming soon",
        subtitle: "More to come",
        prompt: "",
        locked: true,
      },
    ],
  },
  {
    id: 3,
    title: "Connection",
    subtitle: "Mission 3",
    question: "Where do I belong?",
    phase: "commitment",
    phaseLabel: "Phase 2 — Commitment",
    phaseDescription:
      "Understanding how your relationships shape and reflect who you are.",
    description:
      "Who you are doesn't exist in isolation — it's shaped by the people around you. This mission explores the relationships that matter most: where you feel genuinely known, where you feel like you belong, and what that tells you about yourself.",
    colour: "#4A7C59",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "belonging",
        type: "journal",
        title: "Where You Belong",
        subtitle: "Step 1",
        intro:
          "The relationships that shape us most aren't always the loudest ones. This step asks you to look at where you feel most genuinely yourself — not most comfortable, but most real.",
        prompt:
          "Think about the people in your life who make you feel most like yourself. What is it about those relationships that matters?",
        scaffoldingSteps: [
          "Think of a person or group where you feel genuinely accepted — not just tolerated. Who are they, and what's that relationship like?",
          "What is it about those people that lets you show up as yourself?",
          "Is there somewhere you feel like you don't quite fit, or you're still searching for your people? What does that feel like?",
          "What does belonging actually mean to you — what does it require?",
        ],
        sentenceStarters: [
          "I feel most myself when I'm with...",
          "What those relationships have in common is...",
          "I'm still looking for...",
        ],
        locked: false,
      },
      {
        id: "connection-2",
        type: "journal",
        title: "Coming soon",
        subtitle: "More to come",
        prompt: "",
        locked: true,
      },
    ],
  },
  {
    id: 4,
    title: "Meaning",
    subtitle: "Mission 4",
    question: "What kind of life do I want?",
    phase: "integration",
    phaseLabel: "Phase 3 — Integration",
    phaseDescription:
      "Weaving what you know about yourself into how you actually live.",
    description:
      "This mission brings everything together. It's not about a life that looks good from the outside — it's about building one that feels worth waking up inside. You've explored who you are, what you care about, and where you belong. Now the question is: what do you actually do with all of that?",
    colour: "#C8982A",
    textColour: "#1A1A1A",
    activities: [
      {
        id: "future-self",
        type: "journal",
        title: "Future Self",
        subtitle: "Step 1",
        intro:
          "Identity is a story you're always in the middle of writing. This step asks you to look ahead — not to plan your life, but to understand what kind of person you want to be growing into.",
        prompt:
          "Imagine yourself at 25. What do you hope you'll have learned about yourself by then?",
        scaffoldingSteps: [
          "Picture yourself at 25 in an ordinary week — not a highlight, just a regular Tuesday. What does that look like? Where are you, what are you doing?",
          "What do you hope you'll have figured out about yourself by then that you haven't yet?",
          "What do you want to have stayed the same about you — the things you'd be sad to lose?",
          "What's one thing the version of you right now could start doing that would make the 25-year-old version grateful?",
        ],
        sentenceStarters: [
          "By 25, I hope I'll have learned...",
          "I want to have stayed the same in the way that...",
          "The thing I'd be most sad to lose about who I am now is...",
        ],
        locked: false,
      },
      {
        id: "meaning-2",
        type: "journal",
        title: "Coming soon",
        subtitle: "More to come",
        prompt: "",
        locked: true,
      },
    ],
  },
];

export function getMission(id: number): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function getActivity(
  missionId: number,
  activityId: string
): Activity | undefined {
  const mission = getMission(missionId);
  return mission?.activities.find((a) => a.id === activityId);
}
