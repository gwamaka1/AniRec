import { useState, useEffect, useRef } from 'react'
import { fetchCoverImage } from '../lib/anilist'

const matchColors = {
  high: { bar: 'bg-accent-cyan', text: 'text-accent-cyan' },
  medium: { bar: 'bg-accent-purple', text: 'text-accent-purple' },
  low: { bar: 'bg-accent-pink', text: 'text-accent-pink' },
}

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F']
const TIER_COLORS = {
  S: 'bg-yellow-500 hover:bg-yellow-400',
  A: 'bg-red-500 hover:bg-red-400',
  B: 'bg-orange-500 hover:bg-orange-400',
  C: 'bg-yellow-600 hover:bg-yellow-500',
  D: 'bg-gray-500 hover:bg-gray-400',
  F: 'bg-gray-700 hover:bg-gray-600',
}

function getConfidence(percent) {
  if (percent >= 80) return 'high'
  if (percent >= 60) return 'medium'
  return 'low'
}

export default function RecommendationCard({ recommendation, index, onAddToTier, onDismiss, onWatchLater, existingTitles, watchlistTitles }) {
  const { title, reason, matchPercent } = recommendation
  const confidence = getConfidence(matchPercent)
  const colors = matchColors[confidence]
  const [showTiers, setShowTiers] = useState(false)
  const [selectedTier, setSelectedTier] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [coverUrl, setCoverUrl] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const noteRef = useRef(null)
  const isAdded = existingTitles?.has(title.toLowerCase())
  const isWatchlisted = watchlistTitles?.has(title.toLowerCase())

  useEffect(() => {
    let cancelled = false
    fetchCoverImage(title).then((url) => {
      if (!cancelled && url) setCoverUrl(url)
    })
    return () => { cancelled = true }
  }, [title])

  useEffect(() => {
    if (selectedTier && noteRef.current) noteRef.current.focus()
  }, [selectedTier])

  const handleTierClick = (tier) => {
    setSelectedTier(tier)
    setShowTiers(false)
  }

  const handleConfirmAdd = () => {
    onAddToTier({ id: `rec-${Date.now()}`, title, year: null, genres: [], coverUrl: coverUrl || null, note: noteText.trim() || undefined }, selectedTier)
    setSelectedTier(null)
    setNoteText('')
  }

  return (
    <div
      className="card-glow bg-dark-700 border border-dark-500 rounded-xl overflow-hidden animate-slide-up transition-all duration-200 hover:scale-[1.02] flex flex-col"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      <div className="flex gap-3 p-4">
        <div className="w-16 h-24 rounded-lg overflow-hidden bg-dark-600 shrink-0">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
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
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-white font-bold text-base leading-tight">{title}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-sm font-bold ${colors.text}`}>
                {matchPercent}%
              </span>
              <button
                onClick={() => onDismiss?.(index)}
                className="text-gray-600 hover:text-red-400 transition-colors p-0.5"
                title="Dismiss"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="w-full bg-dark-800 rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full ${colors.bar} transition-all duration-500`}
              style={{ width: `${matchPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{reason}</p>

      {isAdded ? (
        <div className="text-xs text-accent-cyan font-medium text-center py-1.5">
          ✓ Added to your list
        </div>
      ) : selectedTier ? (
        <div className="animate-fade-in">
          <p className="text-xs text-gray-400 mb-1.5">
            Adding to <span className="font-bold text-white">{selectedTier}</span> tier — why do you like it? <span className="text-gray-600">(optional)</span>
          </p>
          <textarea
            ref={noteRef}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleConfirmAdd() } if (e.key === 'Escape') { setSelectedTier(null); setNoteText('') } }}
            placeholder="e.g. love the art style, great characters, heard it's similar to..."
            className="w-full bg-dark-800 border border-dark-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan resize-none mb-2"
            rows={2}
            maxLength={200}
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirmAdd}
              className="flex-1 py-1.5 rounded-lg bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 text-xs font-medium transition-colors"
            >
              Add to {selectedTier}
            </button>
            <button
              onClick={() => { setNoteText(''); handleConfirmAdd() }}
              className="py-1.5 px-3 rounded-lg bg-dark-600 hover:bg-dark-500 text-gray-400 text-xs transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => { setSelectedTier(null); setNoteText('') }}
              className="py-1.5 px-2 text-gray-600 hover:text-gray-300 text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {showTiers ? (
            <div className="flex gap-1 justify-center flex-wrap animate-fade-in">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleTierClick(tier)}
                  className={`${TIER_COLORS[tier]} text-white font-bold text-sm w-9 h-9 rounded-lg transition-colors`}
                >
                  {tier}
                </button>
              ))}
              <button
                onClick={() => setShowTiers(false)}
                className="text-gray-500 hover:text-gray-300 text-xs px-2"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowTiers(true)}
                className="flex-1 py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500 text-gray-300 hover:text-white text-sm font-medium transition-colors border border-dark-500 hover:border-dark-400"
              >
                + Add to tier
              </button>
              {isWatchlisted ? (
                <span className="py-1.5 px-3 rounded-lg bg-accent-blue/10 text-accent-blue text-xs font-medium flex items-center">
                  Saved
                </span>
              ) : (
                <button
                  onClick={() => onWatchLater?.({ id: `wl-${Date.now()}`, title, year: null, genres: [], coverUrl: coverUrl || null })}
                  className="py-1.5 px-3 rounded-lg bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue text-xs font-medium transition-colors"
                  title="Watch Later"
                >
                  Watch Later
                </button>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
