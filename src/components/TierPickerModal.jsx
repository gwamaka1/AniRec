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
  const [showNote, setShowNote] = useState(false)
  const noteRef = useRef(null)

  // Reset state when a new anime is selected
  useEffect(() => {
    if (anime) {
      setSelectedTier(null)
      setNoteText('')
      setShowNote(false)
    }
  }, [anime])

  useEffect(() => {
    if (showNote && noteRef.current) noteRef.current.focus()
  }, [showNote])

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
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => { setSelectedTier(null); setNoteText(''); setShowNote(false) }}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                &larr; Back
              </button>
              <span className="text-xs text-gray-400">
                Adding to <span className="font-bold text-white">{selectedTier}</span> tier
              </span>
            </div>

            {!showNote ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSkip}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-cyan text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Add to {selectedTier}
                </button>
                <button
                  onClick={() => setShowNote(true)}
                  className="w-full py-2 rounded-lg border border-dark-400 hover:border-accent-cyan/50 text-gray-400 hover:text-accent-cyan text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Add a note (helps recommendations)
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <p className="text-xs text-gray-400 mb-1.5">
                  What did you think? <span className="text-gray-600">(helps your anime guru give better recs)</span>
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
                  <button
                    onClick={handleConfirm}
                    className="text-xs px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-cyan text-white font-semibold hover:opacity-90 transition-opacity"
                  >
                    Add to {selectedTier}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
