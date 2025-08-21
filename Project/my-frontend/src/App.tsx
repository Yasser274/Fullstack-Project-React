import { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom"; // this so i can route between pages

// LAYOUT Component
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";

function App() {
   return (
      <Routes>
         <Route path="/" element={<Layout></Layout>}>
            {/* Layout has many links inside it that's why i nested these route below it so when the path is /about we get the AboutPage Component */}
            <Route index element={<HomePage sectionTitle="Trending Restaurants"></HomePage>}></Route>
            <Route path="/about" element={<AboutPage></AboutPage>}></Route>
            <Route path="/contact" element={<ContactPage></ContactPage>}></Route>
         </Route>
      </Routes>
   );
}

export default App;
