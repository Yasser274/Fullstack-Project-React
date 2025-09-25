import type React from "react";
import styles from "../components/styles/Profile.module.css";
import { useRef, useState } from "react";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../context/AuthContext&Global";
import EditIcon from "../assets/icons/EditIcon";
import { useTranslation } from "react-i18next";
import { toast, Bounce } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

const ProfileSettings = () => {
   const [error, setError] = useState<string | null>(null);
   const [done, setDone] = useState<string | null>(null);

   const imageSelector = useRef<HTMLInputElement>(null);

   const [passwordsMismatch, setPasswordsMismatch] = useState<boolean>(false);

   const { logout, user, setUser, profileImageUrl, login } = useAuth();

   const { t } = useTranslation();
   const { theme } = useTheme();

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
      changeProfilePicture(file);
   };

   const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
         console.error("Authentication error: Token not found");
         setError("You are not logged in."); // Show a user-friendly error
         return;
      }
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
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
         toast.error(t("auth.changeProfileSettings.notMatch"), {
            position: "top-center",
            autoClose: 4000,
            theme: theme === "light" ? "light" : "dark",
            transition: Bounce,
            pauseOnHover: true,
         });
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
            toast.error(t(data.displayMessage), {
               position: "top-center",
               autoClose: 4000,
               theme: theme === "light" ? "light" : "dark",
               transition: Bounce,
               pauseOnHover: true,
            });
         }
         if (!response.ok) {
            throw new Error(data.message || "Changing password failed.");
         }

         console.dir(data);
         toast.success(t("auth.changeProfileSettings.changedSuccessfully"), {
            position: "top-center",
            autoClose: 4000,
            theme: theme === "light" ? "light" : "dark",
            transition: Bounce,
            pauseOnHover: true,
         }); // Provide success feedback!
         setInterval(() => {
            logout();
         }, 5000);
      } catch (error) {
         if (error instanceof Error) {
            setError(error.message);
         } else {
            setError("An unknown error occurred.");
         }
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
      // Create a FormData object. This is how you send files.
      const formData = new FormData();
      // Append the file to the FormData object.
      formData.append("newPicture", file);

      try {
         const response = await fetch(`${API_BASE_URL}/api/changePic`, {
            method: "PATCH",
            headers: {
               Authorization: `Bearer ${authToken}`,
            },
            body: formData,
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
            toast.success("Profile picture updated successfully!", {
               position: "top-center",
               autoClose: 4000,
               theme: theme === "light" ? "light" : "dark",
               transition: Bounce,
               pauseOnHover: true,
            });
         } else {
            if (user) {
               setUser({ ...user, profilePictureURL: data.newImageUrl });
            }
         }
      } catch (error) {
         console.error("Changing Picture went wrong-", error);
      }
   };

   return (
      <div className={styles.profileSettingsCon}>
         <h2 className={styles.profileSecTitle}>{t("changePasswordTitle")}</h2>
         <form className={styles.formProfilePassword} onSubmit={changePassword}>
            <div className={styles.oldPassCon}>
               <label htmlFor="oldPass">{t("oldPasswordTitle")}</label>
               <input
                  type="password"
                  id="oldPass"
                  placeholder={t("oldPasswordPlaceHolder")}
                  name="oldPassValue"
               />
            </div>
            <div className={styles.newPassCon}>
               <label htmlFor="newPass">{t("newPasswordTitle")}</label>
               <input
                  type="password"
                  id="newPass"
                  placeholder={t("newPasswordPlaceHolder")}
                  name="newPassValue"
                  className={passwordsMismatch ? styles.newPassConWrong : styles.newPassInput}
               />
               <label htmlFor="newPassConf">{t("confirmNewPassword")}</label>
               <input
                  type="password"
                  id="newPassConf"
                  placeholder={t("confirmNewPasswordPlaceHolder")}
                  name="newPassConfValue"
                  className={passwordsMismatch ? styles.newPassConWrong : styles.newPassInput}
               />
            </div>
            <button className={styles.changePassBtn}>{t("changePasswordBtn")}</button>
         </form>
         <h2 className={styles.profileSecTitleB}>{t("changeProfilePicTitle")}</h2>
         <form>
            <div className={styles.changeProfilePicCon}>
               <input type="file" ref={imageSelector} onChange={handleFileChange} accept="image/*" />
               <img
                  src={profileImageUrl}
                  alt="User's Profile Picture"
                  className={styles.changeProfilePic}
                  onClick={handleClickImg}
               />
               <EditIcon className={styles.editIconProfile}></EditIcon>
            </div>
         </form>
      </div>
   );
};

export default ProfileSettings;
