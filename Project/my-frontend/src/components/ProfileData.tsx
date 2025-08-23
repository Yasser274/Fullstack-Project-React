import styles from "./styles/Profile.module.css";
import type { profileDataProps } from "../pages/ProfilePage"; // import the type from the parent component
import { useOutletContext } from "react-router-dom";

const ProfileData = () => {
   const props = useOutletContext<profileDataProps>(); // this gets the context data from the outlet (parent(ProfilePage) where this components is nested in <Route> in App.tsx)

   return (
      <div className={styles.profileDataCon}>
         <div className={styles.profileDetails1}>
            <img
               src={`${
                  props.profilePicture ||
                  "https://wpengine.com/wp-content/uploads/2021/05/optimize-images.jpg"
               }`}
               alt="Profile Picture of the user"
            />
            <h2>{props.name}</h2>
         </div>
         <div>
            <p>{props.email}</p>
         </div>
      </div>
   );
};

export default ProfileData;
