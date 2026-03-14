const BASE = 'https://api.jikan.moe/v4'

function jikanToAnime(item) {
  return {
    id: `mal-${item.mal_id}`,
    malId: item.mal_id,
    title: item.title_english || item.title,
    year: item.year || item.aired?.prop?.from?.year || null,
    genres: item.genres?.map((g) => g.name) || [],
    coverUrl: item.images?.jpg?.image_url || null,
  }
}

export async function searchAnime(query) {
  const url = `${BASE}/anime?q=${encodeURIComponent(query)}&limit=10&sfw=true&order_by=popularity&type=tv`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return (data.data || []).map(jikanToAnime)
}

export async function fetchTrending() {
  const url = `${BASE}/seasons/now?limit=12&sfw=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch trending')
  const data = await res.json()
  return (data.data || []).map(jikanToAnime)
}

// status: 1=watching 2=completed 3=on_hold 4=dropped 6=plan_to_watch, omit for all
export async function importMalList(username, status = null) {
  const allAnime = []
  let page = 1
  let hasMore = true

  while (hasMore && page <= 10) {
    const statusParam = status ? `&status=${status}` : ''
    const url = `${BASE}/users/${encodeURIComponent(username)}/animelist?page=${page}${statusParam}`
    const res = await fetch(url)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = body?.message || body?.error || JSON.stringify(body)
      if (res.status === 404) throw new Error(`Could not find anime list for "${username}". Make sure your list is set to Public on MAL (Profile → Edit Profile → Privacy).`)
      if (res.status === 400) throw new Error(`List is private. On MAL go to Profile → Edit Profile → set Anime List to Public. Details: ${msg}`)
      throw new Error(`MAL error ${res.status}: ${msg}`)
    }

    const data = await res.json()
    const items = data.data || []

    for (const entry of items) {
      const a = entry.anime
      allAnime.push({
        id: `mal-${a.mal_id}`,
        malId: a.mal_id,
        title: a.title,
        year: null,
        genres: [],
        coverUrl: a.images?.jpg?.image_url || null,
      })
    }

    hasMore = data.pagination?.has_next_page && items.length > 0
    page++

    // Jikan rate limit: 3 req/s — small delay between pages
    if (hasMore) await new Promise((r) => setTimeout(r, 400))
  }

  return allAnime
}
