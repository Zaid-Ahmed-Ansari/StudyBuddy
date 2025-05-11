import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "@/src/app/globals.css";
import  Navbar  from "@/components/Navbar";

import AuthProvider from "@/src/context/AuthProvider";
import { SidebarDemo } from "@/components/Sidebar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyBuddy – Your AI-Powered Study Partner",
  description: "StudyBuddy is an all-in-one AI study companion that helps you learn smarter. Generate organized notes, join collaborative study rooms, highlight key concepts in PDFs, and get instant answers to your academic questions — all powered by cutting-edge AI. Whether you're prepping for exams or studying with friends, StudyBuddy has your back.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        >
          <p className="bold text-3xl visible sm:hidden">Not for mobile users for now.</p>
          <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-zinc-900 to-accent dark:from-black dark:via-zinc-800/40 dark:to-black px-4 invisible md:visible">
        

        
        {/* <main className=' w-full '>
          <SidebarDemo/>
          <div className="flex sticky top-3 z-50">  
        <Navbar />
          
          </div>
          {children}
        </main> */}
        <div className="w-full flex ">
          <div className="h-screen sticky top-3 flex z-50">
            <SidebarDemo/>
          </div>
          <div className="w-full max-w-screen">
          <Navbar/>
          {children}
          </div>
        </div>
        
       <Footer/>
        
          </div>
          
      </body>
        </AuthProvider>
    </html>
    
  );
}
