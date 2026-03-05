import { useState } from 'react'
import { toDateStr, MONTHS, WEEKDAYS_SHORT } from '../utils'

function getCompletionLevel(completions, tasks, dateStr) {
  if (!tasks.length) return 0
  const dayData = completions[dateStr] || {}
  const done = tasks.filter(t => dayData[t]).length
  if (done === 0) return 0
  if (done === tasks.length) return 2
  return 1
}

export default function Calendar({ today, selectedDate, completions, tasks, onSelectDate }) {
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))
  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    onSelectDate(today)
  }

  const todayStr = toDateStr(today)
  const selectedStr = toDateStr(selectedDate)

  const cells = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <div className="calendar">
      <div className="cal-nav">
        <button className="cal-arrow" onClick={prevMonth} aria-label="Previous month">&#8249;</button>
        <div className="cal-month-label">
          <span>{MONTHS[month]} {year}</span>
          <button className="today-btn" onClick={goToday}>Today</button>
        </div>
        <button className="cal-arrow" onClick={nextMonth} aria-label="Next month">&#8250;</button>
      </div>

      <div className="cal-grid">
        {WEEKDAYS_SHORT.map(d => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}

        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} className="cal-cell empty" />

          const dateStr = toDateStr(date)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedStr
          const isPast = date < today
          const level = getCompletionLevel(completions, tasks, dateStr)

          let cls = 'cal-cell'
          if (isToday) cls += ' is-today'
          if (isSelected) cls += ' is-selected'
          if (isPast && !isToday) cls += ' is-past'

          return (
            <div
              key={dateStr}
              className={cls}
              onClick={() => onSelectDate(date)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelectDate(date)}
              aria-label={dateStr}
              aria-pressed={isSelected}
            >
              <span className="cal-day-num">{date.getDate()}</span>
              {level > 0 && <span className={`cal-dot level-${level}`} />}
            </div>
          )
        })}
      </div>

      <div className="cal-legend">
        <span className="legend-item"><span className="cal-dot level-1" /> Partial</span>
        <span className="legend-item"><span className="cal-dot level-2" /> All done</span>
      </div>
    </div>
  )
}
