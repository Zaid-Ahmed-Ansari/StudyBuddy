// components/UserAvatar.tsx
import Image from 'next/image'

export function UserAvatar({ username, size = 32,className }: { username: string; size?: number, className?: string }) {
  return (
    <Image
      src={`/api/show-avatar?username=${username}`}
      alt={`${username}'s avatar`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      unoptimized
    />
  )
}
