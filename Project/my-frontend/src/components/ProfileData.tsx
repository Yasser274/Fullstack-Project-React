import styles from "./styles/Profile.module.css";

import { useAuth } from "../context/AuthContext&Global";
import { MailIcon } from "../assets/icons/Icons";

const ProfileData = () => {
   // Get the user directly from the global context. This is the single source of truth.
   const { user, profileImageUrl } = useAuth();

   if (!user) {
      return <div>Loading Profile... or you are not logged in.</div>;
   }

   return (
      <div className={styles.profileDataCon}>
         {/* colored strip at the top of the card, the picture sits half on it */}
         <div className={styles.profileBanner}></div>
         <div className={styles.profileDetails1}>
            <img src={profileImageUrl} alt="Profile Picture of the user" />
            <h2>{user.username}</h2>
         </div>
         {/* small info rows with the same icons as the login form */}
         <ul className={styles.profileInfoList}>
            <li className={styles.emailProfileCon}>
               <MailIcon size={18} />
               <p>{user.email}</p>
            </li>
         </ul>
      </div>
   );
};

export default ProfileData;
