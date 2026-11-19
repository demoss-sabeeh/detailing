import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Fade-and-rise when the element scrolls into view. */
export function Reveal({ children, delay = 0, className = "", as = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "figure" }) {
  const reduce = useReducedMotion();
  const C = motion[as];
  return (
    <C className={className} initial={reduce ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay, ease: EASE }}>
      {children}
    </C>
  );
}

/** Word-by-word masked headline reveal. */
export function SplitHeadline({ text, className = "", delay = 0, as = "h2" }: { text: string; className?: string; delay?: number; as?: "h1" | "h2" }) {
  const reduce = useReducedMotion();
  const H = as;
  return (
    <H className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span className="inline-block" initial={reduce ? false : { y: "105%" }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: delay + i * 0.06, ease: EASE }}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </H>
  );
}

/** Image that unmasks upward and drifts slightly with scroll. */
export function ParallaxImage({ src, alt, className = "", imgClassName = "", strength = 8 }: { src: string; alt: string; className?: string; imgClassName?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <motion.div ref={ref} className={`relative overflow-hidden bg-navy ${className}`} initial={reduce ? false : { clipPath: "inset(18% 0 0 0)" }} whileInView={{ clipPath: "inset(0% 0 0 0)" }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 1.2, ease: EASE }}>
      <motion.img src={src} alt={alt} loading="lazy" width={1200} height={912} style={reduce ? undefined : { y, scale: 1 + strength / 50 }} className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`} />
    </motion.div>
  );
}
