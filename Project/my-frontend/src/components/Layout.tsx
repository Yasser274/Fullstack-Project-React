// Import styling CSS for this component
import { useState, useEffect } from "react";
import styles from "../components/styles/Layout.module.css";
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import Modal from "./common/Modal";
import AuthModalContent from "./common/AuthModalContent";

// Context (global state access) (this one for login and auth)
import { useAuth } from "../context/AuthContext&Global";
import { useTheme } from "../context/ThemeContext";
import ThemeMandSIcon from "../assets/icons/ThemeMandSIcon";
import TrendBitesLogo from "../assets/icons/TrendBitesLogo";
import { API_BASE_URL } from "../config/config";
import { SocialIcon } from "react-social-icons";

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

const Layout = () => {
   // useState to close down and open the login/register modal(overlay)
   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
   // to switch modal title
   const [switchModalTitle, setSwitchModalTitle] = useState<1 | 0>(0);
   // for mobile view
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<false | true>(false);

   const { user, logout, isSessionExpired, closeModalSession, profileImageUrl } = useAuth();

   // Call the hook here to get the location object (my path /profile for example)
   const location = useLocation();
   // Close the mobile menu when the route changes (when user clicks any of the navs and changes url)
   useEffect(() => {
      setIsMobileMenuOpen(false);
   }, [location]);

   return (
      <div className={styles.layoutContainer}>
         <header>
            <nav className={styles.navBarCon}>
               <Link to={""}>
                  <TrendBitesLogo className={styles.logoSVG}></TrendBitesLogo>
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
                  <Modal isOpen={isSessionExpired} title="Session Expired" onClose={closeModalSession}>
                     {/* the content of this modal */}
                     <div>
                        <p style={{ textAlign: "center" }}>Please log in again, your session expired.</p>
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
                     to="/"
                     className={({ isActive }) => (isActive ? styles.activeLink : styles.defaultLink)} // ? this means if isActive is true(means currently inside this page) run whats after the ? if not runs what after :
                  >
                     Home
                  </NavLink>
                  <NavLink
                     to="/about"
                     className={({ isActive }) => (isActive ? styles.activeLink : styles.defaultLink)}
                  >
                     About
                  </NavLink>
                  <NavLink
                     to="/contact"
                     className={({ isActive }) => (isActive ? styles.activeLink : styles.defaultLink)}
                  >
                     Contact
                  </NavLink>
                  <NavLink
                     to="/profile"
                     className={({ isActive }) => (isActive ? styles.activeLink : styles.defaultLink)}
                  >
                     Profile
                  </NavLink>
                  {user ? (
                     // if user is logged in (true)
                     <div className={styles.navProfilePicCon}>
                        <Link to={"/profile"}>
                           <img
                              src={profileImageUrl}
                              alt="Profile Picture of the user"
                              className={styles.navProfilePicImg}
                           />
                        </Link>
                        <button onClick={logout} className={styles.logoutBtn}>
                           Logout
                        </button>
                     </div>
                  ) : (
                     // if not show the login button
                     <button className={styles.loginBtn} onClick={() => setIsLoginModalOpen(true)}>
                        Login
                     </button>
                  )}
                  <div>
                     <ThemeMandSIcon></ThemeMandSIcon>
                  </div>

                  {/* when clicked on it will update state of IsLoginModalOpen to true */}
                  <Modal
                     setResetTitle={setSwitchModalTitle} // so when i close the modal on the register render it will reset the title back to "Login"
                     isOpen={isLoginModalOpen} // if it's true it render the overlay if false it will not render it
                     title={switchModalTitle === 0 ? "Login" : "Register"}
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

         <main className={styles.mainCon}>
            {/* This is where your page components (like HomePage) will be rendered */}
            <Outlet />
            {/* kinda like in flask {% body main %} where i can insert any html contents into it */}
            {/* { The <Outlet /> component in Layout.tsx acts as a placeholder where React Router will swap in HomePage, AboutPage, etc., based on the current URL. } */}
         </main>

         <footer className={styles.footerCon}>
            <div className={styles.footerWhole}>
               <div className={styles.footerContent}>
                  <div>
                     <TrendBitesLogo className={styles.footerLogo}></TrendBitesLogo>
                  </div>
                  <nav className={styles.footerLinks}>
                     <div className={styles.legalFooterCon}>
                        <h3>Legal</h3>
                        <a href="/privacy-policy">Privacy Policy</a>
                        <a href="/terms-of-service">Terms of Service</a>
                     </div>
                     <div className={styles.contactFooterCon}>
                        <h3>Contact Us</h3>
                        <Link to={"/contact"}>Contact</Link>
                     </div>
                  </nav>
               </div>
               <div className={styles.belowFooterCon}>
                  <hr style={{ color: "black", width: "100%",border:'white 1px solid' }} />
                  <div className={styles.belowFooterDetails}>
                     <div className={styles.copyright}>
                        <p>&copy; 2025 Trend Bites. All Rights Reserved.</p>
                     </div>
                     <div className={styles.socialMediaCon}>
                        <SocialIcon network="github" url="https://www.github.com"></SocialIcon>
                        <SocialIcon network="x" url="https://www.x.com"></SocialIcon>
                        <SocialIcon network="youtube" url="https://www.youtube.com"></SocialIcon>
                     </div>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default Layout;
