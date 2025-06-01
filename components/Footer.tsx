'use client'
import Link from "next/link";
import { useSession } from "next-auth/react";
import { IUser } from "@/src/model/User";

// components/Footer.jsx
export default function Footer() {
  const {data:session} = useSession()
  const user = session?.user 
    return (
      <footer className=" text-foreground py-10 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo + Description */}
          <div>
            <h2 className="text-2xl font-bold text-accent">StudyBuddy</h2>
            <p className="mt-2 text-muted-foreground">
              Your personal AI-powered study partner.
            </p>
          </div>
  
          {/* Navigation */}
          <div className="space-y-2 flex flex-col text-sm">
            <h3 className="text-lg font-semibold mb-2">Navigation</h3>
            
              
              <Link
              href="/"
              className="hover:text-accent transition-colors duration-200"
              >
                Home
              </Link>

              

              <Link
              href={`/ai-chat/${user?.id}`}
              className="hover:text-accent transition-colors duration-200"
              >
                AI Chatbot
              </Link>
              <Link
              href="/notes-generator"
              className="hover:text-accent transition-colors duration-200"
              >
                Notes Generator
              </Link>

              <Link
              href="/notes-summarizer"
              className="hover:text-accent transition-colors duration-200"
              >
                Notes Summarizer
              </Link>
              <Link
              href="/schedule generator"
              className="hover:text-accent transition-colors duration-200"
              >
                Schedule Generator
              </Link>
              <Link
              href="/contact"
              className="hover:text-accent transition-colors duration-200"
              >
                Contact Us
              </Link>
            
          </div>
  
          {/* Socials */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Connect</h3>
            <div className="flex space-x-4 mt-2">
              ahmedzaid2627@gmail.com
              {/* <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-sky-500 transition">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-blue-600 transition">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-gray-900 dark:hover:text-white transition">
                <i className="fab fa-github text-xl"></i>
              </a> */}
            </div>
          </div>
        </div>
  
        <div className="mt-10 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudyBuddy. All rights reserved.
        </div>
      </footer>
    );
  }
  