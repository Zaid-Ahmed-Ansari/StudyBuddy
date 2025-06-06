import { Bot, CalendarCheck, ChartColumn, File, Home, NotebookPen } from "lucide-react"
import BentoGrid from "./bento-grid"



const Features = () => {
  return (
   <>
    <div className="flex flex-col items-center justify-center w-full py-10 text-center ">
     <h1 className="text-3xl font-bold">Features we provides</h1>
     <p className="mt-2 text-sm text-gray-500">Explore our AI-powered features designed to enhance your learning experience.</p>
    </div>
   <BentoGrid 
   items={
    [
      {
        title: "AI Chatbot",
        description: "Get instant answers to your questions and personalized study tips",
        icon: <Bot />,
        meta: "24/7 availability",
        tags: ["AI", "Chat"],
        status: "Active",
        colSpan: 1
      },
       
      {
        title: "Notes Generator",
        meta: "Any Topic",
        description:
            "Generate concise and organized notes from your study materials with AI assistance.",
        icon: <File/>,
        status: "Featured",
        tags: ["Notes", "AI"],
        colSpan: 1
      },
      {
        title: "Note Summarizer",
        meta: "PDF, DOCX",
        description:
            "Summarize your notes efficiently with AI assistance, making study sessions more productive.",
        icon: <NotebookPen/>,
        status: "Active",
        tags: ["Notes", "AI"],
        colSpan: 1,
      },
      {
        title: "Visuals Generator",
        description: "Create Charts, Graphs from your text prompts with AI assistance.",
        icon: <ChartColumn />,
        meta: "24/7 availability",
        tags: ["AI", "Visuals"],
        status: "Active",
        colSpan: 1
      },
      {
        title: "Study Club",
        description: "Join or create a study group with your friends. Video call, chat, and more.",
        icon: <Home />,
        meta: "24/7 availability",
        tags: ["AI", "Study", "Calls"],
        status: "Coming Soon",
        colSpan: 2
      },
      
    ]
   }
   />
   </>
  )
}

export default Features