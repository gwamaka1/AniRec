import { useState, useRef, useEffect } from 'react'
import AnimeSearchBar from './AnimeSearchBar'
import AnimeCard from './AnimeCard'
import TierPickerModal from './TierPickerModal'
import { parseMalExport } from '../lib/malXml'
import { fetchTrending } from '../lib/jikan'

export default function AddAnime({ allAnime, existingTitles, onAdd, onAddToTier, onRemove, onBulkAdd }) {
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [trending, setTrending] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(false)
  const [pendingAnime, setPendingAnime] = useState(null)
  const fileInputRef = useRef(null)
  const trendingFetched = useRef(false)

  useEffect(() => {
    if (trendingFetched.current) return
    trendingFetched.current = true
    setTrendingLoading(true)
    fetchTrending()
      .then(setTrending)
      .catch(() => {})
      .finally(() => setTrendingLoading(false))
  }, [])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError(null)
    setImportResult(null)
    try {
      const list = await parseMalExport(file)
      const newOnes = list.filter((a) => !existingTitles.has(a.title.toLowerCase()))
      onBulkAdd(newOnes)
      setImportResult({ total: list.length, added: newOnes.length })
    } catch (err) {
      setImportError(err.message)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const handleSelectAnime = (anime) => {
    if (existingTitles.has(anime.title.toLowerCase())) return
    setPendingAnime(anime)
  }

  const handleConfirmAdd = (anime, tier) => {
    onAddToTier(anime, tier)
    setPendingAnime(null)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Add Anime You've Watched</h2>
        <p className="text-gray-400 text-sm">
          Search 25,000+ anime from MyAnimeList, or import your MAL list.
        </p>
      </div>

      <AnimeSearchBar onSelect={handleSelectAnime} existingTitles={existingTitles} />

      <TierPickerModal
        anime={pendingAnime}
        onConfirm={handleConfirmAdd}
        onCancel={() => setPendingAnime(null)}
      />

      {/* Trending / Currently Airing */}
      {trending.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-accent-pink">Currently Airing</span>
            <span className="text-gray-600 text-xs font-normal">this season</span>
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {trending.map((anime) => {
              const added = existingTitles.has(anime.title.toLowerCase())
              return (
                <div key={anime.id} className="shrink-0 w-32 group">
                  <div className="relative w-32 h-44 rounded-lg overflow-hidden bg-dark-600 mb-1.5">
                    {anime.coverUrl ? (
                      <img src={anime.coverUrl} alt={anime.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No img</div>
                    )}
                    {added ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-accent-cyan text-xs font-medium">Added</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectAnime(anime)}
                        className="absolute inset-0 bg-black/0 hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <span className="bg-accent-pink/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg">+ Add</span>
                      </button>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium truncate">{anime.title}</p>
                  {anime.year && <p className="text-gray-500 text-[10px]">{anime.year}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
      {trendingLoading && (
        <div className="mt-6 text-center py-4">
          <span className="text-gray-500 text-sm">Loading currently airing...</span>
        </div>
      )}

      {/* MAL XML Import */}
      <div className="mt-4 bg-dark-700 border border-dark-500 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-300 mb-1">Import from MyAnimeList</p>
        <ol className="text-xs text-gray-500 mb-3 space-y-0.5 list-decimal list-inside">
          <li>Go to <span className="text-accent-cyan">myanimelist.net</span> &rarr; Profile &rarr; Export Anime &amp; Manga List</li>
          <li>Download the export file (.xml.gz), then extract it to get the .xml file</li>
          <li>Upload the .xml file below</li>
        </ol>
        <div className="flex gap-2 items-center">
          <input ref={fileInputRef} type="file" accept=".xml,.gz" onChange={handleFile} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-blue to-accent-cyan text-dark-900 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Importing...
              </span>
            ) : 'Upload MAL Export'}
          </button>
          <span className="text-gray-600 text-xs">Accepts .xml or .xml.gz</span>
        </div>
        {importError && <p className="text-red-400 text-xs mt-2">{importError}</p>}
        {importResult && (
          <p className="text-accent-cyan text-xs mt-2">
            Added {importResult.added} new anime ({importResult.total} found in file). Switch to Tier List to rank them!
          </p>
        )}
      </div>

      {allAnime.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3 opacity-30">&#127871;</div>
          <p className="text-gray-500">Search for anime above or import your MAL export file</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {allAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
