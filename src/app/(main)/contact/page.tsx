'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Send, User, MessageSquare, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useState } from 'react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSending(true);
      
      const templateParams = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        time: new Date().toLocaleString(),
        to_email: 'ahmedzaid2627@gmail.com',
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_KEY!, // Replace with your EmailJS service ID
        process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID!, // Replace with your EmailJS template ID
        templateParams,
        process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY! // Replace with your EmailJS public key
      );

      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-accent mb-4">
          Contact Us
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We'd love to hear from you! Fill out the form below to send us a message.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 shadow-lg rounded-lg p-8 bg-card border border-border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="w-4 h-4" />
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="w-full px-4 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder="Your Name"
            />
            {errors.name && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className="w-full px-4 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquare className="w-4 h-4" />
            Subject
          </label>
          <input
            type="text"
            id="subject"
            {...register('subject')}
            className="w-full px-4 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            placeholder="What's this about?"
          />
          {errors.subject && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {errors.subject.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquare className="w-4 h-4" />
            Message
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={5}
            className="w-full px-4 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
            placeholder="Type your message here..."
          ></textarea>
          {errors.message && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {errors.message.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="w-full bg-accent text-accent-foreground py-3 px-6 rounded-md hover:bg-accent/90 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
            </>
          )}
        </button>
      </form>
    </main>
  );
}
