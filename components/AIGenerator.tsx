
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Wand2, History as HistoryIcon, ShieldCheck, ExternalLink } from 'lucide-react';
import { generateWallpaper } from '../services/geminiService';
import { Wallpaper, Language, Resolution } from '../types';
import { translations } from '../i18n';

interface AIGeneratorProps {
  onGenerated: (wallpaper: Wallpaper) => void;
  lang: Language;
  history: Wallpaper[];
  onSelectHistory: (wallpaper: Wallpaper) => void;
}

// Fix: Augmenting global Window interface correctly using the expected AIStudio type.
// We use the 'AIStudio' name as required by the compiler error and make it optional
// to ensure identical modifiers with other declarations in the environment.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ 
  onGenerated, 
  lang, 
  history,
  onSelectHistory
}) => {
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  
  const t = translations[lang];

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    // Fix: Safely access aistudio using optional chaining as it is now correctly declared as optional
    const selected = await window.aistudio?.hasSelectedApiKey();
    setHasKey(!!selected);
  };

  const handleOpenKeySelector = async () => {
    // Fix: Safely access aistudio using optional chaining
    await window.aistudio?.openSelectKey();
    setHasKey(true); // Assume success per guidelines
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    if (!hasKey) {
      await handleOpenKeySelector();
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const imageUrl = await generateWallpaper(prompt, "9:16", resolution);
      const newWall: Wallpaper = {
        id: `ai-${Date.now()}`,
        url: imageUrl,
        title: prompt.length > 20 ? prompt.substring(0, 17) + '...' : prompt,
        author: 'Lumina AI',
        category: 'Abstract',
        tags: ['ai', 'generated', 'custom', resolution],
        isAI: true
      };
      onGenerated(newWall);
      setPrompt('');
    } catch (err: any) {
      if (err.message === "API_KEY_INVALID") {
        setHasKey(false);
        setError(lang === 'pt' ? 'Chave de API inválida. Selecione novamente.' : 'Invalid API Key. Please select again.');
      } else {
        setError(lang === 'pt' ? 'Falha ao gerar. Tente outro prompt.' : 'Failed to generate. Try a different prompt.');
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-indigo-600/10 border border-indigo-500/20 p-8 mb-12">
      <div className="absolute top-0 right-0 p-8 opacity-20 hidden lg:block">
        <Sparkles size={160} className="text-indigo-500 animate-pulse" />
      </div>
      
      <div className="relative z-10 w-full">
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t.aiStudioExperimental}</span>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {t.aiStudioTitle}
            </h2>
          </div>
          <p className="text-neutral-400 mb-6 leading-relaxed">
            {t.aiStudioDescription}
          </p>

          {!hasKey && hasKey !== null && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="text-amber-200 text-sm font-medium flex items-center gap-2">
                  <ShieldCheck size={16} />
                  {t.keyRequired}
                </p>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-500 text-xs hover:underline flex items-center gap-1 mt-1"
                >
                  {t.billingInfo} <ExternalLink size={10} />
                </a>
              </div>
              <button 
                onClick={handleOpenKeySelector}
                className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
              >
                {t.selectKey}
              </button>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder={t.aiStudioPlaceholder}
                className="flex-1 bg-black/40 border border-neutral-800 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-neutral-600"
                disabled={isGenerating}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    {t.generate}
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{t.resolution}</span>
              <div className="flex bg-black/40 p-1 rounded-xl border border-neutral-800">
                {(['1K', '2K', '4K'] as Resolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      resolution === res 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {res === '1K' ? '1080p' : res === '2K' ? '1440p' : '4K'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm mt-3 animate-bounce">{error}</p>
          )}
        </div>

        {/* History Section */}
        <div className="mt-8 pt-8 border-t border-indigo-500/10">
          <div className="flex items-center gap-2 mb-4 text-neutral-300">
            <HistoryIcon size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">{t.recentCreations}</h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {history.length > 0 ? (
              history.map((wall) => (
                <div 
                  key={wall.id}
                  onClick={() => onSelectHistory(wall)}
                  className="relative shrink-0 w-24 aspect-[9/16] rounded-xl overflow-hidden cursor-pointer border border-neutral-800 hover:border-indigo-500 transition-all group"
                >
                  <img 
                    src={wall.url} 
                    alt={wall.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 italic">{t.noCreations}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
