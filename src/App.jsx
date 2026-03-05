import { useState, useEffect, useCallback } from 'react'
import Calendar from './components/Calendar'
import DayPanel from './components/DayPanel'
import ProgressView from './components/ProgressView'
import TaskManager from './components/TaskManager'

const DEFAULT_DATA = { tasks: ['Duolingo'], completions: {} }

function loadData() {
  try {
    const saved = localStorage.getItem('dailycalendar-v1')
    return saved ? JSON.parse(saved) : DEFAULT_DATA
  } catch {
    return DEFAULT_DATA
  }
}

function makeToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function App() {
  const [today] = useState(makeToday)
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState('calendar')
  const [data, setData] = useState(loadData)

  useEffect(() => {
    localStorage.setItem('dailycalendar-v1', JSON.stringify(data))
  }, [data])

  const toggleTask = useCallback((dateStr, task) => {
    setData(prev => {
      const dayData = prev.completions[dateStr] || {}
      return {
        ...prev,
        completions: {
          ...prev.completions,
          [dateStr]: { ...dayData, [task]: !dayData[task] },
        },
      }
    })
  }, [])

  const addTask = useCallback((name) => {
    const trimmed = name.trim()
    setData(prev => {
      if (!trimmed || prev.tasks.includes(trimmed)) return prev
      return { ...prev, tasks: [...prev.tasks, trimmed] }
    })
  }, [])

  const removeTask = useCallback((name) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t !== name) }))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-logo">&#128197;</span>
          <h1>Daily Calendar</h1>
        </div>
        <nav className="app-nav">
          {['calendar', 'progress', 'tasks'].map(v => (
            <button
              key={v}
              className={`nav-btn${view === v ? ' active' : ''}`}
              onClick={() => setView(v)}
            >
              {v === 'calendar' ? 'Calendar' : v === 'progress' ? 'Progress' : 'Tasks'}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {view === 'calendar' && (
          <div className="calendar-layout">
            <Calendar
              today={today}
              selectedDate={selectedDate}
              completions={data.completions}
              tasks={data.tasks}
              onSelectDate={setSelectedDate}
            />
            <DayPanel
              selectedDate={selectedDate}
              today={today}
              tasks={data.tasks}
              completions={data.completions}
              onToggle={toggleTask}
            />
          </div>
        )}
        {view === 'progress' && (
          <ProgressView data={data} today={today} />
        )}
        {view === 'tasks' && (
          <TaskManager tasks={data.tasks} onAdd={addTask} onRemove={removeTask} />
        )}
      </main>
    </div>
  )
}

export default App
