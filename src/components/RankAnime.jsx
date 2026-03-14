import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import RankableItem from './RankableItem'

export default function RankAnime({ animeList, onReorder, onSwitchTab }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return
    const items = Array.from(animeList)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)
    onReorder(items)
  }

  if (animeList.length === 0) {
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
        <h2 className="text-xl font-bold text-white mb-1">Rank Your Anime</h2>
        <p className="text-gray-400 text-sm">
          Drag and drop to order from favorite (#1) to least favorite. This ranking shapes your recommendations.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="anime-rank-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {animeList.map((anime, index) => (
                <Draggable
                  key={String(anime.id)}
                  draggableId={String(anime.id)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <RankableItem
                      anime={anime}
                      index={index}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
