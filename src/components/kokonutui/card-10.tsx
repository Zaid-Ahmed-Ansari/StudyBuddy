import { Clock, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";

export default function Card_10() {
    const handleDeleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return

  try {
    const res = await axios.delete('/api/user/deleteAccount')

    if (res.status === 200) {
      alert('Account deleted successfully.')
      await signOut({callbackUrl:'/sign-up' })
       // or redirect however needed
    } else {
      alert('Failed to delete account.')
    }
  } catch (error) {
    console.error(error)
    alert('Something went wrong.')
  }
}
    const { data: session } = useSession()
    return (
        <div className="w-full max-w-sm mx-auto mb-3">
            <div className="  backdrop-blur-xl rounded-2xl shadow-xs border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
                <div className="p-5 border-b border-zinc-200/50 dark:border-zinc-800/50  dark:bg-zinc-900/50 backdrop-blur-xs">
                    <div className="flex items-start justify-between mb-2">
                        <h2 className="text-lg font-semibold text-accent dark:text-zinc-100">
                           {session?.user?.username}
                        </h2>
                        <div className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-700 border-orange-200">
                            User
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Our student at studybuddy
                    </p>
                </div>

                <div className="p-5 space-y-5">
                    <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        
                        <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {session?.user?.username}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {session?.user?.email}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {["position", "wait"].map((type) => (
                            <div
                                key={type}
                                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-3"
                            >
                                {type === "position" ? (
                                    <>
                                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            Update
                                        </span>
                                        <div className="flex items-baseline mt-1">
                                            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                                your
                                            </span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                                                credentials
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            With
                                        </span>
                                        <div className="flex items-baseline mt-1">
                                            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                                Ease
                                            </span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                                                in few clicks
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    

                    <Button
                        onClick={handleDeleteAccount}
                        variant="ghost"
                        className="w-full text-red-600 dark:text-red-400 hover:bg-accent dark:hover:bg-red-950/50 h-9 text-sm"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Remove Account
                    </Button>
                </div>
            </div>
        </div>
    );
}
