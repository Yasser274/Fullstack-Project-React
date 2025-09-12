import styles from "../components/styles/Home.module.css";

interface PaginationProps {
   totalPagesNumber: number;
   changePage: (page: number) => void;
   currentPage: number;
}

const Pagination = ({ totalPagesNumber, changePage, currentPage }: PaginationProps) => {
   // create an array from the length of totalPagesNumber (so i can map over the length and create buttons for all pages)
   const pageNumbers: number[] = [];
   for (let i = 0; i < totalPagesNumber; i++) {
      pageNumbers.push(i + 1);
   }

   //  Don't render pagination buttons if there is only one page
   if (pageNumbers.length <= 1) {
      return null;
   }


   return (
      <nav aria-label="Page navigation">
         <ul className={styles.paginationCon}>
            {pageNumbers.map((number) => (
               <li key={number} className={styles.pageItem}>
                  <button
                     onClick={() => changePage(number)}
                     className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ""}`} // if currentPage being passed in equals this current number apply active style if not don't apply anything
                  >
                     {number}
                  </button>
               </li>
            ))}
         </ul>
      </nav>
   );
};

export default Pagination;
