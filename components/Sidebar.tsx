"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, Library, LibraryBig, CalendarCheck, NotebookPenIcon, Bot, UserCircle2, NotebookText, House, ChartColumn, CalendarDays } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import {User} from "next-auth"
import { useSession } from "next-auth/react";
import Image from "next/image";
import { UserAvatar } from "./UserAvatar";

export function SidebarDemo() {
  const { data: session } = useSession();
  const user = session?.user as User;
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Study Planner",
      href: "/study-planner",
      icon: (
        <CalendarDays className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    
    {
      label: "AI Chatbot",
      href: `/ai-chat/${user?.id}`,
      icon: (
        <Bot className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Notes Generator",
      href:  `/notes-generator/${user?.id}`,
      icon: (
        <NotebookPenIcon className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    
    {
      label: "Notes Summarizer",
      href: "/notes-summarizer",
      icon: (
        <NotebookText className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Visuals Generator",
      href: "/visuals-generator",
      icon: (
        <ChartColumn className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    
     {
      label: "Study Club",
      href: "/study-club",
      icon: (
        <House className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className="z-50 h-screen rounded-lg "
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between bg-background gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <Library />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user?.username || "",
                href: `/u/${user?.username}`,
                icon: (
                  <UserAvatar username={user?.username} size={24} />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {/* <Dashboard /> */}
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="flex gap-2">
      <Library/>
      <Link
    href="/">
      
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white dark:text-white whitespace-pre"
      >
        StudyBuddy
      </motion.span>
    </Link>
    </div>
  
  
  );
};

export const LogoIcon = () => {
  return (
    <Library/>
  );
};