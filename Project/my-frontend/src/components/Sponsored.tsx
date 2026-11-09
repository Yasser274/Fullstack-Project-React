import styles from "../components/styles/Home.module.css";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types"; // Import Swiper's type for the callback
import type { sponsorsProps } from "../pages/HomePage";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "../assets/icons/Icons";

const Sponsored = ({ slidesList }: { slidesList: sponsorsProps[] | null }) => {

   const { t, i18n } = useTranslation();

   const progressCircle = useRef<SVGSVGElement | null>(null);
   const progressContent = useRef<HTMLSpanElement | null>(null);

   // my own arrow buttons (same chevron icons as the pagination) instead of Swiper's built in thin arrow
   const prevBtnRef = useRef<HTMLButtonElement | null>(null);
   const nextBtnRef = useRef<HTMLButtonElement | null>(null);

   const onAutoplayTimeLeft = (_s: SwiperClass, time: number, progress: number) => {
      if (progressCircle.current) {
         progressCircle.current.style.setProperty("--progress", String(progress));
      }
      if (progressContent.current) {
         progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
      }
   };

   // nothing to show (still loading or no sponsors) so don't render an empty slider with a timer on it
   if (!slidesList || slidesList.length === 0) {
      return null;
   }

   return (
      <>
         <Swiper
            // Swiper only reads the page direction once when it's created, so the key makes it rebuild when switching
            // between english and arabic (this is what the window.location.reload() in LanguageHandler was covering for)
            key={i18n.dir(i18n.language)}
            dir={i18n.dir(i18n.language)}
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
               delay: 4500,
               disableOnInteraction: false,
               pauseOnMouseEnter: true,
            }}
            pagination={{
               clickable: true,
            }}
            navigation={{ prevEl: prevBtnRef.current, nextEl: nextBtnRef.current }}
            // the refs are still null on the first render, so hand them to swiper right before it starts
            onBeforeInit={(swiper) => {
               if (swiper.params.navigation && typeof swiper.params.navigation !== "boolean") {
                  swiper.params.navigation.prevEl = prevBtnRef.current;
                  swiper.params.navigation.nextEl = nextBtnRef.current;
               }
            }}
            modules={[Autoplay, Pagination, Navigation]}
            onAutoplayTimeLeft={onAutoplayTimeLeft}
            className={styles.mySwiperSponsorCon}
         >
            {slidesList
               ? slidesList.map((slides: sponsorsProps) => {
                    return (
                       <SwiperSlide key={slides.id}>
                          <div
                             className={styles.sponsoredBox}
                             style={{
                                backgroundImage: `url("${slides.banner_image_url}")`, // quotes so URLs with spaces or ( ) don't break
                             }}
                             aria-label={`Sponsored Content from ${slides.restaurant_name}`}
                          >
                             <div className={styles.sponsoredOverlay}>
                                <div className={styles.sponsoredLeft}>
                                   <span>{t("sponsored")}</span>
                                   <div className={styles.sponsoredDetails}>
                                      <img
                                         src={slides.restaurant_logo}
                                         alt={`Logo of ${slides.restaurant_name}`}
                                      />
                                      <h2>{slides.restaurant_name}</h2>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </SwiperSlide>
                    );
                 })
               : null}
            <button
               ref={prevBtnRef}
               type="button"
               className={`${styles.swiperNavBtn} ${styles.swiperPrev}`}
               aria-label="Previous slide"
               slot="container-end"
            >
               <ChevronLeftIcon size={22} />
            </button>
            <button
               ref={nextBtnRef}
               type="button"
               className={`${styles.swiperNavBtn} ${styles.swiperNext}`}
               aria-label="Next slide"
               slot="container-end"
            >
               <ChevronRightIcon size={22} />
            </button>
            <div className={styles.autoplayProgress} slot="container-end">
               <svg viewBox="0 0 48 48" ref={progressCircle}>
                  <circle cx="24" cy="24" r="20" className={styles.progressTrack}></circle>

                  {/* Circle 2: The animated progress ring that draws on top */}
                  <circle className={styles.progressRing} cx="24" cy="24" r="20"></circle>
               </svg>
               <span ref={progressContent}></span>
            </div>
         </Swiper>
      </>
   );
};

export default Sponsored;
