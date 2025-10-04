
/**
 * An animated eye icon component that smoothly transitions between open and closed states.
 */

import type { Variants } from "framer-motion";
import type { HTMLAttributes } from "react";
import { useEffect } from "react";
import { interpolate } from "flubber";
import { animate, MotionValue, useMotionValue, useTransform, useAnimation,motion } from "framer-motion";
import { cn } from "../utils/utils";

export interface EyeOffIconHandle {
   startAnimation: () => void;
   stopAnimation: () => void;
}

interface EyeOffIconProps extends HTMLAttributes<HTMLDivElement> {
   size?: number;
   open: boolean;
}

// Animation variants for the strike-through line
const pathVariants: Variants = {
   normal: {
      pathLength: 1,
      opacity: 1,
      pathOffset: 0,
      transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
   },
   animate: {
      pathLength: 0,
      opacity: 0,
      pathOffset: 1,
      transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
   },
};

export function EyeIcon({
   onMouseEnter,
   onMouseLeave,
   className,
   size = 28,
   open,
   ...props
}: EyeOffIconProps) {
   const controls = useAnimation();

   // Setup morphing animation for the pupil
   const progress = useMotionValue(0);
   const pupilPath = useFlubber(progress, pupilPaths);

   // Animate between open and closed states
   useEffect(() => {
      let animation;
      if (open) {
         controls.start("animate");
         animation = animate(progress, 1, {
            duration: 0.25,
            ease: [0.19, 1, 0.22, 1],
         });
      } else {
         controls.start("normal");
         animation = animate(progress, 0, {
            duration: 0.25,
            ease: [0.19, 1, 0.22, 1],
         });
      }
      return () => animation?.stop();
   }, [open, controls, progress]);

   return (
      <div className={cn(`select-none flex items-center justify-center`, className)} {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
            {/* Animated pupil */}
            <motion.path d={pupilPath} />
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
            {/* Full eye shape for open state */}
            <path
               d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
               className={cn("opacity-0 transition-opacity duration-200", {
                  "opacity-100": open,
               })}
            />
            {/* Animated strike-through line */}
            <motion.path variants={pathVariants} d="m2 2 20 20" animate={controls} />
         </svg>
      </div>
   );
}

// SVG paths for pupil states
const pupilOpenPath =
   "M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z";
const pupilClosedPath = "M14.084 14.158a3 3 0 0 1-4.242-4.242";

const pupilPaths = [pupilClosedPath, pupilOpenPath];

EyeIcon.displayName = "EyeIcon";

// Helper function to get array indices for Flubber interpolation
const getIndex = (_: string, index: number) => index;

/**
 * Custom hook that uses Flubber to smoothly interpolate between SVG paths.
 * Creates a fluid morphing animation between the closed and open pupil states.
 */
function useFlubber(progress: MotionValue<number>, paths: string[]) {
   return useTransform(progress, paths.map(getIndex), paths, {
      mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 0.1 }),
   });
}
