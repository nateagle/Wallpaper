
export interface Wallpaper {
  id: string;
  url: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  isAI?: boolean;
}

export type Category = 
  | 'All' 
  | 'Nature' 
  | 'Abstract' 
  | 'Minimal' 
  | 'Cyberpunk' 
  | 'Space' 
  | 'Architecture' 
  | 'Animals';

export type Language = 'en' | 'pt';

export type Resolution = '1K' | '2K' | '4K';

export interface GenerationState {
  loading: boolean;
  error: string | null;
  result: string | null;
}
