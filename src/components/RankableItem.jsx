const rankColors = ['text-accent-pink', 'text-accent-purple', 'text-accent-cyan']

export default function RankableItem({ anime, index, provided, isDragging }) {
  const rankColor = index < 3 ? rankColors[index] : 'text-gray-500'

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`flex items-center gap-3 bg-dark-700 border rounded-xl px-4 py-3 transition-all duration-150 select-none ${
        isDragging
          ? 'border-accent-pink/50 drag-item-dragging scale-[1.02] z-50'
          : 'border-dark-500 hover:border-dark-400'
      }`}
    >
      <span className={`font-bold text-lg w-8 text-center shrink-0 ${rankColor}`}>
        {index + 1}
      </span>

      <svg className="w-4 h-4 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="15" cy="19" r="1.5" />
      </svg>

      <div className="flex-1 min-w-0">
        <span className="text-white font-medium truncate block">{anime.title}</span>
      </div>

      <div className="flex gap-1 shrink-0">
        {anime.genres?.slice(0, 2).map((g) => (
          <span
            key={g}
            className="text-xs px-1.5 py-0.5 rounded bg-dark-600 text-gray-400 hidden sm:inline-block"
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  )
}
