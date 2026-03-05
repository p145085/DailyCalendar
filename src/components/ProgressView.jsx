import { toDateStr, MONTHS } from '../utils'

function getOverallStreak(completions, tasks, today) {
  if (!tasks.length) return 0
  let streak = 0
  const d = new Date(today)
  while (true) {
    const ds = toDateStr(d)
    const dayData = completions[ds] || {}
    if (tasks.every(t => dayData[t])) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function getTaskStreak(completions, task, today) {
  let streak = 0
  const d = new Date(today)
  while (true) {
    const ds = toDateStr(d)
    if (completions[ds]?.[task]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function getRangeStats(completions, tasks, startDate, endDate) {
  let done = 0
  let total = 0
  const d = new Date(startDate)
  while (d <= endDate) {
    const ds = toDateStr(d)
    const dayData = completions[ds] || {}
    done += tasks.filter(t => dayData[t]).length
    total += tasks.length
    d.setDate(d.getDate() + 1)
  }
  return { done, total }
}

function pct(done, total) {
  return total > 0 ? Math.round((done / total) * 100) : 0
}

function Heatmap({ completions, tasks, today }) {
  // Build 16 complete weeks ending today, padded to end of week
  const end = new Date(today)
  end.setDate(end.getDate() + (6 - end.getDay())) // pad to Saturday

  const start = new Date(end)
  start.setDate(start.getDate() - 16 * 7 + 1)

  const weeks = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const ds = toDateStr(cursor)
      const isFuture = cursor > today
      const dayData = completions[ds] || {}
      const done = tasks.filter(t => dayData[t]).length
      const levelIndex = isFuture
        ? -1
        : done === 0
          ? 0
          : done === tasks.length
            ? 4
            : done >= tasks.length * 0.75
              ? 3
              : done >= tasks.length * 0.5
                ? 2
                : 1
      week.push({ ds, levelIndex, done, total: tasks.length })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  const COLORS = ['#e2e8f0', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a']
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-day-labels">
        {dayLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-col">
            {week.map(cell => (
              <div
                key={cell.ds}
                className="heatmap-cell"
                style={{
                  backgroundColor: cell.levelIndex < 0 ? 'transparent' : COLORS[cell.levelIndex],
                }}
                title={`${cell.ds}: ${cell.done}/${cell.total} tasks`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        {COLORS.map((c, i) => (
          <div key={i} className="heatmap-cell" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export default function ProgressView({ data, today }) {
  const { tasks, completions } = data

  const overallStreak = getOverallStreak(completions, tasks, today)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthStats = getRangeStats(completions, tasks, monthStart, today)

  const week7Start = new Date(today)
  week7Start.setDate(week7Start.getDate() - 6)
  const week7Stats = getRangeStats(completions, tasks, week7Start, today)

  // All-time totals
  const allDates = Object.keys(completions)
  const allTimeDone = allDates.reduce((sum, ds) => {
    return sum + tasks.filter(t => completions[ds]?.[t]).length
  }, 0)
  const allTimeTotal = allDates.length * tasks.length

  return (
    <div className="progress-view">
      <h2>Progress Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">&#128293;</div>
          <div className="stat-value">{overallStreak}</div>
          <div className="stat-label">Current Streak</div>
          <div className="stat-sub">consecutive days (all tasks)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">&#128197;</div>
          <div className="stat-value">{pct(monthStats.done, monthStats.total)}%</div>
          <div className="stat-label">{MONTHS[today.getMonth()]}</div>
          <div className="stat-sub">{monthStats.done}/{monthStats.total} completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">&#128200;</div>
          <div className="stat-value">{pct(week7Stats.done, week7Stats.total)}%</div>
          <div className="stat-label">Last 7 Days</div>
          <div className="stat-sub">{week7Stats.done}/{week7Stats.total} completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">&#127942;</div>
          <div className="stat-value">{pct(allTimeDone, allTimeTotal)}%</div>
          <div className="stat-label">All Time</div>
          <div className="stat-sub">{allTimeDone}/{allTimeTotal} completed</div>
        </div>
      </div>

      <section className="progress-section">
        <h3>Activity Heatmap</h3>
        <p className="section-desc">Last 16 weeks &mdash; hover cells for details</p>
        <Heatmap completions={completions} tasks={tasks} today={today} />
      </section>

      <section className="progress-section">
        <h3>Per-Task Stats</h3>
        {tasks.length === 0 ? (
          <p className="empty-state">No tasks yet.</p>
        ) : (
          <div className="task-stats-list">
            {tasks.map(task => {
              const streak = getTaskStreak(completions, task, today)
              const taskDone = allDates.filter(ds => completions[ds]?.[task]).length
              const taskTotal = allDates.length
              const rate = pct(taskDone, taskTotal)

              return (
                <div key={task} className="task-stat-row">
                  <div className="task-stat-top">
                    <span className="task-stat-name">{task}</span>
                    <div className="task-stat-badges">
                      <span className="streak-badge">&#128293; {streak} day streak</span>
                      <span className="rate-badge">{rate}% all-time</span>
                    </div>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
