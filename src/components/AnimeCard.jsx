import { useState, useEffect, useRef } from 'react'
import { fetchCoverImage } from '../lib/anilist'

export default function AnimeCard({ anime, onRemove, onUpdateNote, compact }) {
  const [coverUrl, setCoverUrl] = useState(anime.coverUrl || null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [noteText, setNoteText] = useState(anime.note || '')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (coverUrl) return
    let cancelled = false
    fetchCoverImage(anime.title).then((url) => {
      if (!cancelled && url) {
        setCoverUrl(url)
        anime.coverUrl = url
      }
    })
    return () => { cancelled = true }
  }, [anime.title])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editing])

  const saveNote = () => {
    const trimmed = noteText.trim()
    onUpdateNote?.(anime.id, trimmed)
    setEditing(false)
  }

  if (compact) {
    return (
      <div className="bg-dark-700/80 rounded-lg p-1.5 group animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-10 h-14 rounded overflow-hidden bg-dark-600 shrink-0">
            {coverUrl && (
              <img
                src={coverUrl}
                alt={anime.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{anime.title}</p>
            <div className="flex gap-1 mt-0.5">
              {anime.genres?.slice(0, 2).map((g) => (
                <span key={g} className="text-[10px] px-1 py-0.5 rounded bg-dark-600 text-gray-500">
                  {g}
                </span>
              ))}
            </div>
          </div>
          {onUpdateNote && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(!editing) }}
              className={`shrink-0 p-1 transition-colors ${anime.note ? 'text-accent-cyan' : 'text-gray-600 opacity-0 group-hover:opacity-100'} hover:text-accent-cyan`}
              title={anime.note ? 'Edit note' : 'Add note'}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(anime.id) }}
              className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {!editing && anime.note && (
          <p className="text-[10px] text-accent-cyan/70 mt-1 ml-12 truncate italic">"{anime.note}"</p>
        )}
        {editing && (
          <div className="mt-1.5 ml-12 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <textarea
              ref={textareaRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote() } if (e.key === 'Escape') setEditing(false) }}
              placeholder="What did you like/dislike? (e.g. amazing fights, weak ending, loved the characters...)"
              className="w-full bg-dark-800 border border-dark-500 rounded-lg px-2 py-1.5 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan resize-none"
              rows={2}
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-gray-600">{noteText.length}/200</span>
              <div className="flex gap-1">
                <button onClick={() => setEditing(false)} className="text-[10px] px-2 py-0.5 text-gray-500 hover:text-gray-300">Cancel</button>
                <button onClick={saveNote} className="text-[10px] px-2 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card-glow bg-dark-700 border border-dark-500 rounded-xl overflow-hidden animate-slide-up transition-all duration-200 hover:scale-[1.02] group">
      <div className="flex gap-3 p-3">
        <div className="w-16 h-24 rounded-lg overflow-hidden bg-dark-600 shrink-0">
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
          <h3 className="text-white font-semibold text-sm truncate">{anime.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            {anime.year && (
              <span className="text-gray-500 text-xs">{anime.year}</span>
            )}
          </div>
          <div className="flex gap-1 flex-wrap mt-1.5">
            {anime.genres?.slice(0, 3).map((g) => (
              <span key={g} className="text-xs px-1.5 py-0.5 rounded bg-dark-600 text-gray-400">
                {g}
              </span>
            ))}
          </div>
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(anime.id)}
            className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 p-1 self-start"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
