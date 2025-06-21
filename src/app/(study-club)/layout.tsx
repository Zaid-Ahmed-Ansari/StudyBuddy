import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "@/src/app/globals.css";
import Navbar from "@/components/Navbar";
import '@stream-io/video-react-sdk/dist/css/styles.css';
import AuthProvider from "@/src/context/AuthProvider";
import { SidebarDemo } from "@/components/Sidebar";
import { Toaster } from "sonner";
import StreamVideoProvider from "@/src/context/StreamVideoProvider";
import { FloatingCallProvider } from "@/src/context/FloatingCallProvider";
import 'katex/dist/katex.min.css';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Study Club - Interactive Learning Tools',
    template: '%s | Study Club'
  },
  description: 'Access Study Club\'s interactive learning tools including AI chat, study planning, visual generation, and note-taking features.',
  keywords: 'study tools, AI learning, interactive study, study planning, visual learning, note taking',
  openGraph: {
    title: 'Study Club - Interactive Learning Tools',
    description: 'Access Study Club\'s interactive learning tools including AI chat, study planning, visual generation, and note-taking features.',
    url: 'https://studybuddy.rest/study-club',
    siteName: 'Study Club',
    locale: 'en_US',
    type: 'website',
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
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StudyBuddy Interactive Learning Tools',
  description: 'A comprehensive suite of AI-powered study tools for students',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  
  url: 'https://studybuddy.rest',
  author: {
    '@type': 'Person',
    name: 'Zaid Ahmed Ansari'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        >
          <AuthProvider>
            <StreamVideoProvider>
       
        
          <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-zinc-900 to-accent dark:from-black dark:via-zinc-800/40 dark:to-black px-4">
            
            <div className="w-full flex ">
              <div className="h-screen sticky top-3 flex z-50">
                <SidebarDemo />
              </div>
              <div className="w-full">
               
                {children}
                <Toaster />
              </div>
            </div>
          </div>
        
      </StreamVideoProvider>
      </AuthProvider>
        </body>
        
    </html>
  );
}
