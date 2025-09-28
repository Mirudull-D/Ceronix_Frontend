 import React from 'react';
import './WorkSection.css';
import Detection from './Detection';
import Detection3 from './detection3.jsx';

const WorkSection = () => {
  return (
    <section id="detector" className="work-section-container">
      <h2 className="work-section-main-title">Visual Analysis Tools</h2>
      <div className="work-section-content">
        {/* Render both detector components side-by-side */}
        <Detection />
        <Detection3 />
      </div>
    </section>
  );
};

export default WorkSection;
