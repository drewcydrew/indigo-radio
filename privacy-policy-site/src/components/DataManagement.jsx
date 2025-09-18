function DataManagement() {
  const portalUrl = "https://indigoradio-data.onrender.com/";

  return (
    <div className="data-management-container">
      <h1 className="data-management-title">Data Management Portal</h1>
      <p className="data-management-description">
        In addition to the live radio stream URL, there are three data tables driving the application. These can be edited in the data portal by using the link below.<br /><br />
        Initial data has been populated manually from Indigo FM/Podmatic websites, and is subject to error.
      </p>
      
      <div className="data-types-section">
        <h2 className="data-types-title">Available Data Types</h2>

        <div className="data-type-item">
          <h3 className="data-type-heading">Live Radio Stream URL</h3>
          <p className="data-type-description">
            This defines the URL providing live radio. It's of the form 
            <code>https://internetradio.indigofm.au:8XXX/stream</code>, but the specific port number can change, 
            in which case it needs to be updated here.
          </p>
        </div>
        
        <div className="data-type-item">
          <h3 className="data-type-heading">Podcast Episodes</h3>
          <p className="data-type-description">
            Defines the available episodes for each podcast. This needs to use the correct show name for the app 
            to map it correctly. You can test the stream sources here by using the player.
          </p>
        </div>
        
        <div className="data-type-item">
          <h3 className="data-type-heading">Programme Schedule</h3>
          <p className="data-type-description">
            Defines the schedule for each day. This is used by the app to present the schedule. It is not actually 
            "functional" (this is what the app thinks is on, not necessarily what's actually playing).
          </p>
        </div>

        <div className="data-type-item">
          <h3 className="data-type-heading">Shows</h3>
          <p className="data-type-description">
            Defines the shows available for use in the schedule or podcast episode tables. Each show entry should use the correct show name so it can be referenced elsewhere in the app.
          </p>
        </div>
      </div>

      <div className="portal-link-container">
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="portal-link"
        >
          Access Data Management Portal
        </a>
      </div>
      <p className="portal-note">
        This portal is used for administrative purposes to manage the content and scheduling 
        information that feeds into the Indigo FM radio application.
      </p>
    </div>
  );
}

export default DataManagement;
