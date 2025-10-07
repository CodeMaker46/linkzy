import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function StatCard({
  icon,
  title,
  value,
  subtitle,
  children,
  delay = 0,
}: {
  icon?: ReactNode
  title: string
  value?: ReactNode
  subtitle?: string
  children?: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="card card-hover p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-pink-500">{icon}</div>}
          <h3 className="font-semibold">{title}</h3>
        </div>
        {typeof value !== 'undefined' && (
          <div className="text-xl font-bold">{value}</div>
        )}
      </div>
      {subtitle && <div className="text-xs opacity-70 mb-2">{subtitle}</div>}
      {children}
    </motion.div>
  )
}

