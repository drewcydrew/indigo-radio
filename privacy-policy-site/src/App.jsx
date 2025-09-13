import { useState, useEffect } from 'react'
import PrivacyPolicy from './components/PrivacyPolicy'
import HomePage from './components/HomePage'
import ForegroundServices from './components/ForegroundServices'
import { 
  IoHomeOutline,
  IoDocumentTextOutline, 
  IoMenuOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [initialSection, setInitialSection] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({ privacy: true })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Hash-based navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      const path = window.location.pathname.replace(/^\/|\/$/g, '')
      let newActiveTab = 'home';
      if (path === 'privacy') newActiveTab = 'privacy';
      else newActiveTab = 'home';
      setActiveTab(newActiveTab);
      setInitialSection(hash || null);
    }
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const navigationStructure = [
    {
      key: 'home',
      title: 'App Name',
      icon: IoHomeOutline,
      color: '#666',
      hasSubsections: false
    },
    {
      key: 'privacy',
      title: 'Privacy Policy',
      icon: IoDocumentTextOutline,
      color: '#666',
      hasSubsections: false
    },
    {
      key: 'foreground-services',
      title: 'Foreground Services',
      icon: IoDocumentTextOutline,
      color: '#666',
      hasSubsections: false
    }
  ]

  // New navigation handler using hash and path
  const handleTabChange = (tab, section = null) => {
    setActiveTab(tab)
    if (section) {
      setInitialSection(section)
    } else {
      setInitialSection(null)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Update path and hash
    let path = '/';
    if (tab === 'privacy') path = '/privacy';
    else path = '/';
    const hash = section ? `#${section}` : '';
    window.history.pushState({}, '', `${path}${hash}`);
    if (isMobile) setIsSidebarOpen(false)
  }

  return (
    <div className="app-container">
      <div className="privacy-container">
        {/* Mobile header with hamburger menu */}
        {isMobile && (
          <div className="mobile-header">
            <button
              onClick={toggleSidebar}
              className="mobile-menu-button"
            >
              {isSidebarOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
            </button>
            <h3 className="mobile-title">
              {navigationStructure.find(item => item.key === activeTab)?.title || 'Home'}
            </h3>
          </div>
        )}

        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div
            className="mobile-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Unified Sidebar Navigation */}
        <div className={`unified-sidebar ${isMobile ? (isSidebarOpen ? 'mobile-open' : 'mobile-closed') : 'desktop'}`}>
          <div className="sidebar-header">
            <h2>Documentation</h2>
          </div>
          
          <nav className="sidebar-nav">
            <ul className="nav-list">
              {navigationStructure.map((section) => {
                const IconComponent = section.icon
                const isActive = activeTab === section.key
                const isExpanded = expandedSections[section.key]
                
                return (
                  <li key={section.key} className="nav-item">
                    <div className="nav-item-header">
                      <button 
                        onClick={() => handleTabChange(section.key)}
                        className={`nav-button ${isActive ? 'active' : ''}`}
                        style={{ color: isActive ? section.color : undefined }}
                      >
                        <IconComponent size={18} />
                        <span>{section.title}</span>
                      </button>
                      {section.hasSubsections && (
                        <button
                          onClick={() => toggleSection(section.key)}
                          className="expand-button"
                        >
                          {isExpanded ? <IoChevronDownOutline size={16} /> : <IoChevronForwardOutline size={16} />}
                        </button>
                      )}
                    </div>
                    
                    {section.hasSubsections && isExpanded && (
                      <ul className="subsection-list">
                        {section.subsections.map((subsection) => (
                          <li key={subsection.key} className="subsection-item">
                            <button 
                              onClick={() => handleTabChange(section.key, subsection.key)}
                              className="subsection-button"
                            >
                              {subsection.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className={`main-content ${isMobile ? 'mobile' : 'desktop'}`}>
          {/* Desktop header - only show title, no tabs */}
          {!isMobile && (
            <div className="desktop-header">
              <h1 className="page-title">
                {navigationStructure.find(item => item.key === activeTab)?.title || 'Home'}
              </h1>
            </div>
          )}

          <div className="content-container">
            {activeTab === 'home' ? (
              <HomePage heroImage="/app-icon.png" />
            ) : activeTab === 'privacy' ? (
              <PrivacyPolicy />
            ) : (
              <ForegroundServices />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;