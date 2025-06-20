"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { IUser } from "@/src/model/User"




const Navbar =() => {

  const { data: session } = useSession();
  const user = session?.user 
  const components: { title: string; href: string; description: string }[] = [
    {
      title: "Study Planner",
      href: `/study-planner`,
      description:
        "An AI-powered study planner that will help you organize your time and study.",
    },
  {
    title: "AI Chatbot",
    href: `/ai-chat/${user?.id}`,
    description:
      "An AI-powered study buddy that helps you learn and understand concepts better.",
  },
  {
    title: "Notes Generator",
    href: `/notes-generator/${user?.id}`,
    description:
      "Generates notes based on the content you provide, making it easier to study and review.",
  },
  {
    title: "Notes Summarizer",
    href: "/notes-summarizer",
    description:
      "Summarizes your notes to help you focus on the most important points.",
  },
  
  {
    title: "Visuals Generator",
    href: "/visuals-generator",
    description: "Create diagrams and visual representations.",
  },
   {
    title: "Study Club",
    href: "/study-club",
    description: "Create or join study groups where you can chat or do a video call session.",
  }
]

  return (
    <div className="sticky h-max invisible md:visible pt-3 pb-3 pl-5 pr-5 mx-auto border-2 rounded-full  z-40 mt-3 w-max bg-background/95 backdrop-blur ">
    <NavigationMenu>
      <NavigationMenuList>
      <NavigationMenuItem>
          <Link href="/"  passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <div
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    
                  >
                    {/* <Icons.logo className="h-6 w-6" /> */}
                    <div className="mb-2 mt-4 text-lg font-medium">
                      StuddyBuddy
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Your AI-powered study buddy that helps you learn and understand
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <ListItem href="#" title="Introduction">
                Learn about the features and capabilities of StuddyBuddy.
              </ListItem>
              <ListItem href="#" title="On your device">
                No need to install anything, just open the app and start using it.
              </ListItem>
              <ListItem href="#" title="AI">
                Integrate AI into your study routine and enhance your learning experience.
              </ListItem>
              
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/contact"  passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Contact Us
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title,href, children, ...props }, ref) => {
  return (
    <li>
     <Link href={href} passHref>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/70 hover:text-accent-foreground/70 focus:bg-accent/70 focus:text-accent-foreground/70",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </Link>
    </li>
  )
})
ListItem.displayName = "ListItem"
export default Navbar