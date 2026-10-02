import React from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

/*
  Adaptado de Motion Primitives (TextEffect, preset "slide", por palabra).
  Cambios para el Design DNA: entrada corta hacia arriba con resorte de
  encastre, sin blur, y con prefers-reduced-motion se muestra estático.
*/

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 420, damping: 22 } },
  exit: { y: -6, transition: { duration: 0.12 } },
}

type Tag = "h1" | "h2" | "h3" | "p" | "span"

export interface TextEffectProps {
  children: string
  as?: Tag
  className?: string
  /** clave para reiniciar la animación cuando cambia el texto */
  id?: string
}

export function TextEffect({ children, as = "p", className, id }: TextEffectProps) {
  const reduce = useReducedMotion()
  const Tag = as

  if (reduce) {
    return <Tag className={className}>{children}</Tag>
  }

  const MotionTag = motion[as] as typeof motion.p
  const words = children.split(/(\s+)/)

  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionTag
        key={id ?? children}
        className={className}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={container}
      >
        <span className="sr-only">{children}</span>
        {words.map((word, index) =>
          /^\s+$/.test(word) ? (
            <React.Fragment key={index}>{word}</React.Fragment>
          ) : (
            <motion.span key={index} aria-hidden="true" variants={item} className={cn("inline-block whitespace-pre")}>
              {word}
            </motion.span>
          )
        )}
      </MotionTag>
    </AnimatePresence>
  )
}
