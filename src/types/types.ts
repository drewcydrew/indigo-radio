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