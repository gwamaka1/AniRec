import { useState, useRef, useEffect, useCallback } from 'react'
import { searchAnime } from '../lib/jikan'

function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export default function AnimeSearchBar({ onAdd, onSelect, existingTitles }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const normalizedQuery = query.trim().toLowerCase()
  const alreadyAdded = existingTitles.has(normalizedQuery)
  const exactMatch = results.some((a) => a.title.toLowerCase() === normalizedQuery)
  const showCustomOption = normalizedQuery.length >= 2 && !exactMatch && !alreadyAdded && !loading

  const doSearch = useCallback(
    debounce(async (q) => {
      if (q.length < 2) { setResults([]); setLoading(false); return }
      setLoading(true)
      try {
        const found = await searchAnime(q)
        setResults(found.filter((a) => !existingTitles.has(a.title.toLowerCase())))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 450),
    [existingTitles]
  )

  useEffect(() => {
    if (normalizedQuery.length >= 2) {
      setLoading(true)
      doSearch(normalizedQuery)
    } else {
      setResults([])
      setLoading(false)
    }
  }, [normalizedQuery])

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAdd = (anime) => {
    onSelect(anime)
    setQuery('')
    setResults([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleAddCustom = () => {
    handleAdd({
      id: `custom-${Date.now()}`,
      title: query.trim(),
      year: null,
      genres: [],
      coverUrl: null,
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && showCustomOption && results.length === 0) {
      handleAddCustom()
    }
    if (e.key === 'Escape') setShowDropdown(false)
  }

  const showPanel = showDropdown && normalizedQuery.length >= 2 && (loading || results.length > 0 || showCustomOption)

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search any anime from MyAnimeList..."
          className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors"
        />
        <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {loading && (
          <svg className="absolute right-3 top-3.5 w-4 h-4 text-accent-purple animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {showPanel && (
        <div
          ref={dropdownRef}
          className="absolute z-30 w-full mt-2 bg-dark-700 border border-dark-500 rounded-xl overflow-hidden shadow-2xl animate-fade-in"
        >
          {loading && results.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-sm">Searching MAL...</div>
          )}

          {results.map((anime) => (
            <button
              key={anime.id}
              onClick={() => handleAdd(anime)}
              className="w-full px-4 py-2.5 text-left hover:bg-dark-600 transition-colors flex items-center gap-3 group"
            >
              {anime.coverUrl && (
                <img
                  src={anime.coverUrl}
                  alt=""
                  className="w-8 h-11 object-cover rounded shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-white group-hover:text-accent-pink transition-colors block truncate">
                  {anime.title}
                </span>
                <div className="flex gap-1 mt-0.5">
                  {anime.year && <span className="text-gray-500 text-xs">({anime.year})</span>}
                  {anime.genres.slice(0, 2).map((g) => (
                    <span key={g} className="text-xs px-1.5 py-0.5 rounded bg-dark-500 text-gray-400">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}

          {showCustomOption && (
            <button
              onClick={handleAddCustom}
              className="w-full px-4 py-3 text-left hover:bg-dark-600 transition-colors border-t border-dark-500"
            >
              <span className="text-accent-cyan">+ Add custom: </span>
              <span className="text-white font-medium">"{query.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
