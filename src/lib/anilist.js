const ANILIST_URL = 'https://graphql.anilist.co'

const SEARCH_QUERY = `
query ($search: String) {
  Media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
    id
    coverImage {
      medium
    }
  }
}
`

const imageCache = new Map()
const requestQueue = []
let processing = false

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function processQueue() {
  if (processing) return
  processing = true

  while (requestQueue.length > 0) {
    const { title, resolve } = requestQueue.shift()

    if (imageCache.has(title)) {
      resolve(imageCache.get(title))
      continue
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(ANILIST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: title } }),
        })

        if (res.status === 429) {
          const retryAfter = parseInt(res.headers.get('Retry-After') || '2', 10)
          await delay(retryAfter * 1000)
          continue
        }

        const data = await res.json()
        const url = data?.data?.Media?.coverImage?.medium || null
        imageCache.set(title, url)
        resolve(url)
        break
      } catch {
        if (attempt === 2) {
          imageCache.set(title, null)
          resolve(null)
        } else {
          await delay(1000)
        }
      }
    }

    // Small delay between requests to avoid rate limiting
    await delay(350)
  }

  processing = false
}

export function fetchCoverImage(title) {
  if (imageCache.has(title)) return Promise.resolve(imageCache.get(title))

  return new Promise((resolve) => {
    requestQueue.push({ title, resolve })
    processQueue()
  })
}
