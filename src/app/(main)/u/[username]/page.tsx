"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import axios from "axios"
import Card_10 from "@/src/components/kokonutui/card-10"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [username, setUsername] = useState(session?.user?.name || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post("/api/user/update-profile", {
        name: username,
        email,
      })
      setMessage("Profile updated successfully!")
    } catch (error) {
      setMessage("Something went wrong while updating profile.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-screen mx-auto mt-12 p-6 sm:p-10 h-screen shadow-md rounded-md border">
      <h1 className="text-2xl font-bold text-center text-accent mb-[40px]">
        Profile Settings
      </h1>
      <div className="flex md:flex-row flex-col items-center justify-between md:justify-center gap-10">

     
      <div className=" ">

      <Card_10/>
      </div>
      <div className="">

      
        <h1 className="text-bold text-3xl text-accent mb-5">Change your credentials here:</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Change your username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-primary"
            required
          />
        </div>
         
        <div>
          <label className="block text-sm font-medium mb-1">Change your email</label>
          <input
            type="email"
            value={email}
            disabled={session?.user?.provider === "google"} // Optional: lock Google email
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-primary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2 rounded-md hover:bg-accent/90 transition"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-muted-foreground">{message}</p>
      )}

      <div className="mt-8 text-sm text-center text-muted-foreground">
        <p>Logged in as <strong>{session?.user?.email}</strong></p>
        {/* <p>Saved Responses: <strong>🔖 Coming Soon</strong></p> */}
      </div>
      </div>
    </div>
     </div>
  )
}
