import { mkdir, writeFile } from "node:fs/promises";
import { EdgeTTS } from "node-edge-tts";

const directory = new URL("./voice/", import.meta.url);
const narration = [
  ["intro", "Avec Louma, votre contrat de location est déjà prêt."],
  [
    "customize",
    "Ajoutez le logo de votre agence, changez la couleur et voyez le résultat en direct.",
  ],
  ["download", "Téléchargez le PDF pour l’imprimer ou le partager."],
] as const;

await mkdir(directory, { recursive: true });
const tts = new EdgeTTS({
  voice: "fr-FR-DeniseNeural",
  lang: "fr-FR",
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
