import VisualGenerator from '@/components/VisualsGenerator'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Visuals Generator | Create Study Diagrams & Mind Maps | StudyBuddy',
  description: 'Transform your study materials into visual diagrams and mind maps with our AI visuals generator. Create flowcharts, mind maps, and study diagrams automatically.',
  keywords: [
    'AI visuals generator',
    'study diagrams',
    'mind maps',
    'flowcharts',
    'educational diagrams',
    'visual learning',
    'AI diagram generator',
    'study visualization',
    'concept mapping',
    'learning diagrams'
  ],
  openGraph: {
    title: 'AI Visuals Generator | Create Study Diagrams & Mind Maps | StudyBuddy',
    description: 'Transform your study materials into visual diagrams and mind maps with our AI visuals generator. Create flowcharts, mind maps, and study diagrams automatically.',
    type: 'website',
    url: 'https://studybuddy.rest/visuals-generator',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Visuals Generator - Create Study Diagrams'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visuals Generator | Create Study Diagrams & Mind Maps | StudyBuddy',
    description: 'Transform your study materials into visual diagrams and mind maps with our AI visuals generator.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://studybuddy.rest/visuals-generator',
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
  verification: {
    google: 'your-google-site-verification',
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Visuals Generator',
  description: 'An AI-powered tool that transforms study materials into visual diagrams and mind maps.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  featureList: [
    'AI-powered diagram generation',
    'Mind map creation',
    'Flowchart generation',
    'Study diagram automation',
    'Visual learning tools'
  ],
  author: {
    '@type': 'Organization',
    name: 'StudyBuddy'
  }
};

export default function VisualsGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VisualGenerator />
    </>
  )
} 