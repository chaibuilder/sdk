import * as React from "react";
import { VideoIcon } from "@radix-ui/react-icons";
import { get, isEmpty, omit, pick } from "lodash-es";
import EmptySlot from "./empty-slot.tsx";
import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";

export type VideoBlockProps = {
  styles: ChaiStyles;
  url: string;
  controls: Record<string, any>;
  inBuilder: boolean;
};

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?youtube\.com\/(watch\?v=|embed\/)([a-zA-Z0-9_-]{11})/;
const VIMEO_REGEX = /^(https?:\/\/)?(www\.)?player.vimeo\.com/;
const DAILYMOTION_REGEX = /^(https?:\/\/)?(www\.)?dailymotion\.com\/(video|embed\/video)\/([a-zA-Z0-9_-]+)/;

const getEmbedURL = (url: string): string | null => {
  if (YOUTUBE_REGEX.test(url)) {
    const match = url.match(YOUTUBE_REGEX);
    if (match) {
      const videoId = match[4];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  }

  if (VIMEO_REGEX.test(url)) {
    const match = url.match(VIMEO_REGEX);
    if (match) {
      const videoId = match[3];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  }

  if (DAILYMOTION_REGEX.test(url)) {
    const match = url.match(DAILYMOTION_REGEX);
    if (match) {
      const videoId = match[4];
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }
    return url;
  }

  return null;
};

const VideoBlock = React.memo((props: ChaiBlockComponentProps<VideoBlockProps>) => {
  const { blockProps, inBuilder, styles, url, controls } = props;

  const autoplay = get(controls, "autoPlay", false);
  const _controls = get(controls, "controls", false);
  const muted = autoplay || get(controls, "muted", true);
  const loop = get(controls, "loop", false);

  if (isEmpty(url)) return <EmptySlot inBuilder={inBuilder} className="h-36" />;

  let embedURL = getEmbedURL(url);
  let videoElement = null;
  if (embedURL) {
    if (!isEmpty(embedURL)) {
      const iframeControls = [];
      iframeControls.push(`autoplay=${autoplay ? 1 : 0}`);
      iframeControls.push(`controls=${controls ? 1 : 0}`);
      iframeControls.push(`mute=${muted ? 1 : 0}&muted=${muted ? 1 : 0}`);
      iframeControls.push(`loop=${loop ? 1 : 0}`);
      embedURL = `${embedURL}?${iframeControls.join("&")}`;
    }
    videoElement = React.createElement("iframe", {
      ...blockProps,
      className: "absolute inset-0 w-full h-full",
      src: embedURL,
      allow: inBuilder ? "" : "autoplay *; fullscreen *",
      allowFullScreen: true,
      frameBorder: 0,
    });
  } else {
    videoElement = React.createElement("video", {
      ...blockProps,
      className: "absolute inset-0 w-full h-full",
      src: url,
      controls: _controls,
      muted,
      autoPlay: inBuilder ? false : autoplay,
      loop,
    });
  }

  return (
    <div {...pick(styles, ["className"])}>
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: "56.25%" }}>
        {inBuilder ? (
          <div {...blockProps} {...omit(styles, ["className"])} className="absolute inset-0 z-20 h-full w-full" />
        ) : null}
        {videoElement}
      </div>
    </div>
  );
});

const Config = {
  type: "Video",
  label: "Video",
  category: "core",
  icon: VideoIcon,
  group: "media",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      url: {
        type: "string",
        title: "Video URL",
        default: "https://www.youtube.com/watch?v=9xwazD5SyVg&ab_channel=MaximilianMustermann",
      },
      controls: {
        type: "object",
        title: "Controls",
        default: {
          autoplay: false,
          controls: true,
          loop: false,
          muted: false,
        },
        properties: {
          autoplay: {
            type: "boolean",
            title: "Autoplay",
            default: false,
          },
          controls: {
            type: "boolean",
            title: "Show Controls",
            default: true,
          },
          loop: {
            type: "boolean",
            title: "Loop Video",
            default: false,
          },
          muted: {
            type: "boolean",
            title: "Muted",
            default: false,
          },
        },
      },
    },
  }),
  i18nProps: ["url"],
};

export { VideoBlock as Component, Config };
