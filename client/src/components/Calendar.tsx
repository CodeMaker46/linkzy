import React, { useState } from 'react'
import { addDays, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameMonth, isSameDay, addWeeks, subWeeks, compareAsc } from 'date-fns'
import Button from './ui/button'
import { useAppStore } from '../store/useAppStore'

// Event type
interface CalendarEvent {
  id: string
  title: string
  date: Date
}

const VIEWS = ['month', 'week', 'day'] as const

type ViewType = typeof VIEWS[number]

function getDaysInMonthGrid(date: Date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 })
  const days = []
  let curr = start
  while (curr <= end) {
    days.push(curr)
    curr = addDays(curr, 1)
  }
  return days
}

function getDaysInWeek(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
}

export default function Calendar() {
  const [view, setView] = useState<ViewType>('month')
  const [current, setCurrent] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalDate, setModalDate] = useState<Date | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const theme = useAppStore(s => s.theme)

  // Navigation handlers
  const goToday = () => setCurrent(new Date())
  const goPrev = () => {
    if (view === 'month') setCurrent(subMonths(current, 1))
    else if (view === 'week') setCurrent(subWeeks(current, 1))
    else setCurrent(addDays(current, -1))
  }
  const goNext = () => {
    if (view === 'month') setCurrent(addMonths(current, 1))
    else if (view === 'week') setCurrent(addWeeks(current, 1))
    else setCurrent(addDays(current, 1))
  }

  // Event modal handlers
  const openModal = (date: Date, event?: CalendarEvent) => {
    setModalDate(date)
    setShowModal(true)
    if (event) {
      setEditingEvent(event)
      setEventTitle(event.title)
    } else {
      setEditingEvent(null)
      setEventTitle('')
    }
  }
  const closeModal = () => {
    setShowModal(false)
    setModalDate(null)
    setEventTitle('')
    setEditingEvent(null)
  }
  const saveEvent = () => {
    if (!modalDate || !eventTitle.trim()) return
    if (editingEvent) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? { ...ev, title: eventTitle, date: modalDate } : ev))
    } else {
      setEvents([...events, { id: Date.now() + '', title: eventTitle, date: modalDate }])
    }
    closeModal()
  }
  const deleteEvent = () => {
    if (editingEvent) {
      setEvents(events.filter(ev => ev.id !== editingEvent.id))
      closeModal()
    }
  }

  // Render grid
  let days: Date[] = []
  if (view === 'month') days = getDaysInMonthGrid(current)
  else if (view === 'week') days = getDaysInWeek(current)
  else days = [current]

  // Header labels
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Upcoming events (after today, sorted)
  const now = new Date()
  const upcoming = events
    .filter(ev => compareAsc(ev.date, now) >= 0)
    .sort((a, b) => compareAsc(a.date, b.date))
    .slice(0, 5)

  return (
    <div className="rounded-2xl bg-[rgb(var(--card))] p-4 shadow-xl transition-colors">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={goPrev}>&lt;</Button>
          <Button size="sm" variant="ghost" onClick={goToday}>Today</Button>
          <Button size="sm" variant="ghost" onClick={goNext}>&gt;</Button>
        </div>
        <div className="font-semibold text-lg">
          {view === 'month' && format(current, 'MMMM yyyy')}
          {view === 'week' && `${format(startOfWeek(current), 'MMM d')} - ${format(endOfWeek(current), 'MMM d, yyyy')}`}
          {view === 'day' && format(current, 'MMMM d, yyyy')}
        </div>
        <div className="flex gap-2">
          {VIEWS.map(v => (
            <Button key={v} size="sm" variant={view === v ? 'default' : 'ghost'} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
          ))}
        </div>
      </div>
      {/* Calendar grid */}
      <div className={view === 'month' ? 'grid grid-cols-7 gap-1 mb-6' : 'flex gap-2 mb-6'}>
        {view !== 'day' && weekDays.map((d, i) => (
          <div key={i} className="text-xs font-semibold text-center py-1 opacity-70 select-none">
            {d}
          </div>
        ))}
        {days.map((date, i) => {
          const dayEvents = events.filter(e => isSameDay(e.date, date))
          const isCurrentMonth = isSameMonth(date, current)
          const isToday = isSameDay(date, new Date())
          return (
            <div
              key={i}
              className={
                'relative rounded-xl p-2 min-h-[70px] flex flex-col gap-1 cursor-pointer transition-all ' +
                (isCurrentMonth ? 'bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10' : 'bg-white/5 dark:bg-white/10 opacity-60') +
                (isToday ? ' border-2 border-pink-500' : '')
              }
              onClick={e => { if ((e.target as HTMLElement).tagName === 'DIV') openModal(date) }}
            >
              <div className="text-xs font-semibold mb-1 opacity-80 text-center">
                {format(date, 'd')}
              </div>
              <div className="flex flex-col gap-1">
                {dayEvents.map(ev => (
                  <div key={ev.id} className="truncate rounded bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 text-xs font-medium shadow flex items-center justify-between gap-2">
                    <span className="flex-1 truncate" onClick={e => { e.stopPropagation(); openModal(date, ev) }}>{ev.title}</span>
                    <Button size="sm" variant="ghost" className="px-1 py-0.5 text-xs" onClick={e => { e.stopPropagation(); openModal(date, ev) }}>Edit</Button>
                    <Button size="sm" variant="ghost" className="px-1 py-0.5 text-xs text-red-400" onClick={e => { e.stopPropagation(); setEditingEvent(ev); setModalDate(date); setShowModal(true); setEventTitle(ev.title); }}>Del</Button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      {/* Upcoming events */}
      <div className="mt-2">
        <h4 className="font-semibold mb-2 text-sm opacity-80">Upcoming Events</h4>
        {upcoming.length === 0 && <div className="text-xs opacity-60">No upcoming events</div>}
        <ul className="space-y-1">
          {upcoming.map(ev => (
            <li key={ev.id} className="flex items-center gap-2 rounded-xl bg-white/10 dark:bg-white/5 px-3 py-2">
              <span className="font-medium text-xs flex-1 truncate">{ev.title}</span>
              <span className="text-xs opacity-70">{format(ev.date, 'MMM d, yyyy')}</span>
              <Button size="sm" variant="ghost" className="px-1 py-0.5 text-xs" onClick={() => openModal(ev.date, ev)}>Edit</Button>
              <Button size="sm" variant="ghost" className="px-1 py-0.5 text-xs text-red-400" onClick={() => { setEditingEvent(ev); setModalDate(ev.date); setShowModal(true); setEventTitle(ev.title); }}>Del</Button>
            </li>
          ))}
        </ul>
      </div>
      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={
            'card w-full max-w-xs shadow-xl p-6 transition-colors flex flex-col gap-2 ' +
            (theme === 'dark' ? 'bg-[rgb(var(--card))] text-[rgb(var(--fg))]' : 'bg-white text-[rgb(var(--fg))]')
          }>
            <h3 className="font-semibold mb-2">{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
            <div className="mb-2 text-sm opacity-70">{modalDate && format(modalDate, 'PPP')}</div>
            <input
              className="input w-full mb-2"
              placeholder="Event title"
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-2">
              {editingEvent && <Button size="sm" variant="ghost" className="text-red-500" onClick={deleteEvent}>Delete</Button>}
              <Button size="sm" variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button size="sm" onClick={saveEvent} disabled={!eventTitle.trim()}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

