import { useState } from 'react'

export default function ApiKeyModal({ apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-dark-700 border border-dark-500 rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-2">Anthropic API Key</h2>
        <p className="text-gray-400 text-sm mb-4">
          Your key is stored locally in your browser and sent directly to Anthropic's API. It never touches any other server.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full bg-dark-800 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-colors"
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-dark-600 text-gray-300 hover:bg-dark-500 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(key.trim())}
            disabled={!key.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-pink to-accent-purple text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  )
}
