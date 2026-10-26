import { registerRoot, Composition } from "remotion";
import { LoumaDemo } from "./louma-demo";
import { LoumaSansCheque } from "./louma-sans-cheque";

registerRoot(() => (
  <>
    <Composition
      id="LoumaTikTok"
      component={LoumaDemo}
      durationInFrames={810}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="LoumaSansCheque"
      component={LoumaSansCheque}
      durationInFrames={1260}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
));
