// Parses a MAL anime list export (.xml or .xml.gz)
// Export from: myanimelist.net → Profile → Export Anime & Manga List
export async function parseMalExport(file) {
  let xmlText

  if (file.name.endsWith('.gz')) {
    try {
      const ds = new DecompressionStream('gzip')
      const blob = await new Response(file.stream().pipeThrough(ds)).blob()
      xmlText = await blob.text()
    } catch {
      throw new Error('Could not decompress .gz file. Try extracting the XML first, then upload the .xml file.')
    }
  } else {
    xmlText = await file.text()
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) throw new Error('Invalid XML file. Make sure you uploaded your MAL export file.')

  const entries = doc.querySelectorAll('anime')
  if (entries.length === 0) throw new Error('No anime found in file. Make sure this is a MAL anime list export.')

  return Array.from(entries).map((entry) => {
    const get = (tag) => entry.querySelector(tag)?.textContent?.trim() || ''
    const malId = get('series_animedb_id')
    return {
      id: `mal-${malId}`,
      malId: parseInt(malId) || null,
      title: get('series_title'),
      year: null,
      genres: [],
      coverUrl: null,
      myScore: parseInt(get('my_score')) || 0,
      myStatus: get('my_status'), // Completed, Watching, On-Hold, Dropped, Plan to Watch
    }
  }).filter((a) => a.title)
}
