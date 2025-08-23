import styles from "../components/styles/Home.module.css";
import { NavLink } from "react-router-dom";

const ProfileNav = () => {
   return (
      <div className={styles.profileNavCon}>
         <ul>
            <li>
               <NavLink
                  to={"/profile"}
                  end // end so that the class doesn't get activated even when i'm at /profile/settings since NavLink checks if the url starts with .. (Now /profile will only be active when the URL is exactly /profile,)
                  className={({ isActive }) =>
                     isActive ? styles.innerProfileNavAct : styles.innerProfileNavDefault
                  }
               >
                  Data
               </NavLink>
            </li>
            <li>
               <NavLink
                  to={"/profile/settings"}
                  className={({ isActive }) =>
                     isActive ? styles.innerProfileNavAct : styles.innerProfileNavDefault
                  }
               >
                  Settings
               </NavLink>
            </li>
            <li>
               <NavLink
                  to={"/profile/votesHistory"}
                  className={({ isActive }) =>
                     isActive ? styles.innerProfileNavAct : styles.innerProfileNavDefault
                  }
               >
                  Votes History
               </NavLink>
            </li>
         </ul>
      </div>
   );
};

export default ProfileNav;
