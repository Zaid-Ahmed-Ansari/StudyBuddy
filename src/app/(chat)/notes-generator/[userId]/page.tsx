import GenAiChat from '@/components/genai-chat'
import NotesLandingPage from '@/components/NotesLandingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Notes Generator | Create Smart Study Notes | StudyBuddy',
  description: 'Transform your study materials into well-organized notes with our AI notes generator. Create comprehensive, structured notes automatically from your content.',
  keywords: 'AI notes generator, study notes, automatic note taking, smart notes, study materials, note organization',
  openGraph: {
    title: 'AI Notes Generator | Create Smart Study Notes | StudyBuddy',
    description: 'Transform your study materials into well-organized notes with our AI notes generator. Create comprehensive, structured notes automatically from your content.',
    url: 'https://studybuddy.rest/notes-generator',
  },
  alternates: {
    canonical: 'https://studybuddy.rest/notes-generator',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StudyBuddy AI Notes Generator',
  description: 'AI-powered tool that automatically generates well-organized study notes from your content',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  featureList: [
    'Automatic note generation',
    'Smart content organization',
    'Key points extraction',
    'Multiple format support',
    'Customizable templates',
    'Export options'
  ],
  url: 'https://studybuddy.rest/notes-generator',
  author: {
    '@type': 'Person',
    name: 'Zaid Ahmed Ansari'
  }
};

const page = () => {
  return (
    <div className='md:pt-0 pt-12'>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotesLandingPage />
    </div>
  )
}

export default page
