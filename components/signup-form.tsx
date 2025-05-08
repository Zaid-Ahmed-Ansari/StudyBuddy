'use client'

import { signUpSchema } from "@/src/schemas/signUpSchema"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { useDebounceCallback } from 'usehooks-ts'
import { useRouter } from "next/navigation"
import { ApiResponse } from "@/src/types/ApiResponse"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import axios, {AxiosError} from 'axios'
import {
  Form,
  FormControl,
  
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"


export function SignUpForm() {
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })
  const [username, setusername] = useState('')
  const [usernameMessage, setusernameMessage] = useState('')
  const [isCheckingUsername, setisCheckingUsername] = useState(false)
  const [isSubmitting, setisSubmitting] = useState(false)
  const debounced = useDebounceCallback(setusername, 300)
  const router = useRouter()

  useEffect(()=>{
    
    const checkUsernameUnique = async () =>{  if(username){
      setisCheckingUsername(true)
      setusernameMessage('')
      try {
       const response =  await axios.get(`/api/check-username-unique?username=${username}`)
       
       setusernameMessage(response.data.message)
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        setusernameMessage(axiosError.response?.data.message || "Error checking username")
      } finally{
        setisCheckingUsername(false)
      }
    }
    }
    checkUsernameUnique()
  },
  
  [username])
  const onSubmit = async(data: z.infer<typeof signUpSchema>)=>{
    setisSubmitting(true)
    try {
      const response = await axios.post('/api/sign-up',data)
      
      toast("User created successfully",{
        description: response.data.message,
        
      })
      router.replace(`/verify/${username}`)
      setisSubmitting(false)
    } catch (error) {
      console.log("Error in signup of user",error)
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "Error signing up")
      setisSubmitting(false)
    }
  }
  return(
    <>
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-bold">Create your account</h1>
       <p className="text-balance text-sm text-muted-foreground">
         Enter your credentials below to create an account
       </p>
     </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (<>
            
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your Username" {...field} 
                onChange={(e) => { field.onChange(e)
                  debounced(e.target.value)
                }} />
                
              </FormControl>
              {
                  isCheckingUsername && <Loader2 className="animate-spin"/> 
                }
                <p className={`text-sm `}>{usernameMessage}</p>
              <FormMessage />
            </FormItem>
         </> )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (<>
            
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
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
        <Button type="submit" disabled={isSubmitting}className="w-full bg-accent hover:bg-accent/80">
           {
            isSubmitting ? (<>
            <Loader2 className="mr-4 h-4 w-4 animate-spin"/>Please wait..
            </>):("Sign Up")

           }
         </Button>
         <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
           <span className="relative z-10 bg-background px-2 text-muted-foreground">
             Or continue with
           </span>
         </div>
         
       
       <div className="text-center text-sm">
         Already have an account?{" "}
         <a href="/sign-in" className="underline underline-offset-4">
           Sign in
         </a>
       </div>
      </form>
    </Form>
    </>
  )
}