# Organisation du code

- `app/[locale]/` compose l’accueil, le tableau de bord et les pages d’information en français et arabe.
- `app/components/louma/` contient la navigation, le parcours du contrat, l’intégration client Clerk et le tableau de bord.
- `lib/contract/` définit les données utilisées par l’éditeur, le PDF et le client OCR.
- `app/components/contract/contract-pdf.tsx` rend le PDF dans le navigateur et charge la police embarquée depuis `public/fonts/`.
- `app/api/documents/`, `lib/document-storage.ts` et `db/` contiennent les opérations privées, les contrôles de session et la migration Neon.
- `app/api/ocr/` et `lib/ocr/` contiennent la validation, l’extraction Datalab et la gestion des erreurs OCR.

Les secrets restent côté serveur. Les journaux et métadonnées techniques ne doivent contenir ni texte OCR, ni nom de locataire, ni numéro de pièce d’identité. Les changements de schéma se font par migration SQL et les accès aux PDF se font par identifiant après vérification du propriétaire.

Exécutez `npm run check` puis `npm run build`. Utilisez des données fictives pour les tests manuels et la vérification de l’OCR.
