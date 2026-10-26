import { registerRoot, Composition } from "remotion";
import { LoumaDemo } from "./louma-demo";

registerRoot(() => (
  <Composition
    id="LoumaTikTok"
    component={LoumaDemo}
    durationInFrames={810}
    fps={30}
    width={1080}
    height={1920}
  />
));
