import { useEffect, useState } from "react";

const useAnimateOnce = () => {
   // This state will hold the specific CSS class i need to apply.
   const [animationClass, setAnimationClass] = useState("");

   // Key for the session storage flag.
   const VISITED_KEY = "appHasBeenVisited";

   useEffect(() => {
      const hasVisitedBefore = sessionStorage.getItem(VISITED_KEY);

      // This is the modern browser API to check navigation type.
      // It returns an array, but i only care about the first (and only) entry.
      const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];

      const lastNavigation = navEntries.length > 0 ? navEntries[navEntries.length - 1] : null;
      const navType = lastNavigation ? lastNavigation.type : "navigate";

      let newClass = "";
      if (!hasVisitedBefore) {
         // A first visit in this session
         newClass = "animateIn";
         sessionStorage.setItem(VISITED_KEY, "true");
      } else if (navType === "reload") {
         // this is a page refresh i want the animation to animate again
         newClass = "animateIn";
      } else {
         // This is a client-side navigation (not a refresh or first visit).
         // This happens when you click a <Link> in your app.
         newClass = "visibleInstantly";
      }

      setAnimationClass(newClass);
   }, []);
   // 2. RETURN the value so other components can use it
   return animationClass;
};

export default useAnimateOnce;
