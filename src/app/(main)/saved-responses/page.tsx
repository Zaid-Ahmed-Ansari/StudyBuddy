'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Message } from '@/src/model/User';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function Saved() {
  const { data: session } = useSession();
  const user = session?.user;
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);
  const handleDelete = async (id:string)=>{
      try {
        const res = await axios.delete('/api/user/delete',{
          data: {id}
        })
        if (res.status === 200) {
          // Remove the deleted message from the UI
          setSavedMessages(savedMessages.filter(msg => msg._id !== id));
        } else {
          console.error('Failed to delete the message');
        }
      } catch (error) {
        console.error(error)
      }
  }

  useEffect(() => {
    const fetchSavedMessages = async () => {
      try {
        const res = await fetch('/api/user/saved');
        const data = await res.json();
        setSavedMessages(data.saved || []);
      } catch (error) {
        console.error("Failed to load saved messages", error);
      }
    };

    if (user?.id) fetchSavedMessages();
  }, [user?.id]);
  
  

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-accent">📚 Saved AI Responses</h2>

      {savedMessages.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-muted border rounded-lg">
          <p>No saved responses yet.</p>
        </div>
      ) : (
        <div>
          {savedMessages.map((msg) => (
            <div
              key={msg._id}
              className="group bg-background border border-muted rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out flex justify-between mb-2"
            >
              <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
              <p className="text-sm text-foreground leading-relaxed">{new Date(msg.createdAt).toLocaleString()}</p>
              <Button
              
              onClick={()=> handleDelete(msg._id)}>

              <Trash2 className=''/>
              </Button>
            </div>
          ))}
        </div>
        // <ul className="space-y-4 max-h-[32rem] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-accent/70 scrollbar-track-transparent">
        //   {savedMessages.map((msg, idx) => (
        //     <li
        //       key={idx}
        //       className="group bg-background border border-muted rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
        //     >
        //       <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
        //       <Trash2 className=''/>
        //     </li>
        //   ))}
        // </ul>
      )}
    </div>
  );
}
