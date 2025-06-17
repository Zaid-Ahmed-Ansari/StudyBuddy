import type { Metadata } from 'next';
import NotesSummarizer from '@/components/NotesSummarizer';

export const metadata: Metadata = {
  title: 'AI Notes Summarizer | Smart Study Summaries | StudyBuddy',
  description: 'Convert lengthy study materials into concise summaries with our AI notes summarizer. Get key points, main ideas, and essential concepts automatically.',
  keywords: 'AI notes summarizer, study summaries, text summarization, key points extraction, study materials, smart summaries',
  openGraph: {
    title: 'AI Notes Summarizer | Smart Study Summaries | StudyBuddy',
    description: 'Convert lengthy study materials into concise summaries with our AI notes summarizer. Get key points, main ideas, and essential concepts automatically.',
    url: 'https://studybuddy.rest/notes-summarizer',
  },
  alternates: {
    canonical: 'https://studybuddy.rest/notes-summarizer',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StudyBuddy AI Notes Summarizer',
  description: 'AI-powered tool that converts lengthy study materials into concise summaries',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  featureList: [
    'Text summarization',
    'Key points extraction',
    'PDF processing',
    'Word document support',
    'Image text extraction',
    'Markdown output'
  ],
  url: 'https://studybuddy.rest/notes-summarizer',
  author: {
    '@type': 'Person',
    name: 'Zaid Ahmed Ansari'
  }
};

export default function NotesSummarizerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotesSummarizer />
    </>
  );
}