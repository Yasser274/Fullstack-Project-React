import styles from "../components/styles/Home.module.css";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "../assets/icons/Icons";

interface PaginationProps {
   totalPagesNumber: number;
   changePage: (page: number) => void;
   currentPage: number;
}

// how many page numbers to show on each side of the current page before it turns into "..."
const SIBLINGS = 1;

const Pagination = ({ totalPagesNumber, changePage, currentPage }: PaginationProps) => {
   const { t } = useTranslation();

   //  Don't render pagination buttons if there is only one page
   if (!totalPagesNumber || totalPagesNumber <= 1) {
      return null;
   }

   // create an array of what to show (numbers and "..." gaps) instead of ALL the pages
   // so with 20 pages on page 7 it looks like: 1 ... 6 7 8 ... 20 (before it rendered 20 buttons and overflowed on mobile)
   const pageNumbers: (number | "gap")[] = [];
   for (let i = 1; i <= totalPagesNumber; i++) {
      const isEdge = i === 1 || i === totalPagesNumber; // always show first and last page
      const isNearCurrent = Math.abs(i - currentPage) <= SIBLINGS;
      if (isEdge || isNearCurrent) {
         pageNumbers.push(i);
      } else if (pageNumbers[pageNumbers.length - 1] !== "gap") {
         // only push one "..." for a group of hidden pages
         pageNumbers.push("gap");
      }
   }

   return (
      <nav aria-label="Page navigation">
         <ul className={styles.paginationCon}>
            <li className={styles.pageItem}>
               <button
                  onClick={() => changePage(currentPage - 1)}
                  className={`${styles.pageButton} ${styles.pageArrow}`}
                  disabled={currentPage <= 1}
                  aria-label={t("prevPage")}
               >
                  {/* flips in arabic with CSS so it always points "back" */}
                  <ChevronLeftIcon className={styles.pageArrowIcon} size={18} />
               </button>
            </li>
            {pageNumbers.map((number, index) =>
               number === "gap" ? (
                  <li key={`gap-${index}`} className={styles.pageGap}>
                     …
                  </li>
               ) : (
                  <li key={number} className={styles.pageItem}>
                     <button
                        onClick={() => changePage(number)}
                        className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ""}`} // if currentPage being passed in equals this current number apply active style if not don't apply anything
                        aria-current={currentPage === number ? "page" : undefined}
                     >
                        {number}
                     </button>
                  </li>
               )
            )}
            <li className={styles.pageItem}>
               <button
                  onClick={() => changePage(currentPage + 1)}
                  className={`${styles.pageButton} ${styles.pageArrow}`}
                  disabled={currentPage >= totalPagesNumber}
                  aria-label={t("nextPage")}
               >
                  <ChevronRightIcon className={styles.pageArrowIcon} size={18} />
               </button>
            </li>
         </ul>
      </nav>
   );
};

export default Pagination;
