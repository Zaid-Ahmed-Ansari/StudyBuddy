import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Analytics from '@/components/Analytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudyBuddy - Your AI-Powered Study Companion',
  description: 'StudyBuddy helps you create personalized study plans, join study groups, and collaborate with peers in real-time. Features include AI-powered study planning, video calls, and interactive study sessions.',
  keywords: 'study planner, study groups, online learning, AI study assistant, virtual study room, student collaboration',
  authors: [{ name: 'Zaid Ahmed Ansari' }],
  creator: 'Zaid Ahmed Ansari',
  publisher: 'StudyBuddy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://studybuddy.rest'),
  openGraph: {
    title: 'StudyBuddy - Your AI-Powered Study Companion',
    description: 'Create personalized study plans, join study groups, and collaborate with peers in real-time.',
    url: 'https://studybuddy.rest',
    siteName: 'StudyBuddy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StudyBuddy Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyBuddy - Your AI-Powered Study Companion',
    description: 'Create personalized study plans, join study groups, and collaborate with peers in real-time.',
    images: ['/og-image.png'],
    creator: '@zaidahmedansari',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon.png',
    },
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
} 