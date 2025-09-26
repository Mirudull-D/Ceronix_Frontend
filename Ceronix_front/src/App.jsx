import React from "react";
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import WorkSection from "./components/WorkSection.jsx";
import TeamSection from "./components/TeamSection.jsx";
import Footer from "./components/Footer.jsx";

function App() {
  return (
    <div className="App gradient-bg">
      <Navbar />
      <main>
        <Hero />
        <WorkSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
