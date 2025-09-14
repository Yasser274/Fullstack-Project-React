import styles from "./styles/Profile.module.css";

import { useAuth } from "../context/AuthContext&Global";

const ProfileData = () => {
   // Get the user directly from the global context. This is the single source of truth.
   const { user,profileImageUrl } = useAuth();

   if (!user) {
      return <div>Loading Profile... or you are not logged in.</div>;
   }

   return (
      <div className={styles.profileDataCon}>
         <div className={styles.profileDetails1}>
            <img
               src={profileImageUrl}
               alt="Profile Picture of the user"
            />
            <h2>{user.username}</h2>
         </div>
         <div className={styles.emailProfileCon}>
            <p>{user.email}</p>
         </div>
      </div>
   );
};

export default ProfileData;
