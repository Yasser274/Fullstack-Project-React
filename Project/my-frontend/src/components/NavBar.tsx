import styles from "../components/styles/Layout.module.css";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import TrendBitesLogo from "../assets/icons/TrendBitesLogo";
import TrendBitesLogoRTL from "../assets/icons/TrendBitesLogoRTL";

import Modal from "./common/Modal";
import ToggleSwitchBtn from "./common/ToggleSwitchBtn";
import ThemeMandSIcon from "../assets/icons/ThemeMandSIcon";
import AuthModalContent from "./common/AuthModalContent";
import type { User } from "../context/AuthContext&Global";

// for translations
import { useTranslation } from "react-i18next";
// type for hamburgerIcon
interface HamburgerIconProps {
   className?: string;
}
// A simple hamburger icon component
const HamburgerIcon = ({ className }: HamburgerIconProps) => (
   <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
   </svg>
);

interface NavBarProps {
   isLoginModalOpen: boolean;
   setIsLoginModalOpen: (v: boolean) => void;
   switchModalTitle: 0 | 1;
   setSwitchModalTitle: (v: 0 | 1) => void;
   isMobileMenuOpen: boolean;
   setIsMobileMenuOpen: (v: boolean) => void;
   isSessionExpired: boolean;
   closeModalSession: () => void;
   user: User | null;
   profileImageUrl: string;
   logout: () => void;
}

const NavBar = ({
   setIsMobileMenuOpen,
   isMobileMenuOpen,
   isSessionExpired,
   closeModalSession,
   user,
   profileImageUrl,
   switchModalTitle,
   setSwitchModalTitle,
   logout,
   setIsLoginModalOpen,
   isLoginModalOpen,
}: NavBarProps) => {
   // Get the t function and the i18n instance from the hook
   const { t, i18n } = useTranslation();
   const navigate = useNavigate();
   const location = useLocation();

   const handleLanguageChange = () => {
      const newLang = i18n.language === "en" ? "ar" : "en";

      // This is a more robust way to get the current path after the language code
      // It splits "/en/about/us" into ["", "en", "about", "us"]
      const pathParts = location.pathname.split("/");

      // It then takes everything *after* the language code and joins it back
      // ["about", "us"] becomes "about/us"
      const currentPath = pathParts.slice(2).join("/");

      // Navigate to the new URL
      navigate(`/${newLang}/${currentPath}`);
   };

   return (
      <header>
         <nav className={styles.navBarCon}>
            <Link to={""}>
               {/*    // Determine the direction based on the current language. */}
               {i18n.dir(i18n.language) === "ltr" ? (
                  <TrendBitesLogo className={styles.logoSVG}></TrendBitesLogo>
               ) : (
                  <TrendBitesLogoRTL className={styles.logoSVG}></TrendBitesLogoRTL>
               )}
            </Link>
            {/* //* for mobile menu hamburger menu */}
            <div>
               <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} //setIsMobileMenuOpen(!isMobileMenuOpen) to toggle between true and false
                  className={`${styles.hamburgerBtn} ${isMobileMenuOpen ? styles.holdHamburgerBtn : ""}`}
               >
                  <HamburgerIcon className={styles.hamburgerMenuIcon}></HamburgerIcon>
               </button>
            </div>

            {/* Show the session expiration modal when the flag is true */}
            {isSessionExpired ? (
               <Modal isOpen={isSessionExpired} title={t("sessionExpired")} onClose={closeModalSession}>
                  {/* the content of this modal */}
                  <div>
                     <p style={{ textAlign: "center" }}>{t("sessionExpiredMessage")}</p>
                  </div>
               </Modal>
            ) : null}

            <div className={`${styles.navBarItemsCon} ${isMobileMenuOpen ? styles.navBarMenuMobile : ""}`}>
               <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`${styles.hamburgerBtn} ${isMobileMenuOpen ? styles.holdHamburgerBtn : ""}`}
               >
                  <HamburgerIcon
                     className={`${styles.hamburgerMenuIconInsideSide} ${
                        isMobileMenuOpen ? styles.holdHamburgerBtn : ""
                     }`}
                  ></HamburgerIcon>
               </button>

               <NavLink
                  to={`/${i18n.language}`}
                  end
                  className={({ isActive }) => (isActive ? styles.activeLink : styles.defaultLink)} // ? this means if isActive is true(means currently inside this page) run whats after the ? if not runs what after :
               >
                  {t("home")}
               </NavLink>
               <NavLink
                  //  so the current language doesn't get messed up EX: en/about
                  to={`/${i18n.language}/about`}
                  className={({ isActive }) => (isActive ? styles.activeLink : styles.defaultLink)}
               >
                  {t("about")}
               </NavLink>
               <NavLink
                  to={`/${i18n.language}/contact`}
                  className={({ isActive }) => (isActive ? styles.activeLink : styles.defaultLink)}
               >
                  {t("contact")}
               </NavLink>
               <NavLink
                  to={`/${i18n.language}/profile`}
                  className={({ isActive }) => (isActive ? styles.activeLink : styles.defaultLink)}
               >
                  {t("profile")}
               </NavLink>
               {user ? (
                  // if user is logged in (true)
                  <div className={styles.navProfilePicCon}>
                     <Link to={`/${i18n.language}/profile`}>
                        <img
                           src={profileImageUrl}
                           alt="Profile Picture of the user"
                           className={styles.navProfilePicImg}
                        />
                     </Link>
                     <button onClick={logout} className={styles.logoutBtn}>
                        {t("logout")}
                     </button>
                  </div>
               ) : (
                  // if not show the login button
                  <button className={styles.loginBtn} onClick={() => setIsLoginModalOpen(true)}>
                     {t("login")}
                  </button>
               )}
               <div>
                  <ThemeMandSIcon></ThemeMandSIcon>
               </div>
               <div>
                  <ToggleSwitchBtn
                     onChangeFun={handleLanguageChange}
                     checkLan={i18n.language}
                  ></ToggleSwitchBtn>
               </div>

               {/* when clicked on it will update state of IsLoginModalOpen to true */}
               <Modal
                  setResetTitle={setSwitchModalTitle} // so when i close the modal on the register render it will reset the title back to "Login"
                  isOpen={isLoginModalOpen} // if it's true it render the overlay if false it will not render it
                  title={switchModalTitle === 0 ? t("loginBtnText") : t("registerBtnText")}
                  children={
                     <AuthModalContent
                        currentTitle={switchModalTitle}
                        onSwitchTitle={setSwitchModalTitle}
                     ></AuthModalContent>
                  }
                  onClose={() => setIsLoginModalOpen(false)} // it will close overlay down
               ></Modal>
            </div>
         </nav>
      </header>
   );
};

export default NavBar;
