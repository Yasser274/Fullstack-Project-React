import { useEffect } from "react";

const useBodyScrollLock = (isLocked:boolean) => {
   useEffect(() => {
      // Get the original body style so we can restore it
      const originalStyle = window.getComputedStyle(document.body).overflow;

      // if true disable scrolling
      if (isLocked) {
         document.body.style.overflow = "hidden";

      }

      return () => {
         // This runs when isLocked becomes false OR when the component unmounts
         document.body.style.overflow = originalStyle;
      };
   }, [isLocked]);
};

export default useBodyScrollLock;
