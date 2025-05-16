"use client"
import { useState } from "react"

export default function TaskForm({ onAddTask }: { onAddTask: (task: any) => void }) {
  const [task, setTask] = useState({
    title: '',
    dueDate: '',
    estimatedTime: '',
    priority: 'Medium',
    category: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTask({ ...task, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddTask({ ...task, id: Date.now().toString(), isCompleted: false })
    setTask({ title: '', dueDate: '', estimatedTime: '', priority: 'Medium', category: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <input name="title" placeholder="Task Title" value={task.title} onChange={handleChange} className="w-full p-2 border rounded" required />
      
      <input type="date" name="dueDate" value={task.dueDate} onChange={handleChange} className="w-full p-2 border rounded" required />
      
      <input type="number" name="estimatedTime" placeholder="Estimated Time (mins)" value={task.estimatedTime} onChange={handleChange} className="w-full p-2 border rounded" required />
      
      <select name="priority" value={task.priority} onChange={handleChange} className="w-full p-2 border rounded">
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      
      <input name="category" placeholder="Category (optional)" value={task.category} onChange={handleChange} className="w-full p-2 border rounded" />
      
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Add Task</button>
    </form>
  )
}
