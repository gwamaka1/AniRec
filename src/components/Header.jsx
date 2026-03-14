export default function Header({ user, saving, onSignOut }) {
  return (
    <header className="border-b border-dark-600/50 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-accent-pink via-accent-purple to-accent-cyan bg-clip-text text-transparent">
            AniRec
          </span>
          <span className="text-dark-500 text-sm hidden sm:inline">AI-Powered Anime Recommendations</span>
        </div>

        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          )}
          {user && (
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full ring-1 ring-dark-500"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent-purple/30 flex items-center justify-center text-xs text-accent-purple font-bold">
                  {(user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={onSignOut}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
