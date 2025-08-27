import styles from "../components/styles/Home.module.css";
import ProfileNav from "../components/ProfileNav";
import { Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext&Global";

const ProfilePage = () => {
   const { user } = useAuth();

   return (
      <>
         {user ? (
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
         ) : (
            <h2>You're not Logged In</h2>
         )}
      </>
   );
};

export default ProfilePage;
