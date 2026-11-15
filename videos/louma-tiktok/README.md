# Louma · TikTok en arabe

La composition HyperFrames dure 16 secondes et utilise le format vertical
1080 × 1920. Elle reprend le logo, les couleurs et le modèle recto verso de
Louma. Les textes animés utilisent Cairo, comme sur le site. La voix de
synthèse Mouna lit le script en darija. La démo utilise des données fictives.

Avec Node.js, Chrome et FFmpeg installés, lancez depuis la racine du dépôt :

- `npm run video:preview` pour ouvrir la composition dans HyperFrames Studio.
- `npm run video:render` pour exporter le MP4 dans `output/video/louma-tiktok-ar.mp4`.

Les trois pistes audio sont incluses dans `voice/`. Pour les régénérer, lancez
`npm run video:voice`. La commande utilise le service de lecture à voix haute
d’Edge et nécessite une connexion Internet.

Le fichier `index.html` contient les scènes et leur animation. Les éléments
graphiques du site sont copiés à chaque exécution.
