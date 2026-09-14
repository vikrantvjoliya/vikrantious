import { Link } from "react-router-dom";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import GestureRounded from "@mui/icons-material/GestureRounded";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import { useAuth } from "../auth/AuthContext";
export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className="home-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">A CLEARER MIND STARTS HERE</div>
          <h1>{user ? "Welcome back." : "A space to make it yours."}</h1>
          <p>Your thoughts, sketches, and everyday essentials. All together.</p>
        </div>
        <Link className="primary-button" to="/text-notes">
          <AddRounded fontSize="small" /> Create a note
        </Link>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">
            <span /> LESS CLUTTER. MORE CLARITY.
          </span>
          <h2>
            Good ideas deserve
            <br />a little <em>space.</em>
          </h2>
          <p>
            A passing thought. A rough sketch. Something worth keeping.
            <br className="desktop-break" /> Give it a home, and get back to
            what matters.
          </p>
          <Link className="hero-link" to="/text-notes">
            Capture your first thought <ArrowForwardRounded fontSize="small" />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-star">✳</span>
          <div className="art-paper">
            <div className="paper-top">
              <span className="paper-dot" /> A LITTLE INSPIRATION
            </div>
            <div className="paper-title">
              Start small.
              <br />
              Think freely.
            </div>
            <div className="paper-lines">
              <i />
              <i />
              <i />
            </div>
            <span className="paper-signature">make room for possibility</span>
          </div>
          <div className="art-swatch">
            <GestureRounded />
            <span>let it flow.</span>
          </div>
          <span className="art-dot" />
        </div>
      </section>
      <section className="tools-section">
        <div className="section-heading">
          <h2>Your everyday toolkit</h2>
          <span>One place. A few possibilities.</span>
        </div>
        <div className="tool-grid">
          <Link to="/text-notes" className="tool-card">
            <div className="tool-card-top">
              <span className="tool-icon green">
                <DescriptionOutlined />
              </span>
              <ArrowOutwardRounded className="card-arrow" />
            </div>
            <h3>Put it into words.</h3>
            <p>
              From quick thoughts to your next big idea.
              <br /> Write it down, let it grow.
            </p>
            <div className="tool-card-bottom">
              Text notes <span>01</span>
            </div>
          </Link>
          <Link to="/drawing-notes" className="tool-card">
            <div className="tool-card-top">
              <span className="tool-icon peach">
                <GestureRounded />
              </span>
              <ArrowOutwardRounded className="card-arrow" />
            </div>
            <h3>Think outside the lines.</h3>
            <p>
              A blank canvas for a different perspective.
              <br /> Sketch, doodle, explore.
            </p>
            <div className="tool-card-bottom">
              Drawing studio <span>02</span>
            </div>
          </Link>
          <Link to="/file-notes" className="tool-card">
            <div className="tool-card-top">
              <span className="tool-icon lavender">
                <FolderOutlined />
              </span>
              <ArrowOutwardRounded className="card-arrow" />
            </div>
            <h3>Keep the good stuff.</h3>
            <p>
              The documents you need, right where
              <br /> you need them. Simply organized.
            </p>
            <div className="tool-card-bottom">
              File collection <span>03</span>
            </div>
          </Link>
        </div>
      </section>
      <section className="bottom-grid">
        <div className="workspace-intro">
          <span className="intro-symbol">↗</span>
          <div>
            <h3>A little intention goes a long way.</h3>
            <p>No perfect words needed. Start with whatever’s on your mind.</p>
          </div>
          <Link to="/text-notes" aria-label="Start a text note">
            <ArrowForwardRounded />
          </Link>
        </div>
        <Link to="/suika-game" className="game-teaser">
          <div className="fruit-art" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div>
            <span className="eyebrow">TAKE A BREATHER</span>
            <h3>A little play. A fresh perspective.</h3>
            <span className="game-teaser-link">
              Play Fruity Fall <ArrowForwardRounded fontSize="small" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}
