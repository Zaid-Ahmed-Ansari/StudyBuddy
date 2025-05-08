'use client'

import { signInSchema } from "@/src/schemas/signInSchema"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"



export function LoginForm() {
  const Router = useRouter()
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      
      identifier: "",
      password: "",
    },
  })
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials",{
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    

    })
    if (result?.error) {
      toast.error("Invalid credentials")
      console.error(result.error)
    } 
    if(result?.url){
      toast.success("Login successful")
      Router.replace('/dashboard')
    }
    console.log(data)
  }
  
  return(
    <>
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-bold">Login to your account</h1>
       <p className="text-balance text-sm text-muted-foreground">
         Enter your credentials below to Login
       </p>
     </div>
        
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (<>
            
            <FormItem>
              <FormLabel>Email Or Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email or username" {...field} />
              </FormControl>
              
              <FormMessage />
            </FormItem>
         </> )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (<>
            
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              
              <FormMessage />
            </FormItem>
         </> )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/80">
           Login
         </Button>
         <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
           <span className="relative z-10 bg-background px-2 text-muted-foreground">
             Or continue with
           </span>
         </div>
           {/* <button onClick={() => signIn("google")}>Sign in with Google</button> */}
         
       
       <div className="text-center text-sm">
         Don&apos;t have an account?{" "}
         <a href="/sign-up" className="underline underline-offset-4">
           Sign up
         </a>
       </div>
      </form>
    </Form>
    </>
  )
}