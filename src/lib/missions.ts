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

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Identity",
    subtitle: "Mission 1",
    question: "Who am I becoming?",
    description:
      "Before you can build a life that matters, you need to know who's building it. This mission helps you find the thread that runs through everything you are.",
    colour: "#1B3A5C",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "strengths-mapping",
        type: "journal",
        title: "Strengths Mapping",
        subtitle: "Step 1 of 5",
        prompt:
          "Think about a moment recently when you felt genuinely good at something. What were you doing? What made it feel natural?",
        secondaryPrompt:
          "Try to be specific — not 'I'm good at sport' but what exactly were you doing, and what about it felt right?",
      },
      {
        id: "values-clarifier",
        type: "values_picker",
        title: "Values Clarifier",
        subtitle: "Step 2 of 5",
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
        prompt:
          "Think about who you are at school, at home, and with your closest friends. Where do you feel most like yourself? Where do you feel like you're performing?",
        secondaryPrompt:
          "What would it look like to bring a little more of the real you into one of those spaces?",
      },
      {
        id: "identity-letter",
        type: "milestone_letter",
        title: "Identity Letter",
        subtitle: "Step 4 of 5 — Milestone",
        prompt:
          "Write a short letter to yourself — not who you think you should be, but who you actually are right now. Be honest. Be kind.",
        secondaryPrompt:
          "This letter is private. Nobody else will ever read it. That's the whole point.",
        isMilestone: true,
      },
      {
        id: "weekly-challenge",
        type: "challenge",
        title: "Weekly Challenge",
        subtitle: "Step 5 of 5",
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
    description:
      "Purpose isn't something you find fully formed. It starts with noticing what makes you angry, what pulls you in, what you can't quite leave alone.",
    colour: "#2E7D8C",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "what-matters",
        type: "journal",
        title: "What Matters",
        subtitle: "Step 1",
        prompt:
          "Write about something that genuinely matters to you — a problem in the world, a person you admire, a cause you care about. Why does it matter?",
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
    description:
      "The relationships that shape us most aren't always the loudest ones. This mission is about understanding who you are when you're with the people who really know you.",
    colour: "#4A7C59",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "belonging",
        type: "journal",
        title: "Where You Belong",
        subtitle: "Step 1",
        prompt:
          "Think about the people in your life who make you feel most like yourself. What is it about those relationships that matters?",
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
    description:
      "Not the life that looks good from the outside — the life that feels worth waking up inside. This mission asks the harder question.",
    colour: "#C8982A",
    textColour: "#1A1A1A",
    activities: [
      {
        id: "future-self",
        type: "journal",
        title: "Future Self",
        subtitle: "Step 1",
        prompt:
          "Imagine yourself at 25. What do you hope you'll have learned about yourself by then?",
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
