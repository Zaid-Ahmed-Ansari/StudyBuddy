'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import axios from 'axios';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  Calendar,
  Clock,
  BookOpen,
  Target,
  Loader2,
  Save,
  ChevronDown,
  FileText,
  GraduationCap,
  Send,
  X
} from 'lucide-react';

const Mermaid = dynamic(() => import('@/components/MermaidRenderer'), { ssr: false });

interface StudyPlan {
  startDate: string;
  endDate: string;
  subjects: string[];
  subjectInput: string;
  goals: string[];
  goalInput: string;
  institution: string;
  semester: string;
  additionalDetails: string;
  planType: 'detailed' | 'timetable';
}

export default function StudyPlanner() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan>({
    startDate: '',
    endDate: '',
    subjects: [],
    subjectInput: '',
    goals: [],
    goalInput: '',
    institution: '',
    semester: '',
    additionalDetails: '',
    planType: 'detailed',
  });

  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mermaidBlocks, setMermaidBlocks] = useState<string[]>([]);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const planRef = useRef<HTMLDivElement>(null);

  const addSubject = () => {
    if (studyPlan.subjectInput.trim() && !studyPlan.subjects.includes(studyPlan.subjectInput.trim())) {
      setStudyPlan({
        ...studyPlan,
        subjects: [...studyPlan.subjects, studyPlan.subjectInput.trim()],
        subjectInput: ''
      });
    }
  };

  const removeSubject = (subject: string) => {
    setStudyPlan({
      ...studyPlan,
      subjects: studyPlan.subjects.filter(s => s !== subject)
    });
  };

  const addGoal = () => {
    if (studyPlan.goalInput.trim() && !studyPlan.goals.includes(studyPlan.goalInput.trim())) {
      setStudyPlan({
        ...studyPlan,
        goals: [...studyPlan.goals, studyPlan.goalInput.trim()],
        goalInput: ''
      });
    }
  };

  const removeGoal = (goal: string) => {
    setStudyPlan({
      ...studyPlan,
      goals: studyPlan.goals.filter(g => g !== goal)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (studyPlan.subjects.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }
    if (!studyPlan.startDate || !studyPlan.endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    if (new Date(studyPlan.startDate) > new Date(studyPlan.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsLoading(true);
    setGeneratedPlan('');
    try {
      const response = await fetch('/api/study-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studyPlan),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      setGeneratedPlan(data.plan);
      extractMermaidBlocks(data.plan);
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast.error('Something went wrong while generating the plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractMermaidBlocks = (text: string) => {
    const regex = /```mermaid\n([\s\S]*?)```/g;
    const matches = [...text.matchAll(regex)];
    const blocks = matches.map((match) => match[1]);
    setMermaidBlocks(blocks);
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/user/save', {
        content: generatedPlan,
        createdAt: new Date().toISOString()
      });
      setSavedIndex(0);
      setTimeout(() => setSavedIndex(null), 1500);
      toast.success('Study plan saved successfully!');
    } catch (error) {
      console.error('Save error', error);
      toast.error('Failed to save study plan');
    }
  };

  const exportAsPdf = async () => {
    if (planRef.current) {
      const originalStyle = planRef.current.getAttribute('style') || '';
  
      // Override styles to remove unsupported color functions
      planRef.current.setAttribute(
        'style',
        `${originalStyle}; background: white; color: black; --tw-prose-body: black;`
      );
  
      try {
        const dataUrl = await toPng(planRef.current, {
          pixelRatio: 3,
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
  
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('study-plan.pdf');
        toast.success('Study plan exported as PDF');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Failed to export PDF');
      } finally {
        planRef.current.setAttribute('style', originalStyle); // Restore original style
      }
    }
  };

  return (
    <main className="min-h-screen flex justify-center py-14 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg border border-accent/10 overflow-hidden">
          {/* Header */}
          <div className="bg-accent/5 px-6 py-5 border-b border-accent/10">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-accent">
              <Calendar className="w-7 h-7" />
              <span>Study Planner</span>
            </h1>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="mb-8">
              <label className="text-sm font-medium mb-4 block">Select Plan Type (Visuals will look better on desktop)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStudyPlan({ ...studyPlan, planType: 'detailed' })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                    studyPlan.planType === 'detailed'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-accent/10 hover:border-accent/50'
                  }`}
                >
                  <FileText className="w-6 h-6" />
                  <div className="text-left">
                    <h3 className="font-semibold">Detailed Plan</h3>
                    <p className="text-sm opacity-80">Comprehensive study schedule with resources</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStudyPlan({ ...studyPlan, planType: 'timetable' })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                    studyPlan.planType === 'timetable'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-accent/10 hover:border-accent/50'
                  }`}
                >
                  <Calendar className="w-6 h-6" />
                  <div className="text-left">
                    <h3 className="font-semibold">Timetable</h3>
                    <p className="text-sm opacity-80">Simple weekly schedule with time slots</p>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subjects Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Subjects
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studyPlan.subjectInput}
                    onChange={(e) => setStudyPlan({ ...studyPlan, subjectInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubject();
                      }
                    }}
                    placeholder="Add a subject..."
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                  />
                  <button
                    type="button"
                    onClick={addSubject}
                    className="px-4 py-2 bg-accent/10 text-accent rounded-md hover:bg-accent hover:text-white transition-colors"
                  >
                    Add
                  </button>
                </div>
                {studyPlan.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {studyPlan.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm flex items-center gap-2"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => removeSubject(subject)}
                          className="hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Study Goals Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Study Goals
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studyPlan.goalInput}
                    onChange={(e) => setStudyPlan({ ...studyPlan, goalInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addGoal();
                      }
                    }}
                    placeholder="Add a goal..."
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                  />
                  <button
                    type="button"
                    onClick={addGoal}
                    className="px-4 py-2 bg-accent/10 text-accent rounded-md hover:bg-accent hover:text-white transition-colors"
                  >
                    Add
                  </button>
                </div>
                {studyPlan.goals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {studyPlan.goals.map((goal) => (
                      <span
                        key={goal}
                        className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm flex items-center gap-2"
                      >
                        {goal}
                        <button
                          type="button"
                          onClick={() => removeGoal(goal)}
                          className="hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    label: 'Start Date',
                    icon: <Calendar className="w-5 h-5 " />,
                    name: 'startDate',
                    type: 'date',
                  },
                  {
                    label: 'End Date',
                    icon: <Calendar className="w-5 h-5" />,
                    name: 'endDate',
                    type: 'date',
                  },
                  ...(studyPlan.planType === 'detailed' ? [
                    {
                      label: 'Institution',
                      icon: <GraduationCap className="w-5 h-5" />,
                      name: 'institution',
                      type: 'text',
                      placeholder: 'e.g., My School',
                    },
                    {
                      label: 'Semester/Class',
                      icon: <Clock className="w-5 h-5" />,
                      name: 'semester',
                      type: 'text',
                      placeholder: 'e.g., Class 11, Fall Term',
                    },
                  ] : []),
                ].map((field, idx) => (
                  <div key={idx} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      {field.icon} {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={(studyPlan as any)[field.name]}
                      onChange={(e) => setStudyPlan({ ...studyPlan, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Details (Regenerate if proper markdown is not shown)</label>
                <textarea
                  value={studyPlan.additionalDetails}
                  onChange={(e) => setStudyPlan({ ...studyPlan, additionalDetails: e.target.value })}
                  placeholder="Include learning preferences, goals, or specific needs..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background h-32 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Study Plan
                  </>
                )}
              </button>
            </form>

            {/* Generated Plan Section */}
            {generatedPlan && (
  <div className="mt-8 animate-fadeIn">
    <div
      className="flex items-center justify-between bg-accent/5 rounded-t-lg p-3 border border-accent/10 cursor-pointer"
      onClick={() => setSavedIndex(savedIndex === null ? 0 : null)}
    >
      <h2 className="text-lg font-semibold text-accent flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Generated Study Plan
      </h2>
      <button className="text-muted-foreground hover:text-foreground">
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            savedIndex === 0 ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>

    {savedIndex === 0 && (
      <div className="border border-t-0 border-accent/10 rounded-b-lg p-5 bg-white/5">
        <div ref={planRef} className="prose-dark max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const isMermaid = className?.includes('language-mermaid');
                return isMermaid ? (
                  <div className="w-full overflow-x-auto my-4">
                    <div className="min-w-[300px] max-w-full">
                      <Mermaid chart={String(children)} />
                    </div>
                  </div>
                ) : inline ? (
                  <code className="bg-muted/20 text-muted-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="bg-muted/10 text-muted-foreground p-4 rounded-md overflow-x-auto text-sm font-mono my-4">
                    <code {...props}>{children}</code>
                  </pre>
                );
              },

              table({ children }) {
                return (
                  <div className="overflow-x-auto w-full my-6 rounded-lg border border-accent/20">
                    <table className="w-full table-auto border-collapse text-left text-sm text-muted-foreground">
                      {children}
                    </table>
                  </div>
                );
              },

              thead({ children }) {
                return (
                  <thead className="bg-accent/10 text-accent">{children}</thead>
                );
              },

              tr({ children }) {
                return (
                  <tr className="border-b border-muted/10 hover:bg-muted/5 transition-colors">
                    {children}
                  </tr>
                );
              },

              th({ children }) {
                return (
                  <th className="px-4 py-3 font-semibold border-b border-muted/20 whitespace-nowrap">
                    {children}
                  </th>
                );
              },

              td({ children }) {
                return (
                  <td className="px-4 py-3 border-b border-muted/10 whitespace-nowrap">
                    {children}
                  </td>
                );
              },

              img({ src, alt, ...props }) {
                return (
                  <div className="w-full max-w-2xl mx-auto my-4 overflow-hidden rounded-md border border-muted/20">
                    <img
                      src={src}
                      alt={alt}
                      className="w-full h-auto object-contain"
                      {...props}
                    />
                  </div>
                );
              },
            }}
          >
            {generatedPlan}
          </ReactMarkdown>

          {mermaidBlocks.map((code, idx) => (
            <div key={idx} className="w-full overflow-x-auto my-6">
              <div className="min-w-[300px] max-w-full">
                <Mermaid chart={code} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-accent/10 flex flex-wrap justify-end gap-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedPlan);
              toast.success('Study plan copied to clipboard');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-200"
          >
            Copy Plan
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            Save to Dashboard
          </button>

          <button
            onClick={exportAsPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-200"
          >
            Export PDF
          </button>
        </div>
      </div>
    )}
  </div>
)}

          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Create personalized study plans with detailed schedules and resources
        </div>
      </div>
    </main>
  );
}
