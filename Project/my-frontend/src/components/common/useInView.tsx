import { useState, useEffect, useRef } from "react";

// <T> → This makes the function generic, meaning it can work with any type of HTML element.
// extends HTMLElement → This restricts T so it must be an HTML element.
// = HTMLElement → This is the default type if you don’t provide one.
// * the T is a placeholder for the element type

interface InViewOptions extends IntersectionObserverInit {
   triggerOnce?: boolean;
}

const useInView = <T extends HTMLElement = HTMLElement>(
   options?: InViewOptions
): [React.RefObject<T | null>, boolean] => {
   const [isInView, setIsInView] = useState(false);
   const ref = useRef<T>(null);

   useEffect(() => {
      // Destructure triggerOnce from the options for easier access
      const { triggerOnce = false, ...observerOptions } = options || {};

      // Ensure we have a ref to observe
      const currentRef = ref.current;
      if (!currentRef) return;

      // * a browser API that checks when an element enters or leaves the viewport.
      // You’ve created the observer
      const observer = new IntersectionObserver(([entry]) => {
         // If the element is intersecting the viewport
         if (entry.isIntersecting) {
            setIsInView(true); // Set state to true

            // If triggerOnce is enabled, we can stop observing now that it has been seen.
            if (triggerOnce) {
               observer.unobserve(currentRef);
            }
         } else {
            // If it's not a one-time trigger, we should update the state
            // when the element leaves the viewport as well.
            if (!triggerOnce) {
               setIsInView(false);
            }
         }
      }, observerOptions);

      // Start observing the element
      observer.observe(currentRef);

      return () => {
         observer.unobserve(currentRef);
      };
   }, [ref, options]); // Re-run effect if ref or options change

   return [ref, isInView];
};

export default useInView;
