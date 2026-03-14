import { useState, useEffect, useRef } from 'react'
import { fetchBrowseData } from '../lib/anilistBrowse'
import TierPickerModal from './TierPickerModal'

const FORMAT_LABELS = {
  TV: 'TV',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
}

const STATUS_LABELS = {
  RELEASING: 'Airing',
  NOT_YET_RELEASED: 'Upcoming',
  FINISHED: 'Finished',
}

function formatTimeUntil(seconds) {
  if (!seconds) return null
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

function AnimeGridCard({ anime, existingTitles, onAdd }) {
  const [hovered, setHovered] = useState(false)
  const isAdded = existingTitles?.has(anime.title?.toLowerCase())

  return (
    <div
      className="group relative animate-fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-dark-600">
        {anime.coverUrl ? (
          <img
            src={anime.coverUrl}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No img</div>
        )}

        {/* Score badge */}
        {anime.score && (
          <div className="absolute top-1.5 left-1.5 bg-dark-900/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[11px] font-bold text-white flex items-center gap-0.5">
            <span className="text-yellow-400">★</span> {anime.score}%
          </div>
        )}

        {/* Airing badge */}
        {anime.nextEpisode && (
          <div className="absolute top-1.5 right-1.5 bg-accent-cyan/90 rounded px-1.5 py-0.5 text-[10px] font-bold text-dark-900">
            Ep {anime.nextEpisode.episode} in {formatTimeUntil(anime.nextEpisode.timeUntilAiring)}
          </div>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex flex-wrap gap-1 mb-2">
              {anime.genres?.slice(0, 3).map((g) => (
                <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300">{g}</span>
              ))}
            </div>
            {anime.studio && (
              <p className="text-[10px] text-accent-purple font-medium mb-1.5">{anime.studio}</p>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              {anime.format && <span>{FORMAT_LABELS[anime.format] || anime.format}</span>}
              {anime.episodes && <span>· {anime.episodes} eps</span>}
            </div>
            {isAdded ? (
              <div className="mt-2 text-center py-1 rounded-lg bg-accent-cyan/20 text-accent-cyan text-xs font-medium">
                Added
              </div>
            ) : (
              <button
                onClick={() => onAdd(anime)}
                className="mt-2 w-full py-1.5 rounded-lg bg-accent-pink/90 hover:bg-accent-pink text-white text-xs font-bold transition-colors"
              >
                + Add to List
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-1.5 px-0.5">
        <p className="text-white text-xs font-medium truncate leading-tight">{anime.title}</p>
        <p className="text-gray-500 text-[10px] truncate">
          {anime.seasonYear && `${anime.seasonYear}`}
          {anime.season && anime.seasonYear && ` · ${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()}`}
          {anime.status === 'NOT_YET_RELEASED' && ' · Upcoming'}
        </p>
      </div>
    </div>
  )
}

function SectionRow({ title, subtitle, anime, existingTitles, onAdd }) {
  const scrollRef = useRef(null)

  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-base font-bold text-white">{title}</h3>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
      <div
        ref={scrollRef}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3"
      >
        {anime.map((a) => (
          <AnimeGridCard
            key={a.id}
            anime={a}
            existingTitles={existingTitles}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  )
}

export default function Browse({ existingTitles, onAddToTier }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('trending')
  const [pendingAnime, setPendingAnime] = useState(null)
  const fetched = useRef(false)

  const handleSelectAnime = (anime) => {
    if (existingTitles?.has(anime.title?.toLowerCase())) return
    setPendingAnime(anime)
  }

  const handleConfirmAdd = (anime, tier) => {
    onAddToTier(anime, tier)
    setPendingAnime(null)
  }

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    setLoading(true)
    fetchBrowseData()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-16">
        <svg className="animate-spin w-8 h-8 text-accent-purple mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-500 text-sm">Loading from AniList...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-in text-center py-16">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button
          onClick={() => { fetched.current = false; setError(null); setLoading(true); fetchBrowseData().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
          className="px-4 py-2 rounded-lg bg-dark-600 text-gray-300 hover:text-white text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const sections = [
    { id: 'trending', label: 'Trending', data: data.trending, subtitle: 'right now' },
    { id: 'popular', label: 'Popular', data: data.popular, subtitle: `${data.season} ${data.year}` },
    { id: 'upcoming', label: 'Upcoming', data: data.upcoming, subtitle: `${data.nextSeason} ${data.nextSeasonYear}` },
    { id: 'top', label: 'Top Rated', data: data.top, subtitle: 'all time' },
  ]

  const current = sections.find((s) => s.id === activeSection)

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Browse Anime</h2>
        <p className="text-gray-400 text-sm">Discover anime from AniList — trending, seasonal, and top rated</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-thin">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === section.id
                ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-600/50 border border-transparent'
            }`}
          >
            {section.label}
            <span className="ml-1.5 text-xs opacity-60">{section.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Current section grid */}
      {current && (
        <SectionRow
          title={current.label}
          subtitle={current.subtitle}
          anime={current.data}
          existingTitles={existingTitles}
          onAdd={handleSelectAnime}
        />
      )}

      <TierPickerModal
        anime={pendingAnime}
        onConfirm={handleConfirmAdd}
        onCancel={() => setPendingAnime(null)}
      />
    </div>
  )
}
