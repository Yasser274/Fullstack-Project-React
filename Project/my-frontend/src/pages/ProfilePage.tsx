import styles from "../components/styles/Home.module.css";
import ProfileNav from "../components/ProfileNav";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext&Global";
import Modal from "../components/common/Modal";

const ProfilePage = () => {
   const { user } = useAuth();
   const navigate = useNavigate();

   // State to control the visibility of the "please log in" modal
   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

   useEffect(() => {
      // if user isn't logged in
      if (!user) {
         // open modal
         setIsAuthModalOpen(true);
      }
   }, [user, navigate]);

   // if user is logged in
   if (user) {
      return (
         <div className={styles.profileSection}>
            <title>Profile</title>
            <div className={styles.profileLeftSection}>
               <ProfileNav></ProfileNav>
            </div>
            <section className={styles.profileRightSection}>
               <Outlet></Outlet>
               {/* context will pass down the API(object json) into the Outlet that has many components inside it */}
            </section>
         </div>
      );
   }

   // if there user wasn't logged in return this
   return (
      <Modal
         isOpen={isAuthModalOpen}
         title="Authentication Required"
         onClose={() => {
            setIsAuthModalOpen(false);
            navigate("/");
         }}
      >
         {/* the content of this modal */}
         <div>
            <p style={{textAlign:"center"}}>You must be logged in to view this page.</p>
         </div>
      </Modal>
   );
};

export default ProfilePage;
