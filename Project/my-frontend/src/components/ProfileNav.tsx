import styles from "../components/styles/Home.module.css";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HistoryIcon, SlidersIcon, UserIcon } from "../assets/icons/Icons";

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
                  <UserIcon size={18} />
                  <span>{t('profileData')}</span>
               </NavLink>
            </li>
            <li>
               <NavLink
                  to={`/${i18n.language}/profile/settings`}
                  className={({ isActive }) =>
                     isActive ? styles.innerProfileNavAct : styles.innerProfileNavDefault
                  }
               >
                  <SlidersIcon size={18} />
                  <span>{t("profileSettings")}</span>
               </NavLink>
            </li>
            <li>
               <NavLink
                  to={`/${i18n.language}/profile/votesHistory`}
                  className={({ isActive }) =>
                     isActive ? styles.innerProfileNavAct : styles.innerProfileNavDefault
                  }
               >
                  <HistoryIcon size={18} />
                  <span>{t("profileVotingHis")}</span>
               </NavLink>
            </li>
         </ul>
      </div>
   );
};

export default ProfileNav;
