'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import axios from 'axios'
import { Mail, UserCircle, Loader2 } from 'lucide-react'
import { UserAvatar } from '@/components/UserAvatar'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [username, setUsername] = useState(session?.user?.username || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/user/update-profile', {
        name: username,
        email,
      })
      setMessage('✅ Profile updated successfully!')
    } catch (error) {
      setMessage('❌ Something went wrong while updating profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen  flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-800 p-8 md:p-12 flex flex-col md:flex-row gap-10">
        {/* Profile Info Card */}
        <div className="md:w-1/2 flex flex-col items-center text-center gap-4">
          <UserAvatar username={username} size={100}/>
          <h2 className="text-2xl font-bold text-white">{username}</h2>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {session?.user?.email || 'No email provided'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Logged in as <strong>{email}</strong>
          </p>
        </div>

        {/* Update Form */}
        <div className="md:w-1/2 space-y-6">
          <h3 className="text-xl font-semibold text-white mb-2">Update your profile</h3>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md bg-gray-800 text-white border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={session?.user?.provider === 'google'}
                className="w-full rounded-md bg-gray-800 text-white border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/50 text-white py-2 rounded-md transition flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Profile'}
            </button>
          </form>

          {message && (
            <div className="text-sm text-center text-muted-foreground mt-2">{message}</div>
          )}
        </div>
      </div>
    </div>
  )
}
