function ForegroundServices() {
  return (
    <>
      <p className="last-updated">Effective Date: {new Date().toLocaleDateString()}</p>

      <p className="introduction">
        Indigo FM uses foreground service permissions to ensure uninterrupted playback of audio content.
        This page explains why these permissions are necessary and how they are used.
      </p>

      <div className="section">
        <h2 className="section-title">1. What Are Foreground Services?</h2>
        <p className="paragraph">
          Foreground services are used by applications to perform tasks that are noticeable to the user,
          such as playing music or tracking location. These services ensure that the app remains active
          even when it is not in the foreground.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">2. Why Does Indigo FM Use Foreground Services?</h2>
        <p className="paragraph">
          Indigo FM uses foreground services to provide uninterrupted audio playback. This ensures that
          the app can continue streaming live radio or podcasts even if you switch to another app or lock
          your device.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">3. Permissions Required</h2>
        <p className="paragraph">
          To use foreground services, Indigo FM requires the following permissions:
        </p>
        <ul className="bullet-points">
          <li className="bullet-point">• Foreground service permission to keep the app active.</li>
          <li className="bullet-point">• Notification permission to display playback controls.</li>
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">4. User Control</h2>
        <p className="paragraph">
          You can stop the foreground service at any time by pausing playback or closing the app. The
          notification will disappear, and the app will no longer run in the background.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">5. Example of Foreground Service Usage</h2>
        <p className="paragraph">
          The video below demonstrates how Indigo FM uses foreground service permissions to provide
          seamless audio playback while the app is running in the background.
        </p>
        <div className="video-container">
          <video controls width="100%" height="auto">
            <source src="/example-foreground-service.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </>
  );
}

export default ForegroundServices;
