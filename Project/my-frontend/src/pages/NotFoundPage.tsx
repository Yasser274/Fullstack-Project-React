import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../components/styles/Layout.module.css";
import { UtensilsIcon } from "../assets/icons/Icons";

// .shown for any URL that doesn't have a page (still inside Layout so the navbar and footer stay)
const NotFoundPage = () => {
   const { t, i18n } = useTranslation();

   return (
      <div className={styles.simplePageCon}>
         <title>{t("notFoundTitle")}</title>
         <UtensilsIcon size={48} className={styles.simplePageIcon} />
         <span className={styles.simplePageBigText}>404</span>
         <h1>{t("notFoundTitle")}</h1>
         <p>{t("notFoundDesc")}</p>
         <Link to={`/${i18n.language}`} className={styles.simplePageBtn}>
            {t("backHome")}
         </Link>
      </div>
   );
};

export default NotFoundPage;
