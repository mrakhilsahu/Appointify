import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-grid">
          <div className="hero-copy fade-up">
            <div className="hero-pill">
              <span className="pulse-dot" />
              Simple scheduling, thoughtfully designed
            </div>
            <h1>
              Make time for what <span>matters.</span>
            </h1>
            <p>
              Discover the right provider, choose a time that works for you,
              and book your appointment in a few simple steps.
            </p>
            <div className="hero-actions">
              <Link
                className="button button-dark button-large"
                to="/providers"
              >
                Find a provider <Icon name="arrow" size={18} />
              </Link>
              <Link
                className="button button-light button-large"
                to="/register"
              >
                Become a provider
              </Link>
            </div>
            <div className="hero-trust">
              <div className="mini-avatars">
                <span>AR</span>
                <span>SK</span>
                <span>RM</span>
              </div>
              <span>Simple booking for everyday appointments</span>
            </div>
          </div>

          <div className="hero-visual fade-up delay-1">
            <div className="hero-card main-calendar">
              <div className="hero-card-head">
                <div>
                  <span className="small-label">Your next appointment</span>
                  <strong>Tomorrow</strong>
                </div>
                <span className="calendar-chip">
                  <Icon name="calendar" size={18} />
                </span>
              </div>

              <div className="appointment-preview">
                <div className="date-block">
                  <strong>01</strong>
                  <span>OCT</span>
                </div>
                <div>
                  <strong>General Consultation</strong>
                  <span>Dr. Appointify · 10:00 AM</span>
                </div>
                <span className="status status-confirmed">Confirmed</span>
              </div>

              <div className="preview-line">
                <span>30 minute appointment</span>
                <span>10:00 — 10:30</span>
              </div>
            </div>

            <div className="hero-card floating-card card-one">
              <span className="float-icon">
                <Icon name="check" size={17} />
              </span>
              <div>
                <strong>Booking confirmed</strong>
                <span>Confirmation sent by email</span>
              </div>
            </div>

            <div className="hero-card floating-card card-two">
              <span className="float-icon">
                <Icon name="clock" size={17} />
              </span>
              <div>
                <strong>Flexible availability</strong>
                <span>Choose the time that suits you</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-white">
        <div className="container">
          <div className="center-heading">
            <p className="eyebrow">Why Appointify</p>
            <h2>Everything you need to book with confidence.</h2>
            <p>
              Designed to keep the experience clear for people booking
              appointments and providers managing their time.
            </p>
          </div>

          <div className="feature-grid">
            <Feature
              icon="search"
              title="Find the right provider"
              text="Search by provider or service and narrow down available options quickly."
            />
            <Feature
              icon="calendar"
              title="Book in a few clicks"
              text="Pick a service, choose an available slot, and confirm your appointment."
            />
            <Feature
              icon="mail"
              title="Stay informed"
              text="Get a confirmation by email and add the appointment to Google Calendar."
            />
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container split-section">
          <div>
            <p className="eyebrow">For providers</p>
            <h2>Turn your availability into a better booking experience.</h2>
            <p className="section-text">
              Create your services, add the time slots you are available, and
              keep every appointment in one organized place.
            </p>
            <Link className="button button-dark" to="/register">
              Start as a provider <Icon name="arrow" size={17} />
            </Link>
          </div>

          <div className="workflow-card">
            <Step
              number="01"
              title="Create your services"
              text="Define what you offer and how long it takes."
            />
            <Step
              number="02"
              title="Add your slots"
              text="Manually publish the times you want to make available."
            />
            <Step
              number="03"
              title="Manage bookings"
              text="See confirmed appointments and update their status."
            />
          </div>
        </div>
      </section>

      <section className="section section-white">
        <div className="container cta-card">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2>Find a time that works for you.</h2>
            <p>Start with a provider search and make your next appointment simple.</p>
          </div>
          <Link className="button button-dark button-large" to="/providers">
            Explore providers <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <span className="feature-icon">
        <Icon name={icon} size={21} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="step">
      <span>{number}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}
