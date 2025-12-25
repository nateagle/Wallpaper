
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Compass, Sparkles, User, Heart, Languages, Loader2, CheckCircle2 } from 'lucide-react';
import { CATEGORIES, MOCK_WALLPAPERS } from './constants';
import { Wallpaper, Category, Language } from './types';
import { translations } from './i18n';
import { WallpaperCard } from './components/WallpaperCard';
import { PreviewModal } from './components/PreviewModal';
import { AIGenerator } from './components/AIGenerator';

const App: React.FC = () => {
  // Utility to parse category from hash
  const getCategoryFromHash = (): Category => {
    const hash = window.location.hash;
    const match = hash.match(/category=([^&]*)/);
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]) as Category;
      if (CATEGORIES.includes(decoded)) return decoded;
    }
    return 'All';
  };

  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [activeCategory, setActiveCategory] = useState<Category>(getCategoryFromHash());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(MOCK_WALLPAPERS);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // AI History State
  const [aiHistory, setAiHistory] = useState<Wallpaper[]>(() => {
    const saved = localStorage.getItem('aiHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  // UI states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Pagination / Scroll state
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  const t = translations[lang];

  // Initialize and handle Hash Changes
  useEffect(() => {
    const handleHashChange = () => {
      const newCategory = getCategoryFromHash();
      setActiveCategory(newCategory);
      setVisibleItems(10);
      // If we change category via hash, we should probably exit favorites mode for clarity
      setShowOnlyFavorites(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(Array.from(favoriteIds)));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('aiHistory', JSON.stringify(aiHistory));
  }, [aiHistory]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = async (wallpaper: Wallpaper) => {
    const shareData = {
      title: 'Lumina Walls',
      text: `${t.shareTitle}: ${wallpaper.title}`,
      url: wallpaper.url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(wallpaper.url);
        setToastMessage(t.linkCopied);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const filteredWallpapers = useMemo(() => {
    // Merge actual wallpapers with AI history for the main feed if they aren't already there
    const combined = [...wallpapers];
    aiHistory.forEach(historyItem => {
      if (!combined.find(w => w.id === historyItem.id)) {
        combined.unshift(historyItem);
      }
    });

    return combined.filter(w => {
      const matchesCategory = activeCategory === 'All' || w.category === activeCategory;
      const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFavorites = !showOnlyFavorites || favoriteIds.has(w.id);
      return matchesCategory && matchesSearch && matchesFavorites;
    });
  }, [wallpapers, aiHistory, activeCategory, searchQuery, showOnlyFavorites, favoriteIds]);

  // Current visible slice
  const pagedWallpapers = useMemo(() => {
    return filteredWallpapers.slice(0, visibleItems);
  }, [filteredWallpapers, visibleItems]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleItems < filteredWallpapers.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleItems, filteredWallpapers.length, isLoadingMore]);

  const loadMore = () => {
    setIsLoadingMore(true);
    // Simulated network delay
    setTimeout(() => {
      setVisibleItems(prev => prev + 10);
      setIsLoadingMore(false);
    }, 800);
  };

  const handleAIGenerated = (newWall: Wallpaper) => {
    setAiHistory(prev => [newWall, ...prev.slice(0, 19)]); // Keep last 20 generations
    setSelectedWallpaper(newWall);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'pt' : 'en');
  };

  const handleCategorySelect = (category: Category) => {
    // Updating hash triggers the event listener which updates state
    window.location.hash = `category=${encodeURIComponent(category)}`;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-neutral-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
            window.scrollTo({top: 0, behavior: 'smooth'});
            setShowOnlyFavorites(false);
            handleCategorySelect('All');
          }}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-white hidden sm:inline">LUMINA</span>
          </div>

          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-full py-2 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleItems(10); // Reset pagination on search
              }}
            />
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 text-neutral-400 hover:text-indigo-400 transition-colors bg-neutral-900/50 border border-neutral-800 px-3 py-1.5 rounded-full"
            >
              <Languages size={16} />
              <span className="text-xs font-bold uppercase">{lang}</span>
            </button>
            <button 
              onClick={() => {
                setShowOnlyFavorites(!showOnlyFavorites);
                setVisibleItems(10);
              }}
              className={`transition-colors p-2 rounded-full ${showOnlyFavorites ? 'text-red-500 bg-red-500/10' : 'text-neutral-400 hover:text-white'}`}
            >
              <Heart size={20} className={showOnlyFavorites ? "fill-red-500" : ""} />
            </button>
            <button className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">
              <User size={18} className="text-neutral-400" />
              <span className="text-sm font-medium text-white hidden sm:inline">{t.profile}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            {showOnlyFavorites ? t.favorites : <>{t.heroTitle} <span className="text-indigo-500">{t.heroHighlight}</span></>}
          </h1>
          <p className="text-neutral-500 text-lg max-w-xl">
            {showOnlyFavorites ? "" : t.heroSubtitle}
          </p>
        </header>

        {!showOnlyFavorites && (
          <AIGenerator 
            onGenerated={handleAIGenerated} 
            lang={lang} 
            history={aiHistory}
            onSelectHistory={setSelectedWallpaper}
          />
        )}

        <div className="sticky top-[73px] z-30 bg-black/80 backdrop-blur-md py-4 mb-8 overflow-x-auto no-scrollbar border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <Compass size={20} className="text-indigo-500 shrink-0" />
            <div className="flex gap-2 whitespace-nowrap">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === category 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {t.categories[category]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {pagedWallpapers.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {pagedWallpapers.map(wallpaper => (
                <WallpaperCard 
                  key={wallpaper.id} 
                  wallpaper={wallpaper} 
                  onClick={setSelectedWallpaper}
                  isFavorite={favoriteIds.has(wallpaper.id)}
                  onToggleFavorite={toggleFavorite}
                  onShare={handleShare}
                />
              ))}
            </div>
            
            {/* Sentinel for Infinite Scroll */}
            <div ref={observerTarget} className="h-20 flex items-center justify-center mt-12">
              {visibleItems < filteredWallpapers.length && (
                <div className="flex items-center gap-3 text-neutral-500">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-sm font-medium">{t.loadMore}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {showOnlyFavorites && favoriteIds.size === 0 ? (
              <>
                <Heart size={48} className="text-neutral-700 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t.noFavorites}</h3>
                <button 
                  onClick={() => setShowOnlyFavorites(false)}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {t.discover}
                </button>
              </>
            ) : (
              <>
                <Search size={48} className="text-neutral-700 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t.noWallpapers}</h3>
                <p className="text-neutral-500">{t.tryAdjusting}</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-24 mt-12 border-t border-neutral-900">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tighter text-white">LUMINA</span>
          </div>
          <div className="flex gap-8 text-sm text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Creators</a>
          </div>
          <p className="text-xs text-neutral-600">© 2024 Lumina Walls Studio.</p>
        </div>
      </footer>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-neutral-950/80 backdrop-blur-2xl border-t border-neutral-900 p-4 md:hidden z-40">
        <div className="flex justify-around items-center">
          <button onClick={() => {
            handleCategorySelect('All');
            setShowOnlyFavorites(false);
          }} className={`flex flex-col items-center gap-1 ${!showOnlyFavorites ? 'text-indigo-500' : 'text-neutral-500'}`}>
            <Compass size={24} />
            <span className="text-[10px] font-bold">{t.discover}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <Sparkles size={24} />
            <span className="text-[10px]">{t.aiTools}</span>
          </button>
          <button 
            onClick={() => setShowOnlyFavorites(true)}
            className={`flex flex-col items-center gap-1 ${showOnlyFavorites ? 'text-red-500' : 'text-neutral-500'}`}
          >
            <Heart size={24} className={showOnlyFavorites ? "fill-red-500" : ""} />
            <span className="text-[10px]">{t.favorites}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-500">
            <User size={24} />
            <span className="text-[10px]">{t.profile}</span>
          </button>
        </div>
      </div>

      {selectedWallpaper && (
        <PreviewModal 
          wallpaper={selectedWallpaper} 
          onClose={() => setSelectedWallpaper(null)} 
          lang={lang}
          isFavorite={favoriteIds.has(selectedWallpaper.id)}
          onToggleFavorite={toggleFavorite}
          onShare={handleShare}
        />
      )}
    </div>
  );
};

export default App;
