import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FeedbackModal({ user, onClose }) {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('suggestion')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    await supabase.from('feedback').insert({
      user_id: user?.id || null,
      email: user?.email || null,
      type,
      message: message.trim(),
    })
    setSending(false)
    setSent(true)
    setTimeout(onClose, 1500)
  }

  const types = [
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="bg-dark-700 border border-dark-500 rounded-2xl p-5 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">&#10024;</div>
            <h3 className="text-white font-bold text-lg mb-1">Thanks for your feedback!</h3>
            <p className="text-gray-400 text-sm">Your input helps make AniRec better.</p>
          </div>
        ) : (
          <>
            <h3 className="text-white font-bold text-lg mb-1">Send Feedback</h3>
            <p className="text-gray-400 text-xs mb-4">Help us improve AniRec — all feedback is welcome!</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                {types.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      type === t.value
                        ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                        : 'border-dark-400 text-gray-500 hover:text-gray-300 hover:border-dark-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind? Bugs, ideas, features you'd love to see..."
                className="w-full bg-dark-800 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan resize-none"
                rows={4}
                maxLength={1000}
                autoFocus
              />

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">{message.length}/1000</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="text-xs px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-cyan text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send Feedback'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
