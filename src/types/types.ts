export interface PodcastEpisode {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration: number;
  description?: string;
  publishDate?: string;
}