import type React from "react";
import styles from "../components/styles/Profile.module.css";
import { useRef, useState } from "react";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../context/AuthContext&Global";
import EditIcon from "../assets/icons/EditIcon";

const ProfileSettings = () => {
   const [error, setError] = useState<string | null>(null);
   const [done, setDone] = useState<string | null>(null);

   const imageSelector = useRef<HTMLInputElement>(null);

   const [passwordsMismatch, setPasswordsMismatch] = useState<boolean>(false);

   const { logout, user, setUser, profileImageUrl, login } = useAuth();

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
         setError("New Password do not match");
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

         if (!response.ok) {
            throw new Error(data.message || "Changing password failed.");
         }
         if (response.status === 401) {
            setError(data.message);
         }

         console.dir(data);
         setDone("Password changed successfully! You will be logged out in 5 seconds"); // Provide success feedback!
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
            setDone("Profile picture updated successfully!");
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
         <h2 className={styles.profileSecTitle}>Change Password:</h2>
         <form className={styles.formProfilePassword} onSubmit={changePassword}>
            {done ? <span className={styles.doneMessage}>{done}</span> : null}
            {error ? <span className={styles.errorMessage}>{error}</span> : null}
            <div className={styles.oldPassCon}>
               <label htmlFor="oldPass">Old Password:</label>
               <input
                  type="password"
                  id="oldPass"
                  placeholder="Enter Your Old Password"
                  name="oldPassValue"
               />
            </div>
            <div className={styles.newPassCon}>
               <label htmlFor="newPass">New Password:</label>
               <input
                  type="password"
                  id="newPass"
                  placeholder="Enter Your New Password"
                  name="newPassValue"
                  className={passwordsMismatch ? styles.newPassConWrong : styles.newPassInput}
               />
               <label htmlFor="newPassConf">Confirm New Password:</label>
               <input
                  type="password"
                  id="newPassConf"
                  placeholder="Re-enter New Password"
                  name="newPassConfValue"
                  className={passwordsMismatch ? styles.newPassConWrong : styles.newPassInput}
               />
            </div>
            <button className={styles.changePassBtn}>Change password</button>
         </form>
         <h2 className={styles.profileSecTitleB}>Change Profile Picture:</h2>
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
