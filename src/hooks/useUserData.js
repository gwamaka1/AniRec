import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const EMPTY_TIERS = { S: [], A: [], B: [], C: [], D: [], F: [] }

export function useUserData(userId) {
  const [tiers, setTiersState] = useState(EMPTY_TIERS)
  const [watchlist, setWatchlistState] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef(null)
  const initialized = useRef(false)

  // Load data on mount
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('user_data')
      .select('tiers, watchlist')
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setTiersState(data.tiers || EMPTY_TIERS)
          setWatchlistState(data.watchlist || [])
        }
        initialized.current = true
        setLoading(false)
      })
  }, [userId])

  const saveToDb = useCallback((newTiers, newWatchlist) => {
    if (!userId || !initialized.current) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await supabase.from('user_data').upsert({
        user_id: userId,
        tiers: newTiers,
        watchlist: newWatchlist,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      setSaving(false)
    }, 1200)
  }, [userId])

  const setTiers = useCallback((updater) => {
    setTiersState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setWatchlistState((wl) => { saveToDb(next, wl); return wl })
      return next
    })
  }, [saveToDb])

  const setWatchlist = useCallback((updater) => {
    setWatchlistState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setTiersState((t) => { saveToDb(t, next); return t })
      return next
    })
  }, [saveToDb])

  return { tiers, setTiers, watchlist, setWatchlist, loading, saving }
}
