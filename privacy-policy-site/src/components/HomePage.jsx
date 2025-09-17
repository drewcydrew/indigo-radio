import { useState, useEffect } from 'react'
import { 
  IoLogoAndroid,
  IoLogoApple,
  IoGlobeOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoLibraryOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import './HomePage.css'

function HomePage({ heroImage }) {
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showAndroidInstall, setShowAndroidInstall] = useState(false);
  const [featuresCarouselIndex, setFeaturesCarouselIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const androidUrl = "https://play.google.com/apps/testing/com.drew92.indigoradio";
  const androidTestersGroupUrl = "https://groups.google.com/g/indigo-radio";
  const iosUrl = "https://testflight.apple.com/join/FJsnW24u";
  const webAppurl = "https://indigo-radio.onrender.com/";

  const features = [
    {
      image: "/live-radio.png",
      title: "Live Radio",
      description: "Stream live radio content."
    },
    {
      image: "/podcast.png",
      title: "Podcasts",
      description: "Listen to your favorite podcasts."
    }
  ];

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className={`hero-section ${isMobile ? 'mobile' : ''}`}>
        <div className={`hero-card ${isMobile ? 'mobile' : ''}`}>
          {heroImage ? (
            <img 
              src={heroImage} 
              alt="Application Logo" 
              className={`hero-logo ${isMobile ? 'mobile' : ''}`}
            />
          ) : (
            <IoLibraryOutline 
              size={isMobile ? 60 : 80} 
              className="hero-icon"
            />
          )}
          <h1 className="hero-title">
            Indigo Radio
          </h1>
          <p className={`hero-description ${isMobile ? 'mobile' : ''}`}>
            Indigo Radio is an in-development web and mobile application that connects to Indigo FM for live radio and podcast audio streaming.
          </p>
          
          {/* CTA Buttons */}
          <div className={`cta-buttons ${isMobile ? 'mobile' : ''}`}>
            <button
              className={`button-base button-android ${isMobile ? 'mobile' : ''}`}
              onClick={() => setShowAndroidPrompt(true)}
            >
              <IoLogoAndroid size={22} /> Install on Android
            </button>
            <a
              href={iosUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`button-base button-ios ${isMobile ? 'mobile' : ''}`}
            >
              <IoLogoApple size={22} /> Install on iOS
            </a>
            <a
              href={webAppurl}
              target="_blank"
              rel="noopener noreferrer"
              className={`button-base button-demo ${isMobile ? 'mobile' : ''}`}
            >
              <IoGlobeOutline size={22} /> Try Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">
            Key Features
          </h2>
          
          {/* Desktop: Grid Layout */}
          {!isMobile ? (
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="feature-image"
                  />
                  <div className="feature-overlay">
                    <h3 className="feature-title">
                      {feature.title}
                    </h3>
                    <p className="feature-description">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Mobile: Carousel Layout */
            <div className="features-carousel">
              <div 
                className="carousel-track"
                style={{ transform: `translateX(-${featuresCarouselIndex * 100}%)` }}
              >
                {features.map((feature, index) => (
                  <div key={index} className="carousel-slide">
                    <div className="carousel-card">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="feature-image"
                      />
                      <div className="feature-overlay">
                        <h3 className="feature-title">
                          {feature.title}
                        </h3>
                        <p className="carousel-description">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Overlay Buttons */}
              {featuresCarouselIndex > 0 && (
                <button
                  onClick={() => setFeaturesCarouselIndex(featuresCarouselIndex - 1)}
                  className="carousel-nav-button left"
                >
                  <IoChevronBackOutline size={32} />
                </button>
              )}
              
              {featuresCarouselIndex < features.length - 1 && (
                <button
                  onClick={() => setFeaturesCarouselIndex(featuresCarouselIndex + 1)}
                  className="carousel-nav-button right"
                >
                  <IoChevronForwardOutline size={32} />
                </button>
              )}
              
              {/* Carousel Controls */}
              <div className="carousel-controls">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setFeaturesCarouselIndex(index)}
                    className={`carousel-dot ${index === featuresCarouselIndex ? 'active' : 'inactive'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showAndroidPrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Download Information</h2>
            <p className="modal-description">
              In order to install the app, you must be a member of the testing group. Use the link below to join group.
            </p>
            <a
              href={androidTestersGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button-base modal-button"
            >
              <IoPeopleOutline size={20} /> Join Testing Group
            </a>
            <br />
            {!showAndroidInstall ? (
              <button
                onClick={() => setShowAndroidInstall(true)}
                className="button-base modal-button modal-button-continue"
              >
                <IoLogoAndroid size={20} /> Continue to Download
              </button>
            ) : (
              <a
                href={androidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-base modal-button modal-button-continue"
              >
                <IoLogoAndroid size={20} /> Download App
              </a>
            )}
            <br />
            <button
              onClick={() => { setShowAndroidPrompt(false); setShowAndroidInstall(false); }}
              className="button-base modal-button-close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage