const tabs = [
  { id: 'browse', label: 'Browse', icon: '◈' },
  { id: 'add', label: 'Add Anime', icon: '+' },
  { id: 'rank', label: 'Tier List', icon: '#' },
  { id: 'recommend', label: 'Get Recs', icon: '*' },
  { id: 'watchlist', label: 'Watch Later', icon: '~' },
]

export default function TabNav({ activeTab, onTabChange, animeCount, watchlistCount }) {
  return (
    <nav className="max-w-6xl mx-auto px-4 pt-6 pb-4">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-accent-pink/20 to-accent-purple/20 text-white border border-accent-purple/40'
                : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-600/50 border border-transparent'
            }`}
          >
            <span className="mr-1.5 opacity-60">{tab.icon}</span>
            {tab.label}
            {tab.id === 'add' && animeCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-accent-pink/20 text-accent-pink">
                {animeCount}
              </span>
            )}
            {tab.id === 'watchlist' && watchlistCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-accent-blue/20 text-accent-blue">
                {watchlistCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
