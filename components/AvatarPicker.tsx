'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { createAvatar, Style } from '@dicebear/core'
import { personas, pixelArt,thumbs,glass } from '@dicebear/collection'

import { cn } from '@/lib/utils'

const seedList = ['tiger', 'bookworm', 'genius', 'coder', 'artist', 'thinker', 'owl']
const avatarStyles = {
  Personas: personas as Style<unknown>,
  PixelArt: pixelArt as Style<unknown>,
  Glass: glass as Style<unknown>,
  Thumbs: thumbs as Style<unknown>,
}

export default function AvatarPicker({ username }: { username: string }) {
  const [selectedSeed, setSelectedSeed] = useState(seedList[0])
  const [selectedStyle, setSelectedStyle] = useState('Personas')
  const [avatars, setAvatars] = useState<Record<string, Record<string, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const generateAvatars = () => {
      const result: Record<string, Record<string, string>> = {}
      for (const [styleName, style] of Object.entries(avatarStyles)) {
        result[styleName] = {}
        for (const seed of seedList) {
          const svg = createAvatar(style, { seed }).toString()
          result[styleName][seed] = svg
        }
      }
      setAvatars(result)
    }

    generateAvatars()
  }, [])

  const handleSubmit = async () => {
    if (!selectedSeed || !selectedStyle) return toast.error('Select an avatar.')
    setSubmitting(true)
    try {
      const res = await fetch('/api/set-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          seed: selectedSeed,
          style: selectedStyle,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save avatar')
      toast.success('Avatar saved!')
      router.replace('/sign-in')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const previewSvg =
    avatars[selectedStyle]?.[selectedSeed] ??
    createAvatar(avatarStyles.Personas, { seed: selectedSeed }).toString()

  return (
    <motion.div initial="initial" animate="animate" className="w-full">
      <Card className="w-full max-w-md mx-auto overflow-hidden">
        <CardContent className="p-6">
          {/* Avatar preview */}
          <div className="flex justify-center mb-4">
            <div
              className="w-36 h-36 rounded-full overflow-hidden border-4 border-accent bg-white"
              dangerouslySetInnerHTML={{ __html: previewSvg }}
            />
          </div>

          <h2 className="text-center font-bold text-lg mb-3">Choose your avatar</h2>
          

          {/* Style selector */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {Object.keys(avatarStyles).map((style) => (
              <Button
                key={style}
                size="sm"
                variant={selectedStyle === style ? 'default' : 'outline'}
                onClick={() => setSelectedStyle(style)}
                className='focus:bg-accent'
              >
                {style}
              </Button>
            ))}
          </div>

          {/* Avatars per style */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {Object.entries(avatars[selectedStyle] || {}).map(([seed, svg]) => (
              <button
                key={seed}
                onClick={() => setSelectedSeed(seed)}
                className={cn(
                  'w-14 h-14 rounded-full border-2 overflow-hidden bg-white',
                  selectedSeed === seed ? 'ring-2 ring-accent border-accent' : ''
                )}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ))}
          </div>

          {/* Confirm */}
          <Button
            className="w-full bg-accent text-white hover:bg-accent/90 focus:bg-accent/90"
            onClick={handleSubmit}
            disabled={submitting}
            
          >
            {submitting ? 'Saving...' : 'Confirm & Sign In'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
