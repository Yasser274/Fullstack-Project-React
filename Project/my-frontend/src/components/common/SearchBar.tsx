import type React from "react";
import searchPng from "../../../src/assets/icons/search.png";

interface searchBarProps {
   placeholderText: string;
   searchBarIcon?: string;
   onChangeText: (searchBarText: string) => void;
   searchBarText: string | null;
   classNameStyle?: string;
   classNameCon?: string;
}

const SearchBar = ({
   placeholderText,
   onChangeText,
   searchBarIcon,
   searchBarText,
   classNameStyle,
   classNameCon,
}: searchBarProps) => {
   const updateTextValueState = (e: string) => {
      onChangeText(e);
   };

   return (
      <div className={classNameCon}>
         <img src={searchPng} alt="Search icon" className={searchBarIcon} />
         <input
            className={classNameStyle}
            type="text"
            placeholder={placeholderText}
            onChange={(e) => updateTextValueState(e.target.value)}
            value={searchBarText}
         />
      </div>
   );
};

export default SearchBar;
