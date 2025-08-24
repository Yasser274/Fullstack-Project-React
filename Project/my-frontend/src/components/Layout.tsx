// Import styling CSS for this component
import { useState } from "react";
import styles from "../components/styles/Layout.module.css";
import { Outlet, Link, NavLink } from "react-router-dom";
import Modal from "./common/Modal";
import AuthModalContent from "./common/AuthModalContent";

const Layout = () => {
   // useState to close down and open the login/register modal(overlay)
   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

   return (
      <div className={styles.layoutContainer}>
         <header>
            <nav className={styles.navBarCon}>
               <h1>My App</h1>
               <div className={styles.navBarItemsCon}>
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
                  <button onClick={() => setIsLoginModalOpen(true)}>Login</button>
                  {/* when clicked on it will update state of IsLoginModalOpen to true */}
                  <Modal
                     isOpen={isLoginModalOpen} // if it's true it render the overlay if false it will not render it
                     title="Login"
                     children={<AuthModalContent></AuthModalContent>}
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
            <div className={styles.footerContent}>
               <p>&copy; 2025 Company Name. All Rights Reserved.</p>
               <nav className={styles.footerLinks}>
                  <a href="/privacy-policy">Privacy Policy</a>
                  <a href="/terms-of-service">Terms of Service</a>
                  <Link to={"/contact"}>Contact</Link>
               </nav>
            </div>
         </footer>
      </div>
   );
};

export default Layout;
