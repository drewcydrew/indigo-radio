import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  // This service will be dedicated to music playback management when
  // the app is in the background. It will be called when the app is paused.
  
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('Remote play event');
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log('Remote pause event');
    await TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.log('Remote stop event');
    await TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async ({ position }) => {
    console.log('Remote seek event to position:', position);
    await TrackPlayer.seekTo(position);
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    console.log('Remote next event');
    // Add logic for next track if needed
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    console.log('Remote previous event');
    // Add logic for previous track if needed
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async ({ interval }) => {
    console.log('Remote jump forward event:', interval);
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(position + interval);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async ({ interval }) => {
    console.log('Remote jump backward event:', interval);
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(Math.max(0, position - interval));
  });

  // Handle playback state changes
  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    console.log('Playback state changed to:', state);
  });

  // Handle playback errors
  TrackPlayer.addEventListener(Event.PlaybackError, ({ error }) => {
    console.error('Playback error:', error);
  });

  // Handle track changes
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, ({ nextTrack }) => {
    console.log('Track changed to:', nextTrack);
  });
};