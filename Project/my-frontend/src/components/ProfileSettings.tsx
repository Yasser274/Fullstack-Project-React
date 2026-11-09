import type React from "react";
import styles from "../components/styles/Profile.module.css";
import { useRef, useState } from "react";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../context/AuthContext&Global";
import { CameraIcon, LockIcon } from "../assets/icons/Icons";
import { useTranslation } from "react-i18next";
import { notify } from "../utils/notify";

const ProfileSettings = () => {
   const [, setError] = useState<string | null>(null);
   const [, setDone] = useState<string | null>(null);

   const imageSelector = useRef<HTMLInputElement>(null);

   const [passwordsMismatch, setPasswordsMismatch] = useState<boolean>(false);

   const { logout, user, setUser, profileImageUrl, login } = useAuth();

   const { t } = useTranslation();

   // .Functions
   const handleClickImg = () => {
      // when user clicked on <img>
      // trigger the ref input and make it clicked so the select file pop up appears
      imageSelector.current?.click();
   };

   // Called when a file is selected
   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files === null) return;

      const file = event.target.files[0];
      // clear the input so picking the SAME file again still fires onChange (useful after a failed upload)
      event.target.value = "";
      if (!file) return;

      // same 8MB limit the old multer upload had
      if (file.size > 1024 * 1024 * 8) {
         notify.error(t("auth.changeProfileSettings.imageTooBig"));
         return;
      }

      changeProfilePicture(file);
   };

   const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
      // preventDefault FIRST, before it was after the token check so with no token the form did a normal submit and reloaded the page
      e.preventDefault();
      // save the form element now, e.currentTarget is null after the await below
      const formEl = e.currentTarget;
      const authToken = localStorage.getItem("token");
      if (!authToken) {
         console.error("Authentication error: Token not found");
         setError("You are not logged in."); // Show a user-friendly error
         return;
      }
      const formData = new FormData(formEl);
      const getOldPasswordVal = formData.get("oldPassValue");
      const getNewPasswordVal = formData.get("newPassValue");
      const getNewConfPasswordVal = formData.get("newPassConfValue");

      // reset after the new function call(another attempt)
      setError(null);
      setPasswordsMismatch(false);
      setDone(null);

      // validation
      // if new passwords don't match
      if (getNewPasswordVal !== getNewConfPasswordVal) {
         notify.error(t("auth.changeProfileSettings.notMatch"));
         setPasswordsMismatch(true);
         return;
      }

      // * fetching
      try {
         const response = await fetch(`${API_BASE_URL}/api/changePassword`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json", // Tell the server we're sending JSON
               Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
               oldPassword: getOldPasswordVal,
               newPassword: getNewPasswordVal,
               newConfPassword: getNewConfPasswordVal,
            }),
         });
         // ? Read the response body ONCE
         const data = await response.json();

         if (response.status === 401) {
            notify.error(t(data.displayMessage));
            return; // already showed the toast, no need to also throw below
         }
         if (!response.ok) {
            throw new Error(data.message || "Changing password failed.");
         }

         console.dir(data);
         notify.success(t("auth.changeProfileSettings.changedSuccessfully")); // Provide success feedback!
         formEl.reset(); // clear the password fields
         // setTimeout not setInterval, setInterval kept calling logout() every 5 seconds forever
         setTimeout(() => {
            logout();
         }, 5000);
      } catch (error) {
         if (error instanceof Error) {
            setError(error.message);
         } else {
            setError("An unknown error occurred.");
         }
         // the error state isn't shown anywhere on the page so show it as a toast too
         notify.error(t("somethingWentWrong"));
      }

      console.log(`old ${getOldPasswordVal} new: ${getNewPasswordVal} newConf: ${getNewConfPasswordVal}`);
   };

   // Change profile Picture API
   const changeProfilePicture = async (file: File) => {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
         console.error("Authentication error: Token not found");
         setError("You are not logged in."); // Show a user-friendly error
         return;
      }
      try {
         // 1. ask the backend for a presigned S3 upload URL
         const urlResponse = await fetch(
            `${API_BASE_URL}/api/profilePicUploadUrl?contentType=${encodeURIComponent(file.type)}`,
            { headers: { Authorization: `Bearer ${authToken}` } },
         );
         const urlData = await urlResponse.json();
         if (!urlResponse.ok) {
            throw new Error(urlData.message || "Could not get upload URL");
         }

         // 2. upload the picture straight to S3 (it never goes through Lambda)
         const s3Response = await fetch(urlData.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
         });
         if (!s3Response.ok) {
            throw new Error("Uploading the picture to S3 failed");
         }

         // 3. tell the backend the new filename so it saves it and gives back a new token
         const response = await fetch(`${API_BASE_URL}/api/changePic`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ fileName: urlData.fileName }),
         });
         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || "Changing Profile Picture went wrong");
         }

         console.dir(data);

         if (data.token) {
            console.log("ran");
            //update the new token so it contains the new profile picture
            login(data.token);
            notify.success(t("auth.changeProfileSettings.changedProfilePic"));
         } else {
            if (user) {
               setUser({ ...user, profilePictureURL: data.newImageUrl });
            }
         }
      } catch (error) {
         console.error("Changing Picture went wrong-", error);
         notify.error(t("somethingWentWrong"));
      }
   };

   return (
      <div className={styles.profileSettingsCon}>
         {/* each setting is its own card now */}
         <section className={styles.settingsCard}>
            <h2 className={styles.profileSecTitle}>
               <LockIcon size={20} />
               {t("changePasswordTitle")}
            </h2>
            <form className={styles.formProfilePassword} onSubmit={changePassword}>
               <div className={styles.oldPassCon}>
                  <label htmlFor="oldPass">{t("oldPasswordTitle")}</label>
                  <input
                     type="password"
                     id="oldPass"
                     placeholder={t("oldPasswordPlaceHolder")}
                     name="oldPassValue"
                     required
                     autoComplete="current-password"
                  />
               </div>
               <div className={styles.newPassCon}>
                  <label htmlFor="newPass">{t("newPasswordTitle")}</label>
                  <input
                     type="password"
                     id="newPass"
                     placeholder={t("newPasswordPlaceHolder")}
                     name="newPassValue"
                     required
                     autoComplete="new-password"
                     className={passwordsMismatch ? styles.newPassConWrong : styles.newPassInput}
                  />
                  <label htmlFor="newPassConf">{t("confirmNewPassword")}</label>
                  <input
                     type="password"
                     id="newPassConf"
                     placeholder={t("confirmNewPasswordPlaceHolder")}
                     name="newPassConfValue"
                     required
                     autoComplete="new-password"
                     className={passwordsMismatch ? styles.newPassConWrong : styles.newPassInput}
                  />
               </div>
               <button type="submit" className={styles.changePassBtn}>{t("changePasswordBtn")}</button>
            </form>
         </section>
         <section className={styles.settingsCard}>
            <h2 className={styles.profileSecTitleB}>
               <CameraIcon size={20} />
               {t("changeProfilePicTitle")}
            </h2>
            <form>
               <div className={styles.changeProfilePicCon}>
                  <input type="file" ref={imageSelector} onChange={handleFileChange} accept="image/*" />
                  {/* button around the image so it can be reached with the keyboard too */}
                  <button
                     type="button"
                     className={styles.changeProfilePicBtn}
                     onClick={handleClickImg}
                     aria-label={t("changeProfilePicTitle")}
                  >
                     <img src={profileImageUrl} alt="User's Profile Picture" className={styles.changeProfilePic} />
                     {/* camera badge on the picture (was the blue traced EditIcon) */}
                     <span className={styles.editIconProfile}>
                        <CameraIcon size={20} />
                     </span>
                  </button>
               </div>
            </form>
         </section>
      </div>
   );
};

export default ProfileSettings;
