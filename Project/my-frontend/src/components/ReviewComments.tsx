import { StarIcon } from "../assets/icons/Icons";
import type { Restaurant } from "../pages/HomePage";
import styles from "../components/styles/Review.module.css";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../context/AuthContext&Global";
import { useTranslation } from "react-i18next";

// 1. Create a new type alias by "indexing" into the Restaurant type.
//    - Restaurant['reviews'] gets the type of the 'reviews' property (which is Review[])
//    - [number] gets the type of the elements inside that array (which is Review)
type ReviewProps = Restaurant["reviews"][number];

const ReviewComments = ({ rating, comment, reviewedAt, user }: ReviewProps) => {
   const { t, i18n } = useTranslation();

   const { user: CurrentLoggedUser } = useAuth();
   const profileImageUrl = user.profilePictureURL
      ? user.profilePictureURL.includes("/")
         ? `${API_BASE_URL}/${user.profilePictureURL}`
         : `${API_BASE_URL}/uploads/${user.profilePictureURL}`
      : `${API_BASE_URL}/images/default-avatar.png`;

   const starIconsRating = () => {
      const arrayToMapOver = [...Array(rating)];
      const StarsRating = arrayToMapOver.map((_, index) => {
         return <StarIcon key={index} variant="full" size={15} className={styles.smallStar} />;
      });
      return StarsRating;
   };

   // A simple helper function to make the date more readable
   const formatDate = (isoString: string) => {
      // use the site language so arabic shows an arabic date instead of always "October 2, 2026"
      return new Date(isoString).toLocaleDateString(i18n.language === "ar" ? "ar" : "en-US", {
         year: "numeric",
         month: "long",
         day: "numeric",
      });
   };

   return (
      <article className={styles.reviewCard}>
         <header className={styles.reviewHeader}>
            <img
               src={profileImageUrl}
               alt={`Profile Picture of ${user.username}`}
               className={styles.profilePictureReview}
            />
            <div className={styles.reviewMeta}>
               <div className={styles.metaTopRow}>
                  <strong className={styles.username}>
                     {user.username === CurrentLoggedUser?.username
                        ? `${user.username} ${t("yourReview")}`
                        : user.username}
                  </strong>
                  <div className={styles.starRatingReviewCon}>{starIconsRating()}</div>
               </div>
            </div>
         </header>

         <time dateTime={reviewedAt} className={styles.reviewDate}>
            {formatDate(reviewedAt)}
         </time>

         {comment ? (
            <p className={styles.reviewComment}>{comment}</p>
         ) : (
            <p className={`${styles.reviewComment} ${styles.noComment}`}>{t("noCommentProvided")}</p>
         )}
      </article>
   );
};

export default ReviewComments;
