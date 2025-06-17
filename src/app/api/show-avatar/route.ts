import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/src/lib/dbConnect'
import { UserModel } from '@/src/model/User'

import { createAvatar } from '@dicebear/core'
import { personas, pixelArt,glass,thumbs } from '@dicebear/collection'


// Add supported styles here
const avatarStyles: Record<string, any> = {
  personas,
  pixelart: pixelArt,
  glass,
  thumbs,
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')

  if (!username) {
    return new NextResponse('Missing username', { status: 400 })
  }

  await dbConnect()
  const user = await UserModel.findOne({ username }).lean()

  if (!user || !user.avatar?.seed || !user.avatar?.style) {
    return new NextResponse('Avatar not found', { status: 404 })
  }

  const seed = user.avatar.seed
  const styleKey = user.avatar.style.toLowerCase()

  const style = avatarStyles[styleKey]
  if (!style) {
    return new NextResponse('Unsupported avatar style', { status: 400 })
  }

  const svg = createAvatar(style, { seed }).toString()

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
