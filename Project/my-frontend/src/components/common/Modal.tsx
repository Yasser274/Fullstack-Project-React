import type React from "react";
import styles from "./common.module.css";
import { useEffect } from "react";
import ReactDOM from "react-dom";
import CloseIcon from "../../assets/icons/CloseIcon";

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
   if (!isOpen) {
      // if it's false don't return anything
      return null;
   }
   //  if isOpen true go on and return the stuff below
   useEffect(() => {
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
   }, [onClose]);

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
         <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* The onClick with e.stopPropagation() on the content area acts as a shield, catching any clicks that happen inside it and preventing them from bubbling up and accidentally triggering the "close" handler. */}
            <button
               className={styles.modalCloseBtn}
               onClick={() => {
                  onClose();
                  setResetTitle?.(0);
               }}
            >
               <CloseIcon className={styles.modalCloseIconBtn}></CloseIcon>
            </button>
            <title>{title}</title> {/* This is for the tab title */}
            <div className={styles.modalTitle}>
               <h3>{title}</h3>
            </div>
            {error === null ? null : (
               <div
                  style={{
                     textAlign: "center",
                     color: "rgba(255, 43, 43, 1)",
                     fontSize: "1.1rem",
                     fontWeight: "600",
                  }}
               >
                  <span style={{ textShadow: "0 0 7px rgba(0, 0, 0, 0.88)" }}>{error}</span>
               </div>
            )}
            <div>{children}</div>
         </div>
      </div>,
      document.getElementById("modal-root")! // the ! at the end tells the TS compiler that i know you think that this is null but i promise it will never be (This effectively changes the type from HTMLElement | null to just HTMLElement. You're making a guarantee that the element exists.)
   );
};

export default Modal;
