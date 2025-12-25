
import { Wallpaper, Category } from './types';

export const CATEGORIES: Category[] = [
  'All',
  'Nature',
  'Abstract',
  'Minimal',
  'Cyberpunk',
  'Space',
  'Architecture',
  'Animals'
];

// Generates more items for scroll testing
const generateMockData = () => {
  const base = [
    { id: '1', url: 'https://picsum.photos/seed/wall1/1080/1920', title: 'Neon Horizon', author: 'Lumina Studio', category: 'Cyberpunk', tags: ['neon', 'city'] },
    { id: '2', url: 'https://picsum.photos/seed/wall2/1080/1920', title: 'Arctic Silence', author: 'Nature Captured', category: 'Nature', tags: ['snow', 'mountain'] },
    { id: '3', url: 'https://picsum.photos/seed/wall3/1080/1920', title: 'Flow of Gold', author: 'Abstract Minds', category: 'Abstract', tags: ['gold', 'liquid'] },
    { id: '4', url: 'https://picsum.photos/seed/wall4/1080/1920', title: 'Zen Void', author: 'Minimalist', category: 'Minimal', tags: ['black', 'dot'] },
    { id: '5', url: 'https://picsum.photos/seed/wall5/1080/1920', title: 'Interstellar Drift', author: 'Galactic Art', category: 'Space', tags: ['stars', 'nebula'] },
    { id: '6', url: 'https://picsum.photos/seed/wall6/1080/1920', title: 'Brutalist Dream', author: 'ArchViz', category: 'Architecture', tags: ['concrete', 'shadow'] },
    { id: '7', url: 'https://picsum.photos/seed/wall7/1080/1920', title: 'Ethereal Tiger', author: 'Wild Heart', category: 'Animals', tags: ['tiger', 'magic'] },
    { id: '8', url: 'https://picsum.photos/seed/wall8/1080/1920', title: 'Desert Mirage', author: 'Nature Captured', category: 'Nature', tags: ['sand', 'sun'] },
  ];

  const extended = [...base];
  for(let i = 9; i <= 40; i++) {
    const randomBase = base[Math.floor(Math.random() * base.length)];
    extended.push({
      ...randomBase,
      id: i.toString(),
      url: `https://picsum.photos/seed/wall${i}/1080/1920`,
      title: `${randomBase.title} ${i}`
    });
  }
  return extended;
};

export const MOCK_WALLPAPERS: Wallpaper[] = generateMockData();
