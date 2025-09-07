import { Platform } from 'react-native';
import TrackPlayer, { State } from 'react-native-track-player';
import { AudioState, WebAudioPlayerRef } from '../components/WebAudioPlayer';

export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string; // Add artwork property
}

class AudioService {
  private webAudioState: AudioState | null = null;
  private webAudioStateCallback: ((state: AudioState) => void) | null = null;
  private webAudioPlayerRef: WebAudioPlayerRef | null = null;
  private currentTrack: Track | null = null;
  private isTransitioning: boolean = false;

  // Set up web audio player reference
  setWebAudioPlayerRef(ref: WebAudioPlayerRef | null) {
    this.webAudioPlayerRef = ref;
  }

  // Set up web audio state listener
  setWebAudioStateListener(callback: (state: AudioState) => void) {
    this.webAudioStateCallback = callback;
  }

  updateWebAudioState(state: AudioState) {
    this.webAudioState = state;
    this.webAudioStateCallback?.(state);
  }

  async reset() {
    if (Platform.OS === 'web') {
      // Don't pause during reset - let the new source handle playback
      this.currentTrack = null;
      return;
    }
    return TrackPlayer.reset();
  }

  async add(track: Track) {
    if (Platform.OS === 'web') {
      // Store track info for web
      this.currentTrack = track;
      return;
    }
    return TrackPlayer.add(track);
  }

  async play() {
    if (Platform.OS === 'web') {
      // Only call play if we're not already transitioning
      if (!this.isTransitioning) {
        return this.webAudioPlayerRef?.play();
      }
      return;
    }
    return TrackPlayer.play();
  }

  async pause() {
    if (Platform.OS === 'web') {
      this.webAudioPlayerRef?.pause();
      return;
    }
    return TrackPlayer.pause();
  }

  async seekTo(position: number) {
    if (Platform.OS === 'web') {
      this.webAudioPlayerRef?.seekTo(position);
      return;
    }
    return TrackPlayer.seekTo(position);
  }

  // Add method to handle smooth transitions
  setTransitioning(transitioning: boolean) {
    this.isTransitioning = transitioning;
  }

  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  getProgress() {
    if (Platform.OS === 'web' && this.webAudioState) {
      return {
        position: this.webAudioState.position,
        duration: this.webAudioState.duration,
      };
    }
    // For mobile, this will be handled by useProgress hook
    return { position: 0, duration: 0 };
  }

  getPlaybackState() {
    if (Platform.OS === 'web' && this.webAudioState) {
      return {
        state: this.webAudioState.isPlaying ? State.Playing : State.Paused,
      };
    }
    // For mobile, this will be handled by usePlaybackState hook
    return { state: State.None };
  }
}

export const audioService = new AudioService();
export default audioService;
