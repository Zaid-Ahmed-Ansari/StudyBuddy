"use client";

import {
  Bot,
  CalendarCheck,
  ChartColumn,
  File,
  Home,
  NotebookPen,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";



const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const Features = () => {
  const {data:session} = useSession()
  const user = session?.user
  const features = [
    {
      title: "Study Planner",
      description:
        "Effortlessly structure your semester with AI-generated weekly study plans. Manage your goals, keep track of progress, and optimize your study sessions for peak performance with real-time feedback and analytics.",
      icon: CalendarCheck,
      meta: "24/7 Access",
      link: "/study-planner",
    },
    {
      title: "AI Chatbot",
      description:
        "Get instant academic help anytime, anywhere. Ask questions, clarify concepts, receive study tips, and even generate summaries. The chatbot evolves with your needs to offer tailored support.",
      icon: Bot,
      meta: "Ask Anything",
      link: `/ai-chat/${user?.id}`,
    },
    {
      title: "Notes Generator",
      description:
        "Turn raw lecture material, class transcripts, or textbook paragraphs into well-organized, concise, and categorized notes. Supports markdown, headings, lists, and even mind maps.",
      icon: File,
      meta: "Auto-organized",
      link: `/notes-generator/${user?.id}`,
    },
    {
      title: "Note Summarizer",
      description:
        "Compress lengthy notes or documents into essential bullet points. Focus on what matters and revise quickly. Supports PDFs, DOCX, and plain text files. Ideal for last-minute reviews.",
      icon: NotebookPen,
      meta: "Smart Compression",
      link: "/notes-summarizer",
    },
    {
      title: "Visuals Generator",
      description:
        "Transform written prompts into diagrams, charts, and flowcharts. Supports output in image, SVG, and Mermaid.js syntax. Ideal for visual learners and presentation prep.",
      icon: ChartColumn,
      meta: "Prompt to Graph",
      link: "/visuals-generator",
    },
    {
      title: "Study Club",
      description:
        "Collaborate in real-time with peers via chat, video, file sharing, and whiteboards. Create or join clubs based on your subjects or interests with a single link.",
      icon: Home,
      meta: "Real-time Sync",
      link: "/study-club",
    },
  ];
  return (
    <section className=" text-white px-6 py-20 md:px-12">
      <div className="text-center mb-20">
        <h2 className="text-4xl font-extrabold tracking-tight">Features We Provide</h2>
        <p className="text-zinc-400 mt-4 text-base max-w-xl mx-auto">
          A powerful set of AI tools designed to enhance how you learn, revise, collaborate, and grow.
        </p>
      </div>
      <hr className="mb-10"/>
      

      <div className="relative ml-4 md:ml-10">
        {/* Vertical line */}
        

        <div className="space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="relative pl-10 group"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
                variants={fadeUp}
              >
                {/* Dot */}
                <span className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_2px_#c02bea] group-hover:scale-110 transition-transform" />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>

                  <p className="text-base leading-relaxed text-zinc-400 max-w-3xl">
                    {feature.description}
                  </p>

                  <Link
                    href={feature.link}
                    className="text-sm text-purple-300 hover:text-purple-400 mt-1 inline-flex items-center gap-1 transition-colors"
                  >
                    {feature.meta} →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        <hr className="mt-10"/>
      </div>
    </section>
  );
};

export default Features;
