import { useState, useRef } from 'react'

export default function TaskManager({ tasks, onAdd, onRemove }) {
  const [newTask, setNewTask] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const timeoutRef = useRef(null)
  const inputRef = useRef(null)

  const handleAdd = (e) => {
    e.preventDefault()
    const name = newTask.trim()
    if (!name) return
    if (tasks.includes(name)) {
      inputRef.current?.select()
      return
    }
    onAdd(name)
    setNewTask('')
  }

  const handleRemove = (task) => {
    if (confirmDelete === task) {
      clearTimeout(timeoutRef.current)
      setConfirmDelete(null)
      onRemove(task)
    } else {
      clearTimeout(timeoutRef.current)
      setConfirmDelete(task)
      timeoutRef.current = setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const duplicate = newTask.trim() && tasks.includes(newTask.trim())

  return (
    <div className="task-manager">
      <h2>Manage Tasks</h2>
      <p className="section-desc">
        Tasks appear on every day in the calendar. Removing a task preserves its historical data.
      </p>

      <form className="add-task-form" onSubmit={handleAdd}>
        <input
          ref={inputRef}
          type="text"
          className={`task-input${duplicate ? ' input-error' : ''}`}
          placeholder="New task name..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          maxLength={60}
          aria-label="New task name"
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!newTask.trim() || duplicate}
        >
          Add Task
        </button>
      </form>
      {duplicate && (
        <p className="input-error-msg">A task with that name already exists.</p>
      )}

      <div className="task-manage-list">
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks yet. Add one above.</div>
        ) : (
          tasks.map(task => {
            const isPending = confirmDelete === task
            return (
              <div key={task} className="task-manage-row">
                <span className="task-manage-name">
                  <span className="task-bullet" />
                  {task}
                </span>
                <button
                  className={`btn-remove${isPending ? ' confirm' : ''}`}
                  onClick={() => handleRemove(task)}
                >
                  {isPending ? 'Confirm remove' : 'Remove'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
