const ANILIST_URL = 'https://graphql.anilist.co'

const BROWSE_QUERY = `
query ($season: MediaSeason, $seasonYear: Int, $nextSeason: MediaSeason, $nextSeasonYear: Int) {
  trending: Page(page: 1, perPage: 20) {
    media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
      ...mediaFields
    }
  }
  popular: Page(page: 1, perPage: 20) {
    media(sort: POPULARITY_DESC, type: ANIME, season: $season, seasonYear: $seasonYear, isAdult: false) {
      ...mediaFields
    }
  }
  upcoming: Page(page: 1, perPage: 20) {
    media(sort: POPULARITY_DESC, type: ANIME, season: $nextSeason, seasonYear: $nextSeasonYear, isAdult: false) {
      ...mediaFields
    }
  }
  top: Page(page: 1, perPage: 20) {
    media(sort: SCORE_DESC, type: ANIME, isAdult: false) {
      ...mediaFields
    }
  }
}

fragment mediaFields on Media {
  id
  title {
    english
    romaji
  }
  coverImage {
    large
  }
  bannerImage
  format
  episodes
  status
  season
  seasonYear
  averageScore
  popularity
  genres
  studios(isMain: true) {
    nodes {
      name
    }
  }
  nextAiringEpisode {
    episode
    timeUntilAiring
  }
}
`

function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  if (month <= 3) return 'WINTER'
  if (month <= 6) return 'SPRING'
  if (month <= 9) return 'SUMMER'
  return 'FALL'
}

function getNextSeason(season) {
  const order = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  const idx = order.indexOf(season)
  return order[(idx + 1) % 4]
}

function formatMedia(item) {
  return {
    id: `al-${item.id}`,
    anilistId: item.id,
    title: item.title.english || item.title.romaji,
    romajiTitle: item.title.romaji,
    coverUrl: item.coverImage?.large || null,
    bannerUrl: item.bannerImage || null,
    format: item.format,
    episodes: item.episodes,
    status: item.status,
    season: item.season,
    seasonYear: item.seasonYear,
    year: item.seasonYear,
    score: item.averageScore,
    popularity: item.popularity,
    genres: item.genres || [],
    studio: item.studios?.nodes?.[0]?.name || null,
    nextEpisode: item.nextAiringEpisode || null,
  }
}

export async function fetchBrowseData() {
  const year = new Date().getFullYear()
  const season = getCurrentSeason()
  const nextSeason = getNextSeason(season)
  const nextSeasonYear = nextSeason === 'WINTER' ? year + 1 : year

  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: BROWSE_QUERY,
      variables: {
        season,
        seasonYear: year,
        nextSeason: nextSeason,
        nextSeasonYear: nextSeasonYear,
      },
    }),
  })

  if (res.status === 429) {
    throw new Error('Rate limited — try again in a few seconds')
  }
  if (!res.ok) {
    throw new Error('Failed to fetch browse data')
  }

  const data = await res.json()
  const d = data?.data

  return {
    trending: (d?.trending?.media || []).map(formatMedia),
    popular: (d?.popular?.media || []).map(formatMedia),
    upcoming: (d?.upcoming?.media || []).map(formatMedia),
    top: (d?.top?.media || []).map(formatMedia),
    season: season.charAt(0) + season.slice(1).toLowerCase(),
    year,
    nextSeason: nextSeason.charAt(0) + nextSeason.slice(1).toLowerCase(),
    nextSeasonYear,
  }
}
