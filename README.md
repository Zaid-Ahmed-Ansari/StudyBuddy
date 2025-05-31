# 📚 StudyBuddy – Your AI-Powered Study Partner

StudyBuddy is a modern web platform designed to help students collaborate, learn, and stay organized. Powered by AI, StudyBuddy allows users to chat with an AI tutor, generate study notes, visualize concepts (charts, flowcharts, math), and create or join real-time study groups.

---
##Live 
www.studybuddy.rest

## 🚀 Features

### 🤖 AI Assistant
- Chat with an AI tutor for study-related questions
- Save and copy AI-generated answers
- Streaming responses with "Abort" button
- Persistent chat history with multiple separate conversations

### 📒 AI Notes Generator
- Generate structured notes based on selected subject and topic
- Supports DOC and DOCX uploads for summarization
- Save, copy, and re-generate notes with ease

### 🧠 Visual Generator
- Create charts (bar, pie, line), flowcharts (Mermaid.js), and math/trig equations
- Just enter a simple phrase — AI does the rest
- Editable input for custom graphs and improved learning

### 👨‍🏫 Study Clubs
- Create or join real-time study groups
- Admin dashboard to accept/reject join requests
- Invite friends using a unique code
- Built-in video/audio support and collaborative PDF viewer (Coming soon)

### 🔐 Authentication
- Secure login/signup with credentials
- Fully integrated user sessions using NextAuth.js

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Backend**: Node.js, [Mongoose (MongoDB)](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI API**: Google Gemini Pro via [Vercel AI SDK](https://vercel.com/docs/ai)
- **Real-Time UI**: React Server Components, Suspense, and App Router's Streaming
- **Design**: Tailwind CSS, shadcn/ui, Lucide Icons

---

## 📦 Installation

```bash
git clone https://github.com/your-username/studybuddy.git
cd studybuddy
npm install
