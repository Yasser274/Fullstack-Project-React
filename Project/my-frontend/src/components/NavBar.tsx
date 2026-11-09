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
import useBodyScrollLock from "../hooks/useBodyScrollLock";
// (the hamburger svg that was inside this file moved to Icons.tsx with the other icons)
import { CloseIcon, LogInIcon, LogOutIcon, MenuIcon } from "../assets/icons/Icons";
import { useEffect } from "react";
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

      // Navigate to the new URL (+ location.search so ?page=2&sortBy=... is kept when switching language)
      navigate(`/${newLang}/${currentPath}${location.search}`);
   };

   // when the user logs in close the login modal (this replaces the window.location.reload() after login in AuthModalContent)
   useEffect(() => {
      if (user) {
         setIsLoginModalOpen(false);
         setSwitchModalTitle(0);
      }
   }, [user, setIsLoginModalOpen, setSwitchModalTitle]);

   // for when mobile nav menu is opened disable scrolling if closed enable it back again
   useBodyScrollLock(isMobileMenuOpen);

   return (
      <header>
         <nav className={styles.navBarCon}>
            {/* to="" pointed to the CURRENT page (so on /profile the logo did nothing) now it always goes home */}
            <Link to={`/${i18n.language}`} aria-label="Trend Bites home">
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
                  aria-label="Open menu"
                  aria-expanded={isMobileMenuOpen}
               >
                  <MenuIcon className={styles.hamburgerMenuIcon} size={24} />
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

            {/* dark layer behind the side menu, clicking it closes the menu (before you could only close it with the hamburger) */}
            <div
               className={`${styles.mobileMenuBackdrop} ${isMobileMenuOpen ? styles.mobileMenuBackdropShow : ""}`}
               onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            <div className={`${styles.navBarItemsCon} ${isMobileMenuOpen ? styles.navBarMenuMobile : ""}`}>
               <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`${styles.hamburgerBtn} ${isMobileMenuOpen ? styles.holdHamburgerBtn : ""}`}
                  aria-label="Close menu"
               >
                  {/* an X inside the open menu reads better as "close" than a second hamburger */}
                  <CloseIcon className={styles.hamburgerMenuIconInsideSide} size={24} />
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
                        <LogOutIcon size={18} />
                        {t("logout")}
                     </button>
                  </div>
               ) : (
                  // if not show the login button
                  <button className={styles.loginBtn} onClick={() => setIsLoginModalOpen(true)}>
                     <LogInIcon size={18} />
                     {t("login")}
                  </button>
               )}
               {/* theme + language grouped together so they stay side by side in the mobile menu */}
               <div className={styles.navTogglesCon}>
                  <ThemeMandSIcon></ThemeMandSIcon>
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
