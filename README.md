# Louma

Louma aide les agences à préparer des contrats de location de voiture en français ou en arabe. Le PDF se génère dans le navigateur. L’agence peut le télécharger, le partager comme pièce jointe ou l’ouvrir pour l’imprimer. Le fichier téléchargé reste lisible hors ligne.

## Démarrage local

Avec Node.js 24, lancez `npm ci` puis `npm run dev`. Ouvrez `http://localhost:3000/fr` ou `/ar`. Les dossiers privés se trouvent sous `/{locale}/mes-fichiers`.

Copiez `.env.example` vers `.env.local` et renseignez les services utilisés.

- **Clerk** : configurez la clé publique et la clé secrète pour les fenêtres d’inscription et de connexion. Sur Vercel, fournissez les valeurs de l’instance Clerk associée au domaine.
- **Neon** : configurez `DATABASE_URL` et appliquez [db/001_documents.sql](db/001_documents.sql) à la base cible, par exemple avec `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/001_documents.sql`.
- **Vercel Blob** : créez ou rattachez un espace d’accès **privé** au projet pour utiliser `BLOB_STORE_ID` avec OIDC. Pour un environnement sans OIDC, configurez `BLOB_READ_WRITE_TOKEN`. Les objets existants d’un espace public doivent rester séparés du dossier Louma.
- **Datalab** : configurez `DATALAB_API_KEY` pour le préremplissage. Le formulaire indique à l’utilisateur que l’import OCR transmet le PDF à Datalab. Les réglages de région et de rétention sont gérés dans le compte fournisseur.
- **Liens publics** : configurez `NEXT_PUBLIC_CONTACT_EMAIL` si disponible. Les badges des boutiques et les réseaux sans compte sont affichés sans lien ; seul TikTok est actif. Complétez les informations sur l’exploitant du site dans les mentions légales avant publication.

Le formulaire manuel et le téléchargement local fonctionnent sans compte. L’enregistrement et l’import dans le tableau de bord exigent un compte et les services privés configurés. Le navigateur conserve le brouillon en mémoire pendant la connexion dans la fenêtre Clerk.

## Données et vérification

Les API vérifient le compte Clerk et la propriété des fichiers. Neon stocke les métadonnées techniques et la référence privée. Les uploads PDF sont limités à 4 Mio, validés par signature et téléchargés en pièce jointe depuis le serveur. Les réponses du dossier privé ne sont pas mises en cache. Le filtre utilise la date d’ajout dans le fuseau `Africa/Casablanca`.

L’OCR conserve sa validation des uploads, ses délais et sa limite concurrente par instance. Pour imposer un quota sur plusieurs instances Vercel, configurez une règle de limitation sur `POST /api/ocr`. Le test OCR live facultatif envoie un document synthétique facturable avec `node --env-file=.env.local scripts/smoke-ocr.mjs`.

Lancez `npm run check` et `npm run build` avant de pousser. Pour le test d’intégration en environnement configuré, créez un PDF en FR et en AR, vérifiez le téléchargement hors ligne, puis enregistrez-le et vérifiez que l’URL de téléchargement renvoie une erreur pour un second compte. Testez aussi l’import et une période dont le premier et le dernier jour contiennent chacun un PDF.

Voir [l’organisation du code](docs/code-organization.md).
