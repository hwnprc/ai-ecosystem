import { Composition } from "remotion";
import { Promo } from "./Promo";
import { FPS, script, sec } from "./script";

// Two versions of the same video: square for the X feed, wide for 16:9 players.
export const RemotionRoot = () => (
  <>
    <Composition id="Promo" component={Promo} defaultProps={{ layout: "square" as const }} durationInFrames={sec(script.duration)} fps={FPS} width={1080} height={1080} />
    <Composition id="PromoWide" component={Promo} defaultProps={{ layout: "wide" as const }} durationInFrames={sec(script.duration)} fps={FPS} width={1920} height={1080} />
  </>
);
