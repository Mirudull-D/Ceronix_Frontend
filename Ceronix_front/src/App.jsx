import React from "react";
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import TeamSection from "./components/TeamSection.jsx";
import Footer from "./components/Footer.jsx";
import Detection from "./components/Detection.jsx";

function App() {
  return (
    <div className="App gradient-bg">
      <Navbar />
      <main>
        <Hero />
        <Detection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
