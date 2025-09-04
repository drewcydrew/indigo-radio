export interface PodcastEpisode {
  id: string;
  url: string;
  title: string;
  artist: string;
  show: string;
  artwork?: string;
  //duration: number;
  description?: string;
  //publishDate?: string;
}

export interface RadioProgram {
  id: string;
  name: string;
  description: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string;   // Format: "HH:MM" (24-hour)
  host?: string;
}

export interface ShowDefinition {
  showId: string;
  name: string;
  host?: string;
  hosts?: string[];
  frequency: string;
  duration?: string;
  description: string;
  genres?: string[];
  scope?: string;
  focus?: string;
  tagline?: string;
  mix?: string;
  style?: string;
  approach?: string;
  themes?: string[];
  featuredArtists?: string[];
  features?: string[];
  specialSegments?: {
    name: string;
    description: string;
  }[];
  type?: string;
  established?: string;
  demographic?: string;
  perspective?: string;
  schedule?: string;
}