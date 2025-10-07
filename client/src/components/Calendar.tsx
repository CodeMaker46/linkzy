import { addDays, format } from 'date-fns'

export default function Calendar() {
  const start = new Date()
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i))
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, i) => (
        <div key={i} className="rounded-xl bg-white/5 p-3 text-center">
          <div className="text-sm opacity-70">{format(d, 'EEE')}</div>
          <div className="text-lg font-semibold">{format(d, 'd')}</div>
        </div>
      ))}
    </div>
  )
}

