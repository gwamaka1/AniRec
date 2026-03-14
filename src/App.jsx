import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { useUserData } from './hooks/useUserData'
import Header from './components/Header'
import TabNav from './components/TabNav'
import AddAnime from './components/AddAnime'
import TierList from './components/TierList'
import Recommendations from './components/Recommendations'
import Watchlist from './components/Watchlist'
import Browse from './components/Browse'
import AuthGate from './components/AuthGate'

const EMPTY_TIERS = { S: [], A: [], B: [], C: [], D: [], F: [] }
const TIER_ORDER = ['S', 'A', 'B', 'C', 'D', 'F']

export default function App() {
  const [session, setSession] = useState(undefined)
  const [activeTab, setActiveTab] = useState('browse')
  const [recommendations, setRecommendations] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  const { tiers, setTiers, watchlist, setWatchlist, loading: dataLoading, saving } = useUserData(userId)

  const allAnime = TIER_ORDER.flatMap((t) => tiers[t] || [])
  const animeCount = allAnime.length
  const existingTitles = new Set(allAnime.map((a) => a.title.toLowerCase()))

  const addAnime = (anime) => {
    if (existingTitles.has(anime.title.toLowerCase())) return
    setTiers((prev) => ({ ...prev, B: [...(prev.B || []), anime] }))
  }

  const removeAnime = useCallback((id) => {
    setTiers((prev) => {
      const next = {}
      for (const tier of TIER_ORDER) {
        next[tier] = (prev[tier] || []).filter((a) => a.id !== id)
      }
      return next
    })
  }, [setTiers])

  const bulkAddAnime = useCallback((animeArray) => {
    setTiers((prev) => {
      const currentTitles = new Set(
        TIER_ORDER.flatMap((t) => (prev[t] || []).map((a) => a.title.toLowerCase()))
      )
      const toAdd = animeArray.filter((a) => !currentTitles.has(a.title.toLowerCase()))
      return { ...prev, B: [...(prev.B || []), ...toAdd] }
    })
  }, [setTiers])

  const addToTier = useCallback((anime, tier) => {
    setTiers((prev) => {
      const currentTitles = new Set(
        TIER_ORDER.flatMap((t) => (prev[t] || []).map((a) => a.title.toLowerCase()))
      )
      if (currentTitles.has(anime.title.toLowerCase())) return prev
      return { ...prev, [tier]: [...(prev[tier] || []), anime] }
    })
  }, [setTiers])

  const updateTiers = useCallback((newTiers) => setTiers(newTiers), [setTiers])

  const addToWatchlist = useCallback((anime) => {
    setWatchlist((prev) => {
      if (prev.some((a) => a.title.toLowerCase() === anime.title.toLowerCase())) return prev
      return [...prev, { ...anime, id: anime.id || `wl-${Date.now()}`, addedAt: Date.now() }]
    })
  }, [setWatchlist])

  const removeFromWatchlist = useCallback((id) => {
    setWatchlist((prev) => prev.filter((a) => a.id !== id))
  }, [setWatchlist])

  const updateAnimeNote = useCallback((id, note) => {
    setTiers((prev) => {
      const next = {}
      for (const tier of TIER_ORDER) {
        next[tier] = (prev[tier] || []).map((a) => a.id === id ? { ...a, note } : a)
      }
      return next
    })
  }, [setTiers])

  const rankedList = TIER_ORDER.flatMap((t) =>
    (tiers[t] || []).map((a) => ({ ...a, tier: t }))
  )

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-accent-purple" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!session) return <AuthGate />

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-accent-purple mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading your list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <Header user={session.user} saving={saving} onSignOut={() => supabase.auth.signOut()} />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} animeCount={animeCount} watchlistCount={watchlist.length} />

      <main className="max-w-6xl mx-auto px-4 pb-12">
        {activeTab === 'browse' && <Browse existingTitles={existingTitles} onAddToTier={addToTier} />}
        {activeTab === 'add' && (
          <AddAnime
            allAnime={allAnime}
            existingTitles={existingTitles}
            onAdd={addAnime}
            onAddToTier={addToTier}
            onRemove={removeAnime}
            onBulkAdd={bulkAddAnime}
          />
        )}
        {activeTab === 'rank' && (
          <TierList
            tiers={tiers}
            onUpdateTiers={updateTiers}
            onRemove={removeAnime}
            onUpdateNote={updateAnimeNote}
            onSwitchTab={() => setActiveTab('add')}
          />
        )}
        {activeTab === 'recommend' && (
          <Recommendations
            animeList={rankedList}
            allAnime={allAnime}
            recommendations={recommendations}
            setRecommendations={setRecommendations}
            onSwitchTab={() => setActiveTab('add')}
            onAddToTier={addToTier}
            onWatchLater={addToWatchlist}
            watchlistTitles={new Set(watchlist.map((a) => a.title.toLowerCase()))}
          />
        )}
        {activeTab === 'watchlist' && (
          <Watchlist
            watchlist={watchlist}
            onRemove={removeFromWatchlist}
            onAddToTier={addToTier}
            onSwitchTab={() => setActiveTab('recommend')}
          />
        )}
      </main>
    </div>
  )
}
