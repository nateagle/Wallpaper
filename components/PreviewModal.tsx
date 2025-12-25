
import React, { useState } from 'react';
import { Wallpaper, Language } from '../types';
import { translations } from '../i18n';
import { X, Download, Smartphone, Laptop, Heart, Share2 } from 'lucide-react';

interface PreviewModalProps {
  wallpaper: Wallpaper;
  onClose: () => void;
  lang: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShare: (wallpaper: Wallpaper) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ 
  wallpaper, 
  onClose, 
  lang, 
  isFavorite, 
  onToggleFavorite,
  onShare
}) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const t = translations[lang];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = wallpaper.url;
    link.download = `${wallpaper.title.toLowerCase().replace(/\s+/g, '-')}-lumina.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col md:flex-row bg-[#0a0a0a] rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        <div className="relative flex-1 bg-neutral-900/50 flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-500/20 via-transparent to-transparent" />
          </div>

          {device === 'mobile' ? (
            <div className="relative w-[280px] h-[580px] sm:w-[320px] sm:h-[660px] bg-neutral-800 rounded-[3rem] p-3 border-[6px] border-neutral-700 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-700 rounded-b-2xl z-10" />
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-black relative">
                <img src={wallpaper.url} className="w-full h-full object-cover" alt="preview" />
                <div className="absolute inset-x-0 top-12 text-center text-white/90 drop-shadow-lg">
                  <div className="text-5xl font-light">12:45</div>
                  <div className="text-sm mt-1">{lang === 'pt' ? 'Quinta-feira, 24 Out' : 'Thursday, Oct 24'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-neutral-800 rounded-xl p-2 border-4 border-neutral-700 shadow-2xl overflow-hidden">
               <img src={wallpaper.url} className="w-full h-full object-cover rounded" alt="preview" />
            </div>
          )}

          <button onClick={onClose} className="absolute top-4 right-4 md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
            <X size={20} />
          </button>
        </div>

        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-800 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{wallpaper.title}</h2>
              <p className="text-sm text-neutral-400">by {wallpaper.author}</p>
            </div>
            <button onClick={onClose} className="hidden md:flex p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 block">{t.previewOn}</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDevice('mobile')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${device === 'mobile' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-neutral-800 hover:border-neutral-600'}`}>
                  <Smartphone size={18} />
                  <span className="text-sm font-medium">{t.mobile}</span>
                </button>
                <button onClick={() => setDevice('desktop')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${device === 'desktop' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-neutral-800 hover:border-neutral-600'}`}>
                  <Laptop size={18} />
                  <span className="text-sm font-medium">{t.desktop}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => onToggleFavorite(wallpaper.id)}
                  className={`flex-1 p-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${isFavorite ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`}
                >
                  <Heart size={18} className={isFavorite ? "fill-red-500" : ""} />
                </button>
                <button 
                  onClick={() => onShare(wallpaper)}
                  className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                </button>
              </div>
              <button onClick={handleDownload} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95">
                <Download size={20} />
                {t.download}
              </button>
              <p className="text-[10px] text-center text-neutral-500 mt-4">{t.freeForUse}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
