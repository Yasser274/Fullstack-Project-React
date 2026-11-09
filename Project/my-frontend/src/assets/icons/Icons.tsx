// .All the UI icons of the site in one place
// * every icon uses the same base (IconBase) so they all have the same grid (24x24), line width and rounded ends
// * the color comes from currentColor, meaning the icon takes the text color of whatever it's inside of
//   so i never set colors here, i set "color: var(--color-...)" in the css and the icon follows the theme
// * size is a prop (default 20) so the same icon works in a button, a label or as a big empty state picture
// (replaced the png icons and the traced multi color svgs, pngs can't change color with the theme and get blurry when scaled)

import { useId, type ReactNode, type SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
   size?: number | string;
   title?: string; // if given, screen readers read it (otherwise the icon is decorative and hidden from them)
}

const IconBase = ({
   size = 20,
   title,
   className,
   strokeWidth = 2,
   children,
   ...props
}: IconProps & { children: ReactNode }) => {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 24 24"
         width={size}
         height={size}
         fill="none"
         stroke="currentColor"
         strokeWidth={strokeWidth}
         strokeLinecap="round"
         strokeLinejoin="round"
         // "icon" is the global class in index.css that every icon shares
         className={className ? `icon ${className}` : "icon"}
         aria-hidden={title ? undefined : true}
         role={title ? "img" : undefined}
         focusable="false"
         {...props}
      >
         {title ? <title>{title}</title> : null}
         {children}
      </svg>
   );
};

// * Navigation / actions
export const MenuIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
   </IconBase>
);

export const CloseIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
   </IconBase>
);

export const SearchIcon = (props: IconProps) => (
   <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
   </IconBase>
);

export const ChevronDownIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
   </IconBase>
);

export const ChevronLeftIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="m15 18-6-6 6-6" />
   </IconBase>
);

export const ChevronRightIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
   </IconBase>
);

export const CheckIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M20 6 9 17l-5-5" />
   </IconBase>
);

export const SortIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16" />
   </IconBase>
);

export const TagIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
   </IconBase>
);

export const PencilIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
      <path d="m15 5 4 4" />
   </IconBase>
);

export const CameraIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
      <circle cx="12" cy="13" r="3" />
   </IconBase>
);

export const LogInIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
   </IconBase>
);

export const LogOutIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
   </IconBase>
);

// * Theme
export const SunIcon = (props: IconProps) => (
   <IconBase {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
   </IconBase>
);

export const MoonIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
   </IconBase>
);

// * People / account
export const UserIcon = (props: IconProps) => (
   <IconBase {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
   </IconBase>
);

export const LockIcon = (props: IconProps) => (
   <IconBase {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
   </IconBase>
);

export const MailIcon = (props: IconProps) => (
   <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
   </IconBase>
);

export const SlidersIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
   </IconBase>
);

export const HistoryIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
   </IconBase>
);

// * Content
export const MessageIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
   </IconBase>
);

export const CalendarIcon = (props: IconProps) => (
   <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
   </IconBase>
);

export const TrendingIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
   </IconBase>
);

export const UtensilsIcon = (props: IconProps) => (
   <IconBase {...props}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
   </IconBase>
);

export const AlertIcon = (props: IconProps) => (
   <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
   </IconBase>
);

// .Star (one component for all the rating stars)
// variant "full" = filled, "empty" = outline, "half" = left half filled (flipped in arabic with the .starHalfRtl css)
// it replaced Star.tsx, StarFilled.tsx and HalfEmptyStar.tsx, the color comes from --color-star / --color-star-empty in the css
const STAR_PATH = "M12 2.5l2.95 5.98 6.6.96-4.78 4.65 1.13 6.57L12 17.56l-5.9 3.1 1.13-6.57-4.78-4.65 6.6-.96z";

export const StarIcon = ({ variant = "full", ...props }: IconProps & { variant?: "full" | "half" | "empty" }) => {
   // unique id for the half star clip, if two half stars used the same id they would mix up
   const clipId = useId();

   return (
      <IconBase strokeWidth={1.6} {...props}>
         {variant === "half" ? (
            <>
               <defs>
                  <clipPath id={clipId}>
                     <rect x="0" y="0" width="12" height="24" />
                  </clipPath>
               </defs>
               {/* filled left half on top of the outline */}
               <path d={STAR_PATH} fill="currentColor" clipPath={`url(#${clipId})`} stroke="none" />
               <path d={STAR_PATH} />
            </>
         ) : (
            <path d={STAR_PATH} fill={variant === "full" ? "currentColor" : "none"} />
         )}
      </IconBase>
   );
};
