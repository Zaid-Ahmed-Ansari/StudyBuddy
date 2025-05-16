'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Message } from '@/src/model/User';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function Saved() {
  const { data: session } = useSession();
  const user = session?.user;
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);

  const handleDelete = async (id: string) => {
    try {
      const res = await axios.delete('/api/user/delete', {
        data: { id },
      });
      if (res.status === 200) {
        setSavedMessages(savedMessages.filter((msg) => msg._id !== id));
      } else {
        console.error('Failed to delete the message');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchSavedMessages = async () => {
      try {
        const res = await fetch('/api/user/saved');
        const data = await res.json();
        setSavedMessages(data.saved || []);
      } catch (error) {
        console.error('Failed to load saved messages', error);
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
        <div className="space-y-6">
          {savedMessages.map((msg) => (
  <div
    key={msg._id}
    className="group bg-background border border-muted rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out mb-4"
  >
    <div className="text-sm text-foreground leading-relaxed">
      <ReactMarkdown>
        {msg.content}
      </ReactMarkdown>
              </div>

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <time >
                  {new Date(msg.createdAt).toLocaleString()}
                </time>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(msg._id)}
                  aria-label="Delete saved message"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
