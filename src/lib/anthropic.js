const ERA_LABELS = {
  any: '',
  2020: 'ONLY recommend anime that started airing in 2020 or later.',
  2015: 'ONLY recommend anime that started airing in 2015 or later.',
  2010: 'ONLY recommend anime that started airing in 2010 or later.',
  2000: 'ONLY recommend anime that started airing in 2000 or later.',
  classic: 'ONLY recommend classic anime that aired before the year 2000.',
}

export async function getRecommendations(rankedAnimeList, allAnime, previouslyRecommended = [], watchlistTitles = [], eraFilter = 'any') {
  const tierGroups = {}
  for (const anime of rankedAnimeList) {
    const tier = anime.tier || '?'
    if (!tierGroups[tier]) tierGroups[tier] = []
    let entry = anime.title + (anime.genres?.length ? ` (${anime.genres.join(', ')})` : '')
    if (anime.note) entry += ` — User note: "${anime.note}"`
    tierGroups[tier].push(entry)
  }

  const tierText = Object.entries(tierGroups)
    .map(([tier, titles]) => `${tier} Tier:\n${titles.map((t) => `  - ${t}`).join('\n')}`)
    .join('\n\n')

  // Full exclusion list — everything the user has added or saved to watchlist
  const allTitles = [...new Set([...allAnime.map((a) => a.title), ...watchlistTitles])]
  const exclusionText = allTitles.length > 0
    ? `\n\nDO NOT recommend any of these — the user has already seen, added, or saved them:\n${allTitles.map((t) => `- ${t}`).join('\n')}`
    : ''

  const prevRecText = previouslyRecommended.length > 0
    ? `\n\nYou already recommended these — suggest COMPLETELY DIFFERENT anime this time:\n${previouslyRecommended.map((t) => `- ${t}`).join('\n')}`
    : ''

  const eraText = ERA_LABELS[eraFilter] || ''

  let response
  try {
    response = await fetch('/api/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      temperature: 0.9,
      system: `You are an anime recommendation JSON API. You output ONLY raw JSON — no commentary, no thinking, no preamble, no explanation, no markdown. Your first character must be { and your last character must be }.

The user provides their anime tier list (S=masterpiece, A=excellent, B=good, C=average, D=below average, F=disliked). Some entries include personal notes — PAY CLOSE ATTENTION to these as they reveal specific preferences.

Analyze their taste deeply — genres, themes, storytelling styles, pacing, art style, character depth, production qualities — weighted by tier AND notes.

Recommend 8 anime. Draw inspiration EQUALLY from S-tier AND A-tier. At least 3 should be inspired by A-tier entries. Also consider B-tier for broader signals.

RULES:
1. Only recommend anime TV series or films that have actually aired. NEVER recommend manga, light novels, or non-animated media.
2. Never recommend anything from the exclusion list. Do NOT mention excluded titles in your output at all — not even to say they are excluded.
3. Each recommendation needs: title (common English name), reason (1-2 sentences referencing user preferences), matchPercent (0-100).
4. Output ONLY this JSON shape, nothing else: {"profile":"1-sentence taste profile","recommendations":[{"title":"string","reason":"string","matchPercent":number}]}`,
      messages: [
        {
          role: 'user',
          content: `Here is my anime tier list:\n\n${tierText}${exclusionText}${prevRecText}\n\nRecommend anime I'd enjoy that I haven't seen yet.${eraText ? ' ' + eraText : ''}\n\nRemember: output ONLY valid JSON starting with { and ending with }. No thinking, no preamble, no markdown.`,
        },
      ],
    }),
    })
  } catch (e) {
    throw new Error('Could not reach the server. Check your internet connection.')
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  const rawText = data.content[0].text

  // Extract the JSON object — find the first { to the last }
  const firstBrace = rawText.indexOf('{')
  const lastBrace = rawText.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Failed to parse recommendations. Please try again.')
  }
  const jsonStr = rawText.slice(firstBrace, lastBrace + 1)

  try {
    return JSON.parse(jsonStr)
  } catch {
    // Try extracting from markdown code block as fallback
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) return JSON.parse(match[1])
    throw new Error('Failed to parse recommendations. Please try again.')
  }
}
