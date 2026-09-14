import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import TerminalRounded from "@mui/icons-material/TerminalRounded";
import LinkedIn from "@mui/icons-material/LinkedIn";
import { Button } from "@mui/material";

const achievements = [
  { title: "Modernizing enterprise software", detail: "Led a zero-downtime migration of a 100K+ line legacy system for GE Aerospace from Spring Boot 1.5 to 3.4 and Java 8 to 17. Redesigned authentication with Spring Security 6.x, improved performance by 30%, and eliminated 50+ critical CVEs.", tags: "Java · Spring Boot · Spring Security" },
  { title: "Turning AI into practical tools", detail: "Led HAVD Gurus to first place in the enterprise AI Friday Hackathon. Built a Python and AWS pipeline to analyze security logs, detect anomalies, and generate targeted remediation steps. Prototyped generative AI capabilities with LangChain and LLM agents in secure enterprise environments.", tags: "Python · AWS · LangChain" },
  { title: "Making data move faster", detail: "Built AWS serverless pipelines and optimized scheduling for 60,000+ manufacturing records, reducing processing from two months to 15 days. PostgreSQL functions, parallel processing, and caching drove a 75% reduction in processing time.", tags: "PostgreSQL · Serverless · Data engineering" },
  { title: "Building for production", detail: "Delivered caching strategies and dashboard workflows under tight production deadlines. Optimized Hibernate 6.x, batch processing, and connection pooling for a 40% transaction performance improvement. Implemented SPA routing and CORS policies for React and Angular integration.", tags: "Hibernate · REST APIs · CI/CD" },
];
const skills = [
  { category: "Languages", items: ["Java", "Python", "SQL", "PL/pgSQL", "Shell scripting"] },
  { category: "Frameworks", items: ["Spring Boot", "JPA", "Hibernate", "FastAPI", "Flask", "LangChain"] },
  { category: "Cloud & delivery", items: ["AWS", "S3", "Lambda", "EC2", "Docker", "Jenkins", "Git", "CI/CD"] },
  { category: "Data & architecture", items: ["PostgreSQL", "Query optimization", "REST APIs", "Microservices", "System design", "TDD"] },
];

export default function ResumePage() {
  const [showDocument, setShowDocument] = useState(false);
  return <div className="resume-page">
    <section className="resume-hero" aria-labelledby="resume-title">
      <div className="resume-intro"><div className="eyebrow">BACKEND ENGINEER · BUILDER · PROBLEM SOLVER</div>
        <h1 id="resume-title">Hi, I’m Vikrant.<br /><em>I build what’s next.</em></h1>
        <p className="resume-fullname">Vikrant Vijaybhai Joliya</p>
        <p className="resume-lead">Scalable backends. Thoughtful architecture. AI that makes a difference. I turn complex problems into software that works in the real world.</p>
        <div className="resume-actions"><a className="primary-button" href="/vikrant-joliya-resume.pdf" download><DownloadRounded fontSize="small" /> Download résumé</a><a className="resume-contact" href="mailto:vikrant.v.joliya@gmail.com">Let’s connect <ArrowOutwardRounded fontSize="small" /></a></div>
        <div className="resume-meta"><span><i /> Software Developer at TCS</span><span>Based in India</span></div>
      </div>
      <div className="resume-identity" aria-hidden="true"><div className="identity-grid" /><span className="identity-caption">ENGINEERED WITH INTENTION</span><img src="/vk-logo.svg" alt="" width="144" height="144" /><div className="identity-code"><span>01</span> design thoughtfully.<br /><span>02</span> build reliably.<br /><span>03</span> keep improving.</div><div className="identity-bottom"><TerminalRounded fontSize="small" /><span>JAVA / SPRING / AI</span><span>↗</span></div></div>
    </section>

    <section className="resume-metrics" aria-label="Selected career highlights"><div><strong>100K+</strong><span>lines of legacy code modernized</span></div><div><strong>75%</strong><span>less data processing time</span></div><div><strong>1st</strong><span>place · AI Friday Hackathon</span></div></section>

    <nav className="resume-jump-links" aria-label="Résumé sections"><a href="#experience">Experience</a><a href="#skills">Toolkit</a><a href="#education">Education</a><a href="#recognition">Recognition</a><a href="#resume-document">Full résumé <ArrowOutwardRounded fontSize="inherit" /></a></nav>

    <section className="resume-section" id="experience"><div className="resume-section-heading"><span className="eyebrow">01 / EXPERIENCE</span><h2>Building with impact.</h2><p>Enterprise engineering, with a builder’s mindset.</p></div><div className="experience-panel"><div className="experience-header"><div><span className="company-mark">TCS</span><div><h3>Software Developer</h3><p>Tata Consultancy Services · India</p></div></div><span className="experience-date">NOV 2023 — PRESENT</span></div><div className="achievement-grid">{achievements.map(item => <article key={item.title}><h4>{item.title}</h4><p>{item.detail}</p><span>{item.tags}</span></article>)}</div></div></section>

    <section className="resume-section" id="skills"><div className="resume-section-heading"><span className="eyebrow">02 / TOOLKIT</span><h2>The right tools. A solid foundation.</h2></div><div className="skills-grid">{skills.map(group => <article key={group.category}><h3>{group.category}</h3><div className="skill-tags">{group.items.map(item => <span key={item}>{item}</span>)}</div></article>)}</div></section>

    <section className="resume-section" id="education"><div className="resume-section-heading"><span className="eyebrow">03 / EDUCATION & RESEARCH</span><h2>Always a student.</h2></div><div className="education-panel"><div><h3>B.Tech. in Computer Science & Engineering</h3><p>Kalasalingam Academy of Research and Education</p><span>2019–2023 · First Class with Distinction</span></div><div className="education-grade"><strong>9.42<span>/10</span></strong><span>CGPA</span></div></div><div className="research-grid"><article><span className="eyebrow">IEEE CISES · 2023</span><h3>Honeypot Implementation for Enhanced Network Security using Docker and AWS</h3><p>Research on containerized cybersecurity infrastructure and cloud-native threat detection.</p></article><article><span className="eyebrow">IEEE ICOEI · 2022</span><h3>SOS Android Application for Emergency Response</h3><p>Location-based emergency response with real-time GPS tracking and automated alerts.</p></article></div></section>

    <section className="resume-section" id="recognition"><div className="resume-section-heading"><span className="eyebrow">04 / RECOGNITION</span><h2>Learning, put into practice.</h2></div><div className="certification-list">{["Claude Certified Architect — Foundations", "AWS Certified Developer — Associate (DVA-C02)", "AI Friday Hackathon — 1st place, 2025", "IBM SkillsBuild — Cyber Security & Forensics Graduate"].map((name, index) => <div key={name}><span className="certification-number">0{index + 1}</span><h3>{name}</h3><span aria-hidden="true">↗</span></div>)}</div></section>

    <section className="resume-document" id="resume-document"><div><span className="eyebrow">THE COMPLETE PICTURE</span><h2>My résumé, in full.</h2><p>Read the original one-page résumé or keep a copy.</p></div><div className="resume-actions"><Button variant="outlined" onClick={() => setShowDocument(value => !value)} aria-expanded={showDocument} aria-controls="resume-preview">{showDocument ? 'Hide résumé' : 'Read full résumé'}</Button><a className="primary-button" href="/vikrant-joliya-resume.pdf" download><DownloadRounded fontSize="small" /> Download PDF</a></div>{showDocument && <div id="resume-preview" className="resume-pdf-preview"><img src="/vikrant-joliya-resume.png" alt="Full résumé of Vikrant Vijaybhai Joliya. A downloadable text-selectable PDF is available above." loading="lazy" width="1160" height="1500" /></div>}</section>

    <section className="resume-connect"><span className="eyebrow">HAVE SOMETHING IN MIND?</span><h2>Let’s build something useful.</h2><div><a href="mailto:vikrant.v.joliya@gmail.com"><MailOutlineRounded fontSize="small" /> vikrant.v.joliya@gmail.com</a><a href="https://www.linkedin.com/in/vikrant-joliya/" target="_blank" rel="noopener noreferrer"><LinkedIn fontSize="small" /> LinkedIn <ArrowOutwardRounded fontSize="small" /></a></div><Link to="/workspace">Explore my personal workspace <ArrowOutwardRounded fontSize="small" /></Link></section>
  </div>;
}
