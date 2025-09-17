function DataManagement() {
  const portalUrl = "https://radio-endpoint-39wh2bas6-drewcydrews-projects.vercel.app/";

  return (
    <div className="data-management-container">
      <h1 className="data-management-title">Data Management Portal</h1>
      <p className="data-management-description">
        The Data Management Portal is where podcast content and scheduling data is defined and can be updated. 
        This web-based interface allows for the management of all content that appears in the Indigo FM application.
      </p>
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
