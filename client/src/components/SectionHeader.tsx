import type { ReactNode } from 'react'

export default function SectionHeader({ icon, title, subtitle }: { icon?: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      {icon && <div className="mt-0.5 text-pink-500">{icon}</div>}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm opacity-80 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

