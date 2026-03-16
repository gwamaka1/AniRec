import { useState, useEffect, useRef } from 'react'

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F']
const TIER_COLORS = {
  S: 'bg-yellow-500 hover:bg-yellow-400',
  A: 'bg-red-500 hover:bg-red-400',
  B: 'bg-orange-500 hover:bg-orange-400',
  C: 'bg-yellow-600 hover:bg-yellow-500',
  D: 'bg-gray-500 hover:bg-gray-400',
  F: 'bg-gray-700 hover:bg-gray-600',
}

export default function TierPickerModal({ anime, onConfirm, onCancel }) {
  const [selectedTier, setSelectedTier] = useState(null)
  const [noteText, setNoteText] = useState('')
  const noteRef = useRef(null)

  // Reset state when a new anime is selected
  useEffect(() => {
    if (anime) {
      setSelectedTier(null)
      setNoteText('')
    }
  }, [anime])

  useEffect(() => {
    if (selectedTier && noteRef.current) noteRef.current.focus()
  }, [selectedTier])

  if (!anime) return null

  const handleConfirm = () => {
    onConfirm({ ...anime, note: noteText.trim() || undefined }, selectedTier)
  }

  const handleSkip = () => {
    onConfirm(anime, selectedTier)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onCancel}>
      <div className="bg-dark-700 border border-dark-500 rounded-2xl p-5 w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          {anime.coverUrl && (
            <img src={anime.coverUrl} alt="" className="w-12 h-16 object-cover rounded-lg shrink-0" />
          )}
          <div className="min-w-0">
            <h3 className="text-white font-bold text-sm truncate">{anime.title}</h3>
            {anime.year && <p className="text-gray-500 text-xs">{anime.year}</p>}
            <div className="flex gap-1 mt-0.5">
              {anime.genres?.slice(0, 3).map((g) => (
                <span key={g} className="text-[10px] px-1 py-0.5 rounded bg-dark-600 text-gray-500">{g}</span>
              ))}
            </div>
          </div>
        </div>

        {!selectedTier ? (
          <div>
            <p className="text-xs text-gray-400 mb-2">Pick a tier:</p>
            <div className="flex gap-1.5 justify-center">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`${TIER_COLORS[tier]} text-white font-bold text-sm w-10 h-10 rounded-lg transition-colors`}
                >
                  {tier}
                </button>
              ))}
            </div>
            <button
              onClick={onCancel}
              className="w-full mt-3 py-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="text-xs text-gray-400 mb-1.5">
              Adding to <span className="font-bold text-white">{selectedTier}</span> tier — what did you think? <span className="text-accent-cyan">(highly recommended for accurate results)</span>
            </p>
            <textarea
              ref={noteRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleConfirm() }
                if (e.key === 'Escape') onCancel()
              }}
              placeholder="e.g. amazing fights, weak ending, loved the characters..."
              className="w-full bg-dark-800 border border-dark-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan resize-none mb-2"
              rows={2}
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-600">{noteText.length}/200</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedTier(null); setNoteText('') }}
                  className="text-xs px-2 py-1 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSkip}
                  className="text-xs px-3 py-1 rounded-lg bg-dark-600 hover:bg-dark-500 text-gray-400 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleConfirm}
                  className="text-xs px-3 py-1 rounded-lg bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 font-medium transition-colors"
                >
                  Add to {selectedTier}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
