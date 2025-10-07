import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function HeroBanner({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-3xl border border-white/10"
      style={{
        background:
          'linear-gradient(120deg, rgba(236,72,153,0.25), rgba(168,85,247,0.25))',
      }}
    >
      <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/20 blur-2xl" />
      <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-purple-600/20 blur-2xl" />
      <div className="relative p-6 md:p-8">
        <div className="flex items-start gap-3">
          {icon && <div className="mt-1 text-pink-500">{icon}</div>}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm md:text-base opacity-85 mt-1 max-w-2xl">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

