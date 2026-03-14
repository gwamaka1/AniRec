import { useState } from 'react'
import { fetchCoverImage } from '../lib/anilist'
import { useEffect } from 'react'

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F']
const TIER_COLORS = {
  S: 'bg-yellow-500 hover:bg-yellow-400',
  A: 'bg-red-500 hover:bg-red-400',
  B: 'bg-orange-500 hover:bg-orange-400',
  C: 'bg-yellow-600 hover:bg-yellow-500',
  D: 'bg-gray-500 hover:bg-gray-400',
  F: 'bg-gray-700 hover:bg-gray-600',
}

function WatchlistCard({ anime, onRemove, onAddToTier }) {
  const [coverUrl, setCoverUrl] = useState(anime.coverUrl || null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [showTiers, setShowTiers] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (coverUrl) return
    let cancelled = false
    fetchCoverImage(anime.title).then((url) => {
      if (!cancelled && url) setCoverUrl(url)
    })
    return () => { cancelled = true }
  }, [anime.title])

  const handleTierClick = (tier) => {
    onAddToTier({ ...anime, coverUrl: coverUrl || anime.coverUrl || null }, tier)
    setShowTiers(false)
    setAdded(true)
  }

  return (
    <div className="card-glow bg-dark-700 border border-dark-500 rounded-xl overflow-hidden animate-slide-up transition-all duration-200 hover:scale-[1.02] group">
      <div className="flex gap-3 p-3">
        <div className="w-14 h-20 rounded-lg overflow-hidden bg-dark-600 shrink-0">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={anime.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
              No img
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-semibold text-sm leading-tight">{anime.title}</h3>
            <button
              onClick={() => onRemove(anime.id)}
              className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 p-0.5"
              title="Remove"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-2">
            {added ? (
              <span className="text-xs text-accent-cyan font-medium">✓ Added to tier list</span>
            ) : showTiers ? (
              <div className="flex gap-1 flex-wrap animate-fade-in">
                {TIERS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleTierClick(tier)}
                    className={`${TIER_COLORS[tier]} text-white font-bold text-xs w-7 h-7 rounded-md transition-colors`}
                  >
                    {tier}
                  </button>
                ))}
                <button
                  onClick={() => setShowTiers(false)}
                  className="text-gray-500 hover:text-gray-300 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTiers(true)}
                className="text-xs px-3 py-1 rounded-lg bg-dark-600 hover:bg-dark-500 text-gray-300 hover:text-white transition-colors border border-dark-500"
              >
                Move to tier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Watchlist({ watchlist, onRemove, onAddToTier, onSwitchTab }) {
  if (watchlist.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-4xl mb-3 opacity-30">~</div>
        <p className="text-gray-500 mb-2">No anime in your watch later list</p>
        <p className="text-gray-600 text-sm mb-4">
          Click "Watch Later" on recommendations to save them here
        </p>
        <button
          onClick={onSwitchTab}
          className="px-4 py-2 rounded-xl bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors font-medium"
        >
          Get recommendations
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Watch Later</h2>
        <p className="text-gray-400 text-sm">
          {watchlist.length} anime saved to watch. Move them to your tier list after watching.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {watchlist.map((anime) => (
          <WatchlistCard
            key={anime.id}
            anime={anime}
            onRemove={onRemove}
            onAddToTier={onAddToTier}
          />
        ))}
      </div>
    </div>
  )
}
