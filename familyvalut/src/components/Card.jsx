import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  className = '',
  hoverable = true,
  onClick,
  ...props
}) => {
  const cardClasses = `bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden ${hoverable ? 'cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : ''} ${className}`

  const CardContent = () => (
    <div className="p-4 sm:p-5 md:p-6">
      {(title || subtitle || Icon) && (
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          {Icon && (
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shrink-0">
              <Icon size={20} className="sm:size-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">{title}</h3>}
            {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 line-clamp-2">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="break-words">{children}</div>
    </div>
  )

  if (onClick) {
    return (
      <motion.div
        whileHover={hoverable ? { y: -4 } : {}}
        className={cardClasses}
        onClick={onClick}
        {...props}
      >
        <CardContent />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cardClasses}
      {...props}
    >
      <CardContent />
    </motion.div>
  )
}

export default Card