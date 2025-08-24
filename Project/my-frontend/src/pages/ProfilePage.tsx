import styles from "../components/styles/Home.module.css";
import ProfileNav from "../components/ProfileNav";
import { Outlet } from "react-router-dom";

export interface profileDataProps {
   name: string;
   profilePicture?: string; // the ? means optional
   email: string;
}

const ProfilePage = () => {
   // Profile Data API
   const user: profileDataProps = {
      name: "Alice",
      profilePicture: "dsa",
      email: "testing41295841@gmail.com",
   };

   return (
      <div className={styles.profileSection}>
         <title>Profile</title>
         <div className={styles.profileLeftSection}>
            <ProfileNav></ProfileNav>
         </div>
         <section className={styles.profileRightSection}>
            <Outlet context={user}></Outlet>{" "}
            {/* context will pass down the API(object json) into the Outlet that has many components inside it */}
         </section>
      </div>
   );
};

export default ProfilePage;
