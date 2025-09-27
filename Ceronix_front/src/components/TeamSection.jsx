import React, { useEffect, useRef } from "react";
import "./TeamSection.css";
// Make sure you have an image in the assets folder
import memberPhoto from "../assets/background.png";

const teamMembers = [
  {
    name: "Krishnan",
    role: "Frontend Lead",
    intro: "Passionate about creating modern and intuitive user interfaces.",
    photo: memberPhoto,
  },
  {
    name: "Raghav",
    role: "AI/ML Engineer",
    intro: "Expert in building and training deep learning models.",
    photo: memberPhoto,
  },
  {
    name: "Mridull",
    role: "Backend Developer",
    intro: "Manages the data pipelines and server-side logic.",
    photo: memberPhoto,
  },
  {
    name: "Rohith",
    role: "IOT",
    intro: "Audrino Enthusiast",
    photo: memberPhoto,
  },
  {
    name: "Sanjit",
    role: "Hardware Lead",
    intro: "Ensures the hardware components are top-notch and reliable.",
    photo: memberPhoto,
  },
  {
    name: "Sai Koushik",
    role: "UI/UX Designer",
    intro: "Designs user-friendly and visually appealing interfaces.",
    photo: memberPhoto,
  },
];

const TeamSection = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    cardsRef.current.forEach((card) => {
      if (card) {
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="team" className="team-container">
      <h2 className="team-title">
        <span className="title-line-wrapper">Meet With Our</span>
        <span className="highlight-team">Team</span>
      </h2>
      <div className="team-cards-container">
        {teamMembers.map((member, index) => (
          <div
            className="team-card"
            key={index}
            ref={(el) => (cardsRef.current[index] = el)}
            style={{ animationDelay: `${index * 0.45}s` }}
          >
            <h3 className="team-card-name">{member.name}</h3>
            <p className="team-card-role">{member.role}</p>
            <p className="team-card-intro">{member.intro}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
