import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "@/src/app/globals.css";
import AuthProvider from "@/src/context/AuthProvider";
import { Toaster } from "sonner";


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
    <html lang="en" suppressHydrationWarning={true}>
      <AuthProvider>


      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
       {children} 
       <Toaster/>
      </body>
        </AuthProvider>

    </html>
    
  );
}
