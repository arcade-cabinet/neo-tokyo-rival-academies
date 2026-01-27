export interface NarrativeLine {
  speaker: string;
  text: string;
  image: string;
}

export const INTRO_SCRIPT: NarrativeLine[] = [
  {
    speaker: 'Kai',
    text: 'Vera! The Council is watching. No shortcuts on the bridges.',
    image: '/assets/story/intro_01.png',
  },
  {
    speaker: 'Vera',
    text: 'Shortcuts are inefficient. I will take the path that survives.',
    image: '/assets/story/intro_02.png',
  },
  {
    speaker: 'Vera',
    text: 'The waterline is rising again. The Descent must end tonight.',
    image: '/assets/story/intro_02.png',
  },
  {
    speaker: 'Kai',
    text: 'Then we race above it. Kurenai never backs down.',
    image: '/assets/story/intro_01.png',
  },
  {
    speaker: 'SYSTEM',
    text: 'THE DESCENT INITIATED. GO!',
    image: '/assets/story/intro_01.png',
  },
];
