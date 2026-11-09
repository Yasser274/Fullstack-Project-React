import { useEffect } from "react";

const useBodyScrollLock = (isLocked: boolean) => {
   useEffect(() => {
      // only touch the body when locking, otherwise a component that mounted while something else locked the page
      // would save "hidden" as the original and put it back later (page stuck without scroll)
      if (!isLocked) return;

      // Get the original body style so we can restore it
      const originalStyle = document.body.style.overflow;

      // if true disable scrolling
      document.body.style.overflow = "hidden";

      return () => {
         // This runs when isLocked becomes false OR when the component unmounts
         document.body.style.overflow = originalStyle;
      };
   }, [isLocked]);
};

export default useBodyScrollLock;
