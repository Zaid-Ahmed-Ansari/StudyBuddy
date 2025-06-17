import { rateLimit } from '@/src/lib/rate-limit';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  try {
    const body = await req.json();

    const {
      startDate,
      endDate,
      subjects = [],
      goals = [],
      institution = 'N/A',
      semester = 'N/A',
      additionalDetails = '',
      planType = 'detailed',
      studyHours
    } = body;

    if (!startDate || !endDate || !subjects.length || !goals.length) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required fields.' }),
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const limitCheck = rateLimit(ip.toString(), 10, 60 * 1000); // 10 req/min

    if (!limitCheck.success) {
      return new NextResponse(
        JSON.stringify({ message: 'Too many requests. Please try again later.' }),
        { status: 429 }
      );
    }

    const prompt =
      planType === 'detailed'
        ? `
You are a professional academic planner AI. Generate a **highly detailed and structured weekly study plan** for the following student:

## USER DETAILS:
- **Subjects:** ${subjects.join(', ')}
- **Study Goals:** ${goals.join(', ')}
- **Institution:** ${institution}
- **Semester/Class:** ${semester}
- **Start Date:** ${startDate}
- **End Date:** ${endDate}
- **Study Hours:**${studyHours}
- **Additional Info:** ${additionalDetails}

---

## 📋 OUTPUT FORMAT (MARKDOWN):

### Overview
Brief summary of timeline, goals, and structure.

---

### 📅 Weekly Plan:

#### Week X (e.g., July 1 – July 7)
- **Key Learning Goals**
- **Topics to Cover**
- **Daily Breakdown**

| Day | Subject | Focus Topics | Study Hours | Notes |
|-----|---------|--------------|-------------|-------|
| Monday | ${subjects[0]} | Topic 1 | 2 | Lecture review |
| Tuesday | ${subjects[1]} | Topic 2 | 1.5 | Notes + reading |

---For all subjects 

### 📊 Study Timeline

#### ${subjects[0]} Timeline
| Phase | Start Date | Duration | Description |
|-------|------------|----------|-------------|
| Research | ${startDate} | 3 days | Initial research and topic exploration |
| Core Study | +3 days | 15 days | Main study phase with detailed learning |
| Revision | +18 days | 7 days | Review and practice phase |
| Final Prep | +25 days | 5 days | Final preparation and mock tests |

#### ${subjects[1]} Timeline
| Phase | Start Date | Duration | Description |
|-------|------------|----------|-------------|
| Research | ${startDate} | 3 days | Initial research and topic exploration |
| Core Study | +3 days | 15 days | Main study phase with detailed learning |
| Revision | +18 days | 7 days | Review and practice phase |
| Final Prep | +25 days | 5 days | Final preparation and mock tests |

---No need to create different tables for different subjects just merge them in a single one

### 🎓 Study Techniques
- Suggest relevant methods for learning (e.g., spaced repetition, mind-mapping, discussion groups)
- Productivity tips and focus strategies
- Subject-specific study techniques for each subject

---

### 📚 Resources

#### Books & Materials
- List 2–3 helpful resources per subject (books, journals, articles)

#### Online Platforms
- Include 2–3 useful online tools (Coursera, JSTOR, Notion, etc.)

#### Videos
- List 3–5 high-quality video lectures or documentaries per subject in this format:
  - **[Title](https://youtube.com/...)** — Short description

---

### ✅ Self-Assessment
- Milestone checks or checkpoints for each subject
- Suggestions for quizzes, essays, or group discussions
- Final review strategy
- Progress tracking methods aligned with user's goals

---

### 💡 Motivation & Wellness
- Tips for staying motivated
- Balance between study, rest, and mental health
- Daily reminders for hydration, movement, breaks, and reflection
- Subject-specific motivation tips

---

### ⚠️ IMPORTANT MARKDOWN RULES:
- Use **bold** and \`code blocks\` where needed
- Format cleanly with headings (##, ###, etc.)
- Use markdown tables for all structured data
`
        : `
Generate a **detailed weekly study timetable** in markdown table format.

## INPUT:
- Subjects: ${subjects.join(', ')}
- Start Date: ${startDate}
- End Date: ${endDate}
- Study Goals: ${goals.join(', ')}
- Additional Details: ${additionalDetails}

## OUTPUT:
Return a clean markdown table showing the weekly schedule.
No need for whole day just make it as per user's given study hours-${studyHours}
seperate it accordingly

| Time | Monday | Tuesday | Wednesday | Thursday | Friday |
|------|--------|---------|-----------|----------|--------|
| 09:00 - 10:30 | ${subjects[0]} Lecture | ${subjects[1]} Practice | ${subjects[0]} Review | ${subjects[1]} Lecture | ${subjects[0]} Practice |
| 10:30 - 11:00 | Break | Break | Break | Break | Break |
| 11:00 - 12:30 | ${subjects[0]} Practice | ${subjects[1]} Lecture | ${subjects[0]} Lecture | ${subjects[1]} Practice | ${subjects[0]} Review |
| 12:30 - 14:00 | Lunch Break | Lunch Break | Lunch Break | Lunch Break | Lunch Break |
| 14:00 - 15:30 | ${subjects[1]} Review | ${subjects[0]} Practice | ${subjects[1]} Practice | ${subjects[0]} Lecture | ${subjects[1]} Lecture |
| 15:30 - 16:00 | Break | Break | Break | Break | Break |
| 16:00 - 17:30 | ${subjects[1]} Practice | ${subjects[0]} Review | ${subjects[1]} Lecture | ${subjects[0]} Practice | ${subjects[1]} Practice |
`;

    const { text } = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });
    const cleanMarkdown = text.replace(/```markdown([\s\S]*?)```/g, (_, content) => content.trim());

    return NextResponse.json({ plan: cleanMarkdown});
  } catch (err) {
    console.error('Error generating study plan:', err);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Something went wrong while generating the study plan.',
      }),
      { status: 500 }
    );
  }
}
