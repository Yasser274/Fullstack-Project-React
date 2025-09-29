import React, { useEffect, useRef, useState, type SetStateAction, type Dispatch } from "react";

import styles from "../components/styles/Home.module.css";
import { useTranslation } from "react-i18next";
import { type tagsPropsListAPI } from "../pages/HomePage";
import SearchBar from "./common/SearchBar";

interface tagsProps {
   tagsList: tagsPropsListAPI[] | null;
   funResetPage1?: () => void;
   selectedTagsList: number[];
   selectTagsFun: Dispatch<SetStateAction<number[]>>;
}

const TagsFilter = ({ tagsList, funResetPage1, selectedTagsList, selectTagsFun }: tagsProps) => {
   const { t } = useTranslation();

   const containerRef = useRef<HTMLDivElement>(null);

   const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

   const [tagSearch, setTagSearch] = useState<string | null>(null);

   // will use default tag list (full tag list)
   let filteredTag: tagsPropsListAPI[] | undefined | null = tagsList;

   if (tagSearch !== null) {
      // * when user inputted inside search and looks for certain tag
      filteredTag = tagsList?.filter((tag) => {
         // if tagname includes whats inside tagSearch that inputted by user return it (meaning just filter out the ones that doesn't include)
         return tag.tagname.includes(tagSearch);
      });
   }

   console.log(tagSearch);

   const handleOpeningMenu = () => {
      setMenuIsOpen((prev) => !prev);
   };

   // this effect when user clicks outside of tags select div anywhere on the page it will close the menu
   useEffect(() => {
      const handleClickOutside = () => {
         // when user clicks anywhere but the containerRef(tag select menu)
         if (containerRef.current && !containerRef.current.contains(event?.target as Node)) {
            setMenuIsOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   const addTag = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      // Stop the click from bubbling up to the parent containers. (so it doesn't close down the menu after clicking on any tag)
      // Without this, clicking a button would also trigger handleClickOutside
      e.stopPropagation();
      const value = Number(e.currentTarget.value);
      const toggleTag = selectedTagsList.includes(value);
      if (toggleTag) {
         // since it's optional because it might be undefined meaning parent didn't pass down a function
         funResetPage1?.();
         // if it already exist filter it out of the array
         return selectTagsFun((prev) =>
            prev.filter((tag) => {
               return tag !== value; // when it equals a value in the array it will discard it (when it returns false(meaning equals something))
            })
         );
      } else {
         funResetPage1?.();
         // if it doesn't exist add the tag value inside the array state
         return selectTagsFun((prev) => [...prev, value]);
      }
   };
   const removeTag = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, tagIdToRemove: number) => {
      e.stopPropagation(); // Prevent the menu from opening/closing
      funResetPage1?.();
      selectTagsFun((prev) => prev.filter((tagId) => tagId !== tagIdToRemove)); // when it doesn't equal the tagIdToRemove keep it in the array otherwise remove it
   };

   return (
      <div className={styles.tagsFilterContainer} ref={containerRef}>
         <div onClick={handleOpeningMenu} className={styles.tagsControl}>
            <div className={styles.selectedTagWrapper}>
               {/* if no tags are selected */}
               {selectedTagsList.length === 0 ? (
                  <span className={styles.tagPlaceHolder}>{t("selectTag")}</span>
               ) : null}

               {/* map(create new array from values inside array) over the array  */}
               {selectedTagsList.map((selectedTagId) => {
                  // and compare selectedTagId with tagsList object tagId since it has the tagname
                  const matchingTag = tagsList?.find((tag) => {
                     // if it finds selectedTagId equals another tagId inside tagsList it will be true and return the element(properties of that certain element object)
                     return tag.id === selectedTagId;
                  });
                  // if it found a tag from the pervious .find return html element that has the tagname
                  if (matchingTag) {
                     return (
                        <span key={selectedTagId} className={styles.displaySelectedTag}>
                           {matchingTag.tagname.charAt(0).toUpperCase() + matchingTag.tagname.slice(1)}
                           <span
                              className={styles.removeTagIcon}
                              onClick={(e) => removeTag(e, selectedTagId)}
                           >
                              &times;
                           </span>
                        </span>
                     );
                  }
                  return null;
               })}
            </div>
            {/* A visual chevron to indicate open/closed state */}
            <span className={`${styles.chevron} ${menuIsOpen ? styles.chevronOpen : ""}`}>▼</span>
         </div>
         {/* The dropdown menu appears only when `menuIsOpen` is true */}
         {menuIsOpen ? (
            <div className={styles.tagsDropdown}>
               <SearchBar
                  placeholderText={t("searchTagPlaceholder")}
                  onChangeText={setTagSearch}
                  searchBarText={tagSearch}
                  searchBarIcon={styles.searchBarIconTag}
                  classNameCon={styles.searchBarDivConTag}
                  classNameStyle={styles.searchBarS}
               ></SearchBar>
               {filteredTag?.map((tag) => {
                  const isSelected = selectedTagsList.includes(tag.id);
                  return (
                     <button
                        value={tag.id}
                        key={tag.id}
                        onClick={addTag}
                        // Use a more descriptive class name for the active state
                        className={`${styles.tagBtn} ${isSelected ? styles.tagBtnActive : ""}`}
                     >
                        {tag.tagname.charAt(0).toUpperCase() + tag.tagname.slice(1)}
                        {isSelected && <span className={styles.checkMark}>✓</span>}
                     </button>
                  );
               })}
            </div>
         ) : null}
      </div>
   );
};

export default TagsFilter;
