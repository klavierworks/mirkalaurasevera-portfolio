declare global {
  interface Window {
    requiresPreload: string[];
    hasPreloaded: boolean;
  }

  type ImageObject = {
    alt: string;
    src: string;
    width: number;
    height: number;
    aspectRatio: number;
    thumbnail: string;
  }

  type VideoObject = {
    url: string;
    width: number;
    height: number;
    mp4Url: string;
    hasAudio: boolean;
    fallback?: {
      width: number;
      height: number;
      link: string;
    };
  }

  type MediaObject = {
    image: ImageObject;
    video?: VideoObject
  }

  type Slide = {
    line1: string;
    line2: string;
    media: MediaObject
  }
  
  type UnprocessedProject = {
    order: number | string;
    title: string;
    description: string;
    media: {
      image: string;
      video: string;
      hasAudio: boolean;
    }[];
    thumbnail: {
      image: string;
      video: string;
    }
  }

  type Project = {
    id: string;
    title: string;
    slug: string;
    description: string;
    randomRotation: number;
    thumbnail: MediaObject;
    media: MediaObject[];
    order: number;
  }

  type VimeoVideoDetails = {
    "uri": string;
    "name": string;
    "description": string;
    "type": string;
    "link": string;
    "player_embed_url": string;
    "duration": number,
    "width": number,
    "language": null,
    "height": number,
    "created_time": string;
    "modified_time": string;
    "release_time": string;
    "content_rating": string[],
    "content_rating_class": string,
    "rating_mod_locked": boolean,
    "license": null,
    "pictures": {
      "uri": string;
      "active": boolean,
      "type": string;
      "base_link": string;
      "sizes": {
        "width": number;
        "height": number;
        "link": string;
        "link_with_play_button": string;
      }[],
      "resource_key": string;
      "default_picture": boolean
    },
    "tags": [],
    "stats": { "plays": number },
    "categories": [],
    "last_user_action_event_date": string;
    "play": {
      "progressive": VimeoProgressive[],
      "source": VimeoSource,
      "hls": {
        "link_expiration_time": string;
        "link": string;
      },
      "dash": {
        "link_expiration_time": string;
        "link": string;
      },
      "status": string;
    },
    "status": string;
    "resource_key": string;
    "is_playable": boolean,
    "has_audio": boolean
  }

  type VimeoFile = {
    "type": string,
    "width": number,
    "height": number,
    "link": string;
    "created_time": string;
    "fps": number,
    "size": number,
    "md5": string;
    "rendition": string;
  }

  type VimeoSource = VimeoFile & {
    "quality": string,
    "public_name": string;
    "size_short": string;
    "expires": string,
  }

  type VimeoProgressive = VimeoFile & {
    link_expiration_time: string;
    codec: string;
  }
}


export {
  Slide,
  UnprocessedSlide,
};
