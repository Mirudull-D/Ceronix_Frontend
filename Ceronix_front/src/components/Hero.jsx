import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero-container">
      <div className="hero-content">
        <h1>
          Counterfeit Component <span className="highlight-pink">Detection</span>
        </h1>
        <p>
          Using <span className="highlight-yellow">AI-driven</span> methods to detect
          counterfeit ICs and connectors based on{' '}
          <span className="highlight-purple">image</span> and{' '}
          <span className="highlight-purple">electrical</span> data.
        </p>
      </div>
    </section>
  );
};

export default Hero;
