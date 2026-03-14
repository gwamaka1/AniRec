import { useState } from 'react'
import { getRecommendations } from '../lib/anthropic'
import RecommendationCard from './RecommendationCard'

export default function Recommendations({
  animeList,
  allAnime,
  recommendations,
  setRecommendations,
  onSwitchTab,
  onAddToTier,
  onWatchLater,
  watchlistTitles,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pastRecs, setPastRecs] = useState([])
  const [eraFilter, setEraFilter] = useState('any')

  const totalAnime = animeList.length
  const canGenerate = totalAnime >= 3

  const existingSet = new Set(allAnime.map((a) => a.title.toLowerCase()))
  const filteredRecs = recommendations?.recommendations?.filter((rec) => {
    const t = rec.title.toLowerCase()
    return !existingSet.has(t) && !(watchlistTitles?.has(t))
  })

  const handleDismiss = (index) => {
    if (!recommendations) return
    const dismissed = recommendations.recommendations[index]
    if (dismissed) {
      setPastRecs((prev) => [...new Set([...prev, dismissed.title])])
    }
    const updated = {
      ...recommendations,
      recommendations: recommendations.recommendations.filter((_, i) => i !== index),
    }
    setRecommendations(updated.recommendations.length > 0 ? updated : null)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setRecommendations(null)
    try {
      const wlTitles = [...(watchlistTitles || [])].map((t) => t)
      const result = await getRecommendations(animeList, allAnime, pastRecs, wlTitles, eraFilter)
      setRecommendations(result)
      const newTitles = result.recommendations?.map((r) => r.title) || []
      setPastRecs((prev) => [...new Set([...prev, ...newTitles])])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (totalAnime < 3) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-4xl mb-3 opacity-30">&#10024;</div>
        <p className="text-gray-500 mb-2">Add at least 3 anime to get recommendations</p>
        <p className="text-gray-600 text-sm mb-4">
          You have {totalAnime} anime — need {3 - totalAnime} more
        </p>
        <button
          onClick={onSwitchTab}
          className="px-4 py-2 rounded-xl bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors font-medium"
        >
          Add more anime
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">AI Recommendations</h2>
        <p className="text-gray-400 text-sm">
          Based on your {totalAnime} tiered anime, your anime guru will analyze your taste and suggest new shows
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center">
        <button
          onClick={handleGenerate}
          disabled={loading || !canGenerate}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-pink to-accent-purple text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing your taste...
            </span>
          ) : recommendations ? (
            'Regenerate Recommendations'
          ) : (
            'Generate Recommendations'
          )}
        </button>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Era:</label>
          <select
            value={eraFilter}
            onChange={(e) => setEraFilter(e.target.value)}
            className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-purple transition-colors cursor-pointer"
          >
            <option value="any">Any era</option>
            <option value="2020">2020s only</option>
            <option value="2015">2015+</option>
            <option value="2010">2010+</option>
            <option value="2000">2000+</option>
            <option value="classic">Classics (pre-2000)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm animate-slide-up">
          {error}
        </div>
      )}

      {recommendations && (
        <div className="animate-slide-up">
          {recommendations.profile && (
            <div className="bg-dark-700 border border-dark-500 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400">
                <span className="text-accent-cyan font-semibold">Your Taste Profile: </span>
                {recommendations.profile}
              </p>
            </div>
          )}

          {filteredRecs?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecs.map((rec, i) => (
                <RecommendationCard
                  key={rec.title}
                  recommendation={rec}
                  index={i}
                  onAddToTier={onAddToTier}
                  onDismiss={handleDismiss}
                  onWatchLater={onWatchLater}
                  existingTitles={existingSet}
                  watchlistTitles={watchlistTitles}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">All recommendations have been added or saved. Generate new ones!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
