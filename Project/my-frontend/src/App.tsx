import { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom"; // this so i can route between pages

// LAYOUT Component
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProfileData from "./components/ProfileData";
import ProfileSettings from "./components/ProfileSettings";
import ProfileVotesHistory from "./components/ProfileVotesHistory";

function App() {
   return (
      <Routes>
         <Route path="/" element={<Layout></Layout>}>
            {/* Layout has many links inside it that's why i nested these route below it so when the path is /about we get the AboutPage Component */}
            {/* Nested Paths inside Layout */}
            <Route index element={<HomePage sectionTitle="Trending Restaurants"></HomePage>}></Route>
            <Route path="/about" element={<AboutPage></AboutPage>}></Route>
            <Route path="/contact" element={<ContactPage></ContactPage>}></Route>
            <Route path="/profile" element={<ProfilePage></ProfilePage>}>
               {/* Nested path inside /profile index in the first route will get rendered when the path is at index(/profile) just that without anything after it */}
               <Route index element={<ProfileData></ProfileData>}></Route>
               <Route path="/profile/settings" element={<ProfileSettings></ProfileSettings>}></Route>
               <Route
                  path="/profile/votesHistory"
                  element={<ProfileVotesHistory></ProfileVotesHistory>}
               ></Route>
            </Route>
         </Route>
      </Routes>
   );
}

export default App;
