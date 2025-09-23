import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom"; // this so i can route between pages

// LAYOUT Component
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProfileData from "./components/ProfileData";
import ProfileSettings from "./components/ProfileSettings";
import ProfileVotesHistory from "./components/ProfileVotesHistory";
import LanguageHandler from "./components/LanguageHandler";
import RootRedirector from "./components/RootRedirector";

function App() {
   return (
      <Routes>
         <Route path="/" element={<RootRedirector />} />

         {/* Create the new parent route that captures the language */}
         <Route path="/:lang" element={<LanguageHandler />}>
            {/* This route now inherits the /:lang prefix */}
            <Route element={<Layout></Layout>}>
               {/* Layout has many links inside it that's why i nested these route below it so when the path is /about we get the AboutPage Component */}
               {/* Nested Paths inside Layout */}
               <Route index element={<HomePage></HomePage>}></Route>
               <Route path="about" element={<AboutPage></AboutPage>}></Route>
               <Route path="contact" element={<ContactPage></ContactPage>}></Route>
               <Route path="profile" element={<ProfilePage></ProfilePage>}>
                  {/* Nested path inside /profile index in the first route will get rendered when the path is at index(/profile) just that without anything after it */}
                  <Route index element={<ProfileData></ProfileData>}></Route>
                  <Route path="settings" element={<ProfileSettings></ProfileSettings>}></Route>
                  <Route path="votesHistory" element={<ProfileVotesHistory></ProfileVotesHistory>}></Route>
               </Route>
            </Route>
         </Route>
      </Routes>
   );
}

export default App;
