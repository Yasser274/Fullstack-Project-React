// Import styling CSS for this component
import { useState, useEffect } from "react";
import styles from "../components/styles/Layout.module.css";
import { Outlet, Link, useLocation } from "react-router-dom";

// Context (global state access) (this one for login and auth)
import { useAuth } from "../context/AuthContext&Global";
import TrendBitesLogo from "../assets/icons/TrendBitesLogo";
import { SocialIcon } from "react-social-icons";
import NavBar from "./NavBar";

const Layout = () => {
   // useState to close down and open the login/register modal(overlay)
   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
   // to switch modal title
   const [switchModalTitle, setSwitchModalTitle] = useState<1 | 0>(0);
   // for mobile view
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

   const { user, logout, isSessionExpired, closeModalSession, profileImageUrl } = useAuth();


   // Call the hook here to get the location object (my path /profile for example)
   const location = useLocation();
   // Close the mobile menu when the route changes (when user clicks any of the navs and changes url)
   useEffect(() => {
      setIsMobileMenuOpen(false);
   }, [location]);

   return (
      <div className={styles.layoutContainer}>
         <NavBar
            setIsLoginModalOpen={setIsLoginModalOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isSessionExpired={isSessionExpired}
            logout={logout}
            isLoginModalOpen={isLoginModalOpen}
            setSwitchModalTitle={setSwitchModalTitle}
            isMobileMenuOpen={isMobileMenuOpen}
            switchModalTitle={switchModalTitle}
            user={user}
            closeModalSession={closeModalSession}
            profileImageUrl={profileImageUrl}
         ></NavBar>
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
                  <hr style={{ color: "black", width: "100%", border: "white 1px solid" }} />
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
