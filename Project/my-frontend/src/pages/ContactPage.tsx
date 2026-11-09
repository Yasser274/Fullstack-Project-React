import { useTranslation } from "react-i18next";
import { SocialIcon } from "react-social-icons";
import useInView from "../components/common/useInView";
import styles from "../components/styles/Layout.module.css";
import { MessageIcon } from "../assets/icons/Icons";
import { SOCIAL_LINKS, socialIconProps } from "../config/socialLinks";

const ContactPage = () => {
   const { t } = useTranslation();

   // same slide in animation as the about page
   const [sectionRef, isSectionVisible] = useInView<HTMLDivElement>({
      threshold: 0.1,
      triggerOnce: true,
   });

   return (
      <div
         className={`${styles.simplePageCon} ${styles.contactCard} ${isSectionVisible ? styles.contactCardVisible : ""}`}
         ref={sectionRef}
      >
         <title>{t("contact")}</title>
         <span className={styles.simplePageIconBadge}>
            <MessageIcon size={26} />
         </span>
         <h1>{t("contactTitle")}</h1>
         <p>{t("contactDesc")}</p>
         {/* same links as the footer (config/socialLinks.ts) */}
         <div className={styles.contactSocials}>
            {SOCIAL_LINKS.map((link) => (
               <SocialIcon
                  key={link.network}
                  network={link.network}
                  url={link.url}
                  {...socialIconProps}
                  className={styles.socialIcon}
               ></SocialIcon>
            ))}
         </div>
      </div>
   );
};

export default ContactPage;
