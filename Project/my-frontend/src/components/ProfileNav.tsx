import styles from "../components/styles/Home.module.css";
import { NavLink } from "react-router-dom";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";

const ProfileNav = () => {

   const {t,i18n} = useTranslation()

   return (
      <div className={styles.profileNavCon}>
         <ul>
            <li>
               <NavLink
                  to={`/${i18n.language}/profile`}
                  end // end so that the class doesn't get activated even when i'm at /profile/settings since NavLink checks if the url starts with .. (Now /profile will only be active when the URL is exactly /profile,)
                  className={({ isActive }) =>
                     isActive ? styles.innerProfileNavAct : styles.innerProfileNavDefault
                  }
               >
                  {t('profileData')}
               </NavLink>
            </li>
            <li>
               <NavLink
                  to={`/${i18n.language}/profile/settings`}
                  className={({ isActive }) =>
                     isActive ? styles.innerProfileNavAct : styles.innerProfileNavDefault
                  }
               >
                  {t("profileSettings")}
               </NavLink>
            </li>
            <li>
               <NavLink
                  to={`/${i18n.language}/profile/votesHistory`}
                  className={({ isActive }) =>
                     isActive ? styles.innerProfileNavAct : styles.innerProfileNavDefault
                  }
               >
                  {t("profileVotingHis")}
               </NavLink>
            </li>
         </ul>
      </div>
   );
};

export default ProfileNav;
