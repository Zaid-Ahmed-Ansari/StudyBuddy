import {  Library } from "lucide-react"


import Link from "next/link"
import { SignUpForm } from "@/components/signup-form"

export default function SignUpPage() {
  
  return (
    <div className="">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-accent-foreground">
              <Library className="size-4 " />
            </div>
            StudyBuddy
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>
      
      </div>
    
  )
}
