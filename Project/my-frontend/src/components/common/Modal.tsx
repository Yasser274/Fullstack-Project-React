import type React from "react";
import styles from "./common.module.css";
import { useEffect } from "react";
import ReactDOM from "react-dom";
import { CloseIcon } from "../../assets/icons/Icons";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   children: React.ReactNode; // Represents all of the things React can render. it can take in anything in it and many things
   title: string;
   setResetTitle?: (val: 0 | 1) => void;
   error?: string | null;
}

const Modal = ({ isOpen, onClose, children, title, setResetTitle, error }: ModalProps) => {
   // destruct(get values(the types)) inside the interface directly

   // ! hooks have to run on EVERY render in the same order, so they must be above the "if (!isOpen) return null"
   // before this the useEffect was below the return so React threw "Rendered more hooks than during the previous render" when the modal opened
   useEffect(() => {
      // only listen for Escape while the modal is actually open
      if (!isOpen) return;

      const handleEscape = (event: KeyboardEvent) => {
         if (event.key === "Escape") {
            onClose();
            setResetTitle?.(0); // since setResetTitle is optional this says if it exists in the parent(being passed down to this component) set it to 0
         }
      };
      document.addEventListener("keydown", handleEscape);

      return () => {
         // Cleanup the event listener on component unmount
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen, onClose, setResetTitle]);

   // stop the page behind the modal from scrolling while it's open
   useBodyScrollLock(isOpen);

   if (!isOpen) {
      // if it's false don't return anything
      return null;
   }
   //  if isOpen true go on and return the stuff below

   // Portal to render the modal at the root of the document
   // This avoids z-index issues.
   return ReactDOM.createPortal(
      <div
         className={styles.modalCon}
         onClick={() => {
            onClose();
            setResetTitle?.(0);
         }}
      >
         {/* this will be the dark background(overlay) and when user clicks it will close the entire modal */}
         <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
         >
            {/* The onClick with e.stopPropagation() on the content area acts as a shield, catching any clicks that happen inside it and preventing them from bubbling up and accidentally triggering the "close" handler. */}
            <button
               className={styles.modalCloseBtn}
               aria-label="Close"
               onClick={() => {
                  onClose();
                  setResetTitle?.(0);
               }}
            >
               <CloseIcon className={styles.modalCloseIconBtn} size={18} />
            </button>
            <title>{title}</title> {/* This is for the tab title */}
            <div className={styles.modalTitle}>
               <h3>{title}</h3>
            </div>
            {error ? <div className={styles.modalErrorBanner}>{error}</div> : null}
            {/* the body scrolls by itself so a long reviews list doesn't go past the screen */}
            <div className={styles.modalBody}>{children}</div>
         </div>
      </div>,
      document.getElementById("modal-root")! // the ! at the end tells the TS compiler that i know you think that this is null but i promise it will never be (This effectively changes the type from HTMLElement | null to just HTMLElement. You're making a guarantee that the element exists.)
   );
};

export default Modal;
