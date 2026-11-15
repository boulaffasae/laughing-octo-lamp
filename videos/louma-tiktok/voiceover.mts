import { mkdir, writeFile } from "node:fs/promises";
import { EdgeTTS } from "node-edge-tts";

const directory = new URL("./voice/", import.meta.url);
const narration = [
  ["intro", "عندك وكالة كراء؟ عقدك واجد مع لُوما."],
  ["customize", "زيد اللوغو ديال الوكالة، بدّل اللون، وشوف التغييرات فالحين."],
  ["download", "حمّل العقد بي دي إف، وطبّعو ولا شاركو."],
] as const;

await mkdir(directory, { recursive: true });
const tts = new EdgeTTS({
  voice: "ar-MA-MounaNeural",
  lang: "ar-MA",
  rate: "+8%",
  timeout: 12000,
});
const requestedScenes = process.argv.slice(2);
for (const [scene, script] of narration) {
  if (requestedScenes.length && !requestedScenes.includes(scene)) continue;
  const chunks: Buffer[] = [];
  for await (const chunk of tts.streamAudio(script)) {
    if (Buffer.isBuffer(chunk)) chunks.push(chunk);
  }
  if (!chunks.length) throw new Error(`Empty narration for ${scene}`);
  await writeFile(new URL(`${scene}.mp3`, directory), Buffer.concat(chunks));
}
