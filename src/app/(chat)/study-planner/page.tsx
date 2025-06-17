

import StudyPlanner from '@/components/StudyPlanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Study Planner | Smart Study Schedule Generator | StudyBuddy',
  description: 'Create personalized study schedules with our AI study planner. Get optimized study plans, time management strategies, and progress tracking.',
  keywords: 'AI study planner, study schedule, time management, study planning, academic planning, smart scheduling',
  openGraph: {
    title: 'AI Study Planner | Smart Study Schedule Generator | StudyBuddy',
    description: 'Create personalized study schedules with our AI study planner. Get optimized study plans, time management strategies, and progress tracking.',
    url: 'https://studybuddy.rest/study-planner',
  },
  alternates: {
    canonical: 'https://studybuddy.rest/study-planner',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StudyBuddy AI Study Planner',
  description: 'AI-powered tool that creates personalized study schedules and plans',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  featureList: [
    'Personalized scheduling',
    'Time management',
    'Subject organization',
    'Goal tracking',
    'Progress monitoring',
    'Smart recommendations'
  ],
  url: 'https://studybuddy.rest/study-planner',
  author: {
    '@type': 'Person',
    name: 'Zaid Ahmed Ansari'
  }
};

export default function StudyPlannerPage() {
  return (
    <main className="min-h-screen flex justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <StudyPlanner />
      </div>
    </main>
  );
}
