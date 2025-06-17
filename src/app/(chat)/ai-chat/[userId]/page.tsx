import type { Metadata } from 'next';
import AIChatLanding from '@/src/components/AIChatLanding';

export const metadata: Metadata = {
  title: 'AI Study Assistant | Smart Chat for Students | StudyBuddy',
  description: 'Get instant help with your studies using our AI chat assistant. Ask questions, get explanations, and receive personalized study guidance 24/7.',
  keywords: 'AI study assistant, study help, homework help, academic chat, student assistant, AI tutor',
  openGraph: {
    title: 'AI Study Assistant | Smart Chat for Students | StudyBuddy',
    description: 'Get instant help with your studies using our AI chat assistant. Ask questions, get explanations, and receive personalized study guidance 24/7.',
    url: 'https://studybuddy.rest/ai-chat',
  },
  alternates: {
    canonical: 'https://studybuddy.rest/ai-chat',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StudyBuddy AI Chat Assistant',
  description: 'AI-powered study assistant that provides instant help with homework, explanations, and study guidance',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  featureList: [
    '24/7 study assistance',
    'Homework help',
    'Concept explanations',
    'Study guidance',
    'Subject-specific support',
    'Instant responses'
  ],
  url: 'https://studybuddy.rest/ai-chat',
  author: {
    '@type': 'Person',
    name: 'Zaid Ahmed Ansari'
  }
};

export default function AILandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AIChatLanding />
    </>
  );
}
