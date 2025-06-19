import { GalleryVerticalEnd, Library } from "lucide-react"


import { SignUpForm } from "@/components/signup-form"
import { ThreeDMarquee } from "@/components/threed-marquee"

export default function LoginPage() {
  const images = [
    "/assets/chat.png",
    "/assets/study1.png",
    "/assets/main.png",
    "/assets/notesgen.png",

    "/assets/features.png",
    "/assets/study2.png",
    "/assets/summarizer.png",
    "/assets/study3.png",

    "/assets/visuals.png",
    "/assets/study4.png",
    "/assets/planner.png",
    "/assets/main.png",

    "/assets/chat.png",
    "/assets/study1.png",
    "/assets/main.png",
    "/assets/planner.png",

    "/assets/features.png",
    "/assets/study2.png",
    "/assets/summarizer.png",
    "/assets/study3.png",

    "/assets/visuals.png",
    "/assets/study4.png",
    "/assets/planner.png",
    "/assets/main.png",
    
    "/assets/dash.png",
    "/assets/study1.png",
    "/assets/features.png",
    "/assets/study2.png",

    "/assets/summarizer.png",
    "/assets/study3.png",
    "/assets/visuals.png",
    "/assets/study4.png",

    "/assets/planner.png",
    "/assets/main.png",
    
  ]
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className=" text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Library className="size-10 text-accent" />
            </div>
            StudyBuddy
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <ThreeDMarquee
          images={images}
        />
      </div>
    </div>
  )
}
