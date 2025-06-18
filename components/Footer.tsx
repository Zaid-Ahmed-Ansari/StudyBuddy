'use client'
import Link from "next/link";
import { useSession } from "next-auth/react";
import { IUser } from "@/src/model/User";
import { Github, Linkedin } from "lucide-react";

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
              href="/study-planner"
              className="hover:text-accent transition-colors duration-200"
              >
                Studdy Planner
              </Link>
              <Link
              href={`/ai-chat/${user?.id}`}
              className="hover:text-accent transition-colors duration-200"
              >
                AI Chatbot
              </Link>
              <Link
              href={`/notes-generator/${user?.id}`}
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
              <a href="https://github.com/zaid-ahmed-ansari" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/zaid-ahmed-ansari-aa9272293/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              
            </div>
            
          </div>
          
        </div>
         <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">Developed and maintained by Zaid Ahmed Ansari</p>
            <p className="mb-2">
              
                ahmedzaid2627@gmail.com
              
            </p>
            <p className="text-xs opacity-75">Special thanks to our beta tester: Tausif Ahmad Ansari</p>
            <p className="mb-2">
              
                tausif.ahmad880@gmail.com
              
            </p>
          </div>
  
        <div className="mt-10 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudyBuddy. All rights reserved.
        </div>

       
        </div>
      </footer>
    );
  }
  