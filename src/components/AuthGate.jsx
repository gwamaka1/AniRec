import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthGate({ onAuth }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setError(null)
        setIsSignUp(false)
        alert('Check your email to confirm your account, then sign in!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-accent-pink via-accent-purple to-accent-cyan bg-clip-text text-transparent mb-3">
          AniRec
        </h1>
        <p className="text-gray-400 text-lg">AI-Powered Anime Recommendations</p>
      </div>

      <div className="bg-dark-700 border border-dark-500 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="text-white font-bold text-xl mb-2 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          {isSignUp
            ? 'Sign up to save your tier list and get recommendations.'
            : 'Sign in to access your tier list and recommendations.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-dark-600 border border-dark-400 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-purple transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl bg-dark-600 border border-dark-400 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-purple transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-xs mt-3 text-center">{error}</p>
        )}

        <p className="text-gray-400 text-xs text-center mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
            className="text-accent-cyan hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <p className="text-gray-600 text-xs text-center mt-3">
          Your data is saved privately to your account.
        </p>
      </div>
    </div>
  )
}
