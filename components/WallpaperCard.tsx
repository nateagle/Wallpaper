
import React from 'react';
import { Wallpaper } from '../types';
import { Eye, Heart, Sparkles, Share2 } from 'lucide-react';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onClick: (wallpaper: Wallpaper) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShare: (wallpaper: Wallpaper) => void;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({ 
  wallpaper, 
  onClick, 
  isFavorite, 
  onToggleFavorite,
  onShare
}) => {
  return (
    <div 
      className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-neutral-900 cursor-pointer border border-neutral-800 transition-all hover:border-neutral-500 hover:scale-[1.02]"
      onClick={() => onClick(wallpaper)}
    >
      <img 
        src={wallpaper.url} 
        alt={wallpaper.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
        {/* Favorite Button (Top Right) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(wallpaper.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all"
        >
          <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : "text-white"} />
        </button>

        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white leading-tight truncate">{wallpaper.title}</h3>
            <p className="text-[10px] text-neutral-300">by {wallpaper.author}</p>
          </div>
          {wallpaper.isAI && (
            <div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px] border border-purple-500/30">
              <Sparkles size={10} />
              AI
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-2 rounded-lg text-xs font-medium transition-colors">
            <Eye size={14} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShare(wallpaper);
            }}
            className="flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg transition-colors"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
