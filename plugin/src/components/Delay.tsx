import {motion} from 'framer-motion'
import {ReactElement, ReactNode} from 'react'

export function Delay({
  children,
  ms = 1000,
  durationMs = 250,
}: {
  children?: ReactNode
  ms?: number
  durationMs?: number
}): ReactElement {
  return (
    <motion.div
      initial={{opacity: 0, scale: 0.75}}
      animate={{opacity: 1, scale: 1}}
      transition={{
        delay: ms / 1000,
        duration: durationMs / 1000,
      }}
    >
      {children}
    </motion.div>
  )
}
