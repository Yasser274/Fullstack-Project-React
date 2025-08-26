import styles from "./styles/Profile.module.css";

import { useAuth } from "../context/AuthContext";

const ProfileData = () => {
   // Get the user directly from the global context. This is the single source of truth.
   const { user } = useAuth();

   if (!user) {
      return <div>Loading Profile... or you are not logged in.</div>;
   }

   return (
      <div className={styles.profileDataCon}>
         <div className={styles.profileDetails1}>
            <img
               src={`${
                  user.profilePictureURL
               }`}
               alt="Profile Picture of the user"
            />
            <h2>{user.username}</h2>
         </div>
         <div>
            <p>{user.email}</p>
         </div>
      </div>
   );
};

export default ProfileData;
