export interface MediaItem {
  id: string;
  type: 'photo' | 'video' | 'gif';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  formats?: Array<{
    url: string;
    container?: string;
    quality?: string;
    width?: number;
    height?: number;
    bitrate?: number;
  }>;
}

export interface TweetAuthor {
  name: string;
  screenName: string;
  avatarUrl: string;
  verified?: boolean;
}

export interface TweetInfo {
  id: string;
  url: string;
  text: string;
  createdAt: string;
  likes: number;
  reposts: number;
  replies: number;
  author: TweetAuthor;
  media: MediaItem[];
}
