import React from "react";
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import TeamSection from "./components/TeamSection.jsx";
import Footer from "./components/Footer.jsx";
import Detection from "./components/Detection.jsx";
import Detection2 from "./components/Detection2.jsx";

function App() {
  return (
    <div className="App gradient-bg">
      <Navbar />
      <main>
        <Hero />
        <Detection />
        <Detection2 />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
