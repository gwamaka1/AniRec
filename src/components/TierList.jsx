import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import AnimeCard from './AnimeCard'

const TIER_CONFIG = {
  S: { label: 'S', color: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', labelBg: 'bg-yellow-500' },
  A: { label: 'A', color: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', labelBg: 'bg-red-500' },
  B: { label: 'B', color: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', labelBg: 'bg-orange-500' },
  C: { label: 'C', color: 'bg-yellow-600/20', border: 'border-yellow-600/50', text: 'text-yellow-500', labelBg: 'bg-yellow-600' },
  D: { label: 'D', color: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', labelBg: 'bg-gray-500' },
  F: { label: 'F', color: 'bg-gray-700/20', border: 'border-gray-600/50', text: 'text-gray-500', labelBg: 'bg-gray-700' },
}

const TIER_ORDER = ['S', 'A', 'B', 'C', 'D', 'F']

export default function TierList({ tiers, onUpdateTiers, onRemove, onUpdateNote, onSwitchTab }) {
  const totalAnime = TIER_ORDER.reduce((sum, t) => sum + (tiers[t]?.length || 0), 0)

  const handleDragEnd = (result) => {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceTier = source.droppableId
    const destTier = destination.droppableId

    const newTiers = {}
    for (const t of TIER_ORDER) {
      newTiers[t] = [...(tiers[t] || [])]
    }

    const [moved] = newTiers[sourceTier].splice(source.index, 1)
    newTiers[destTier].splice(destination.index, 0, moved)

    onUpdateTiers(newTiers)
  }

  if (totalAnime === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-4xl mb-3 opacity-30">&#9776;</div>
        <p className="text-gray-500 mb-4">No anime to rank yet</p>
        <button
          onClick={onSwitchTab}
          className="px-4 py-2 rounded-xl bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors font-medium"
        >
          Add some anime first
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Tier List</h2>
        <p className="text-gray-400 text-sm">
          Drag anime between tiers to rank them. Click the pencil icon to add notes about what you liked or disliked — this helps AI recommendations.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-2">
          {TIER_ORDER.map((tierKey) => {
            const config = TIER_CONFIG[tierKey]
            const items = tiers[tierKey] || []

            return (
              <div
                key={tierKey}
                className={`flex border ${config.border} rounded-xl overflow-hidden min-h-[80px] ${config.color}`}
              >
                <div className={`${config.labelBg} w-16 shrink-0 flex items-center justify-center`}>
                  <span className="text-white font-bold text-2xl">{config.label}</span>
                </div>

                <Droppable droppableId={tierKey} direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex flex-wrap items-start gap-2 p-2 min-h-[80px] transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-white/5' : ''
                      }`}
                    >
                      {items.map((anime, index) => (
                        <Draggable
                          key={String(anime.id)}
                          draggableId={String(anime.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-transform duration-150 ${
                                snapshot.isDragging ? 'scale-105 z-50 drag-item-dragging rounded-lg' : ''
                              }`}
                              style={provided.draggableProps.style}
                            >
                              <AnimeCard
                                anime={anime}
                                onRemove={onRemove}
                                onUpdateNote={onUpdateNote}
                                compact
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {items.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center w-full h-full min-h-[60px]">
                          <span className="text-gray-600 text-xs italic">Drop anime here</span>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
