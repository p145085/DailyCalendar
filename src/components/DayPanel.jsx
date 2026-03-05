import { useState, useRef, useEffect } from 'react'
import { toDateStr, MONTHS, WEEKDAYS } from '../utils'

const CONFIRM_WINDOW_MS = 2000

export default function DayPanel({ selectedDate, today, tasks, completions, onToggle }) {
  const [pendingTask, setPendingTask] = useState(null)
  const timeoutRef = useRef(null)

  // Clear pending state whenever the selected date changes
  useEffect(() => {
    clearTimeout(timeoutRef.current)
    setPendingTask(null)
  }, [selectedDate])

  const dateStr = toDateStr(selectedDate)
  const todayStr = toDateStr(today)
  const isToday = dateStr === todayStr
  const isPast = selectedDate < today
  const isFuture = selectedDate > today

  const dayData = completions[dateStr] || {}
  const completedCount = tasks.filter(t => dayData[t]).length
  const allDone = tasks.length > 0 && completedCount === tasks.length

  const handleClick = (task) => {
    if (!isPast) {
      // Today and future: single click
      onToggle(dateStr, task)
      return
    }

    // Past day: require two clicks within the time window
    if (pendingTask === task) {
      clearTimeout(timeoutRef.current)
      setPendingTask(null)
      onToggle(dateStr, task)
    } else {
      clearTimeout(timeoutRef.current)
      setPendingTask(task)
      timeoutRef.current = setTimeout(() => setPendingTask(null), CONFIRM_WINDOW_MS)
    }
  }

  const label = `${WEEKDAYS[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`

  return (
    <div className="day-panel">
      <div className="day-header">
        <div className="day-title-row">
          <h2 className="day-title">{label}</h2>
          {isToday && <span className="badge badge-today">Today</span>}
          {isPast && <span className="badge badge-past">Past</span>}
          {isFuture && <span className="badge badge-future">Upcoming</span>}
        </div>
        {tasks.length > 0 && (
          <div className="day-progress">
            <div className="day-progress-bar">
              <div
                className="day-progress-fill"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
            <span className="day-progress-label">{completedCount}/{tasks.length}</span>
          </div>
        )}
      </div>

      {isPast && (
        <div className="past-notice">
          <span>&#128274;</span> Past day &mdash; click once to unlock a task, then again to toggle
        </div>
      )}

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            No tasks yet. Add some in the <strong>Tasks</strong> tab.
          </div>
        ) : (
          tasks.map(task => {
            const done = !!dayData[task]
            const isPending = pendingTask === task

            let cls = 'task-row'
            if (done) cls += ' done'
            if (isPending) cls += ' pending'

            return (
              <div
                key={task}
                className={cls}
                onClick={() => handleClick(task)}
                role="checkbox"
                aria-checked={done}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleClick(task)}
              >
                <div className={`task-check${done ? ' checked' : ''}`}>
                  {done && <span className="checkmark">&#10003;</span>}
                </div>
                <span className="task-name">{task}</span>
                {isPending && (
                  <span className="pending-hint">Click again to confirm</span>
                )}
                {isPast && !isPending && (
                  <span className="lock-icon">&#128274;</span>
                )}
              </div>
            )
          })
        )}
      </div>

      {allDone && (
        <div className="all-done">
          &#127881; All tasks completed for this day!
        </div>
      )}
    </div>
  )
}
