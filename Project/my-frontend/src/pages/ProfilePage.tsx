import styles from "../components/styles/Home.module.css";
import ProfileNav from "../components/ProfileNav";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import { useAuth } from "../context/AuthContext&Global";
import Modal from "../components/common/Modal";
import useInView from "../components/common/useInView";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
   const { t, i18n } = useTranslation();

   const [sectionRef, isSectionVisible] = useInView<HTMLDivElement>({
      threshold: 0.1,
      triggerOnce: true,
   });
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
            <section
               className={`${styles.profileRightSection} ${
                  isSectionVisible ? styles.profileRightSectionVisible : ""
               }`}
               ref={sectionRef}
            >
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
         title={t("authReqMessageTitle")}
         onClose={() => {
            setIsAuthModalOpen(false);
            navigate("/");
         }}
      >
         {/* the content of this modal */}
         <div>
            <p style={{ textAlign: "center" }}>{t("authReqMessageProfile")}</p>
         </div>
      </Modal>
   );
};

export default ProfilePage;
