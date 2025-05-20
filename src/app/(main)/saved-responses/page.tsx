'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Message } from '@/src/model/User';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import  {toast} from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Saved() {
  // State management
  const { data: session } = useSession();
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch messages handler with proper error handling
  const fetchSavedMessages = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/user/saved');
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      
      const data = await res.json();
      setSavedMessages(data.saved || []);
    } catch (error) {
      console.error('Failed to load saved messages', error);
      setError('Unable to load your saved responses. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Delete message handler with confirmation
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    
    try {
      const res = await axios.delete('/api/user/delete', {
        data: { id },
      });
      
      if (res.status === 200) {
        setSavedMessages(savedMessages.filter((msg) => msg._id !== id));
        toast("Message deleted: Your saved response has been removed", { duration: 3000 });
      } else {
        throw new Error('Server returned an error');
      }
    } catch (error) {
      console.error(error);
      toast(
        <div>
          <strong>Error</strong>
          <div>Failed to delete the message. Please try again.</div>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setIsDeleting(false);
      setMessageToDelete(null);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSavedMessages();
  }, [fetchSavedMessages]);

  // Render loading skeletons
  const renderSkeletons = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border border-muted">
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter className="flex justify-between border-t border-muted/20 px-6 py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="font-semibold text-lg mb-2">Failed to load saved responses</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button 
        variant="outline" 
        onClick={fetchSavedMessages}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-16 bg-muted/30 border rounded-lg flex flex-col items-center">
      <div className="bg-muted/50 rounded-full p-4 mb-4">
        <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p className="font-medium text-lg mb-1">No saved responses yet</p>
      <p className="text-muted-foreground text-sm max-w-md">
        When you save AI responses from your conversations, they will appear here for easy reference.
      </p>
    </div>
  );

  // Render message cards
  const renderMessages = () => (
    <div className="space-y-5">
      {savedMessages.map((msg) => (
        <Card
          key={msg._id}
          className="group border border-muted bg-background hover:shadow-md transition-all duration-300 ease-in-out"
        >
          <CardContent className="pt-6 pb-2">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t border-muted/20 px-6 py-3">
            <time className="text-xs text-muted-foreground">
              {new Date(msg.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </time>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessageToDelete(msg._id)}
              aria-label="Delete saved message"
              className="opacity-60 hover:opacity-100"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
          <span className="text-xl">📚</span> Saved AI Responses
        </h2>
        {savedMessages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchSavedMessages}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {isLoading ? renderEmptyState() : 
       error ? renderError() :
       savedMessages.length === 0 ? renderEmptyState() : 
       renderMessages()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved response.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => messageToDelete && handleDelete(messageToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}