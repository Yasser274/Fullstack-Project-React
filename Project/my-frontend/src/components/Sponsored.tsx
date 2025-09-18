import styles from "../components/styles/Home.module.css";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Swiper as SwiperClass } from "swiper/types"; // Import Swiper's type for the callback
import type { sponsorsProps } from "../pages/HomePage";



const Sponsored = ({ slidesList }: { slidesList: sponsorsProps[] | null }) => {
   const progressCircle = useRef<HTMLDivElement | null>(null);
   const progressContent = useRef<HTMLSpanElement | null>(null);

   const onAutoplayTimeLeft = (s: SwiperClass, time: number, progress: number) => {
      if (progressCircle.current) {
         progressCircle.current.style.setProperty("--progress", String(progress));
      }
      if (progressContent.current) {
         progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
      }
   };

   return (
      <>
         <Swiper
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
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            onAutoplayTimeLeft={onAutoplayTimeLeft}
            className={styles.mySwiperSponsorCon}
         >
            {slidesList
               ? slidesList.map((slides:sponsorsProps) => {
                    return (
                       <SwiperSlide key={slides.id}>
                          <div
                             className={styles.sponsoredBox}
                             style={{
                                backgroundImage: `url(${slides.banner_image_url})`,
                             }}
                             aria-label={`Sponsored Content from ${slides.restaurant_name}`}
                          >
                             <div className={styles.sponsoredOverlay}>
                                <div className={styles.sponsoredLeft}>
                                   <span>Sponsored</span>
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
            <div className={styles.autoplayProgress} slot="container-end" ref={progressCircle}>
               <svg viewBox="0 0 48 48">
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
