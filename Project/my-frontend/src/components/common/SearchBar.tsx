import { SearchIcon } from "../../assets/icons/Icons";

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
         <SearchIcon className={searchBarIcon} size={18} />
         <input
            className={classNameStyle}
            type="text"
            aria-label={placeholderText}
            placeholder={placeholderText}
            onChange={(e) => updateTextValueState(e.target.value)}
            // If searchBarText is not null and not undefined return its value if not return "" (if it's null or undefined)
            value={searchBarText ?? ""}
         />
      </div>
   );
};

export default SearchBar;
