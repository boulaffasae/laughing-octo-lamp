# Louma — refonte de l’accueil et de l’espace PDF

## Accueil et contrat

- Prévoir une interface blanche et bleue, en français et en arabe RTL, sur ordinateur et mobile.
- Afficher le logo Louma, le choix de la langue et l’accès au compte. « Créer un contrat » mène au formulaire intégré à l’accueil.
- Organiser le formulaire en cinq étapes avec des jalons numérotés. La première étape contient l’éditeur pleine largeur, le remplacement du logo, le texte modifiable, le déplacement des blocs et l’aperçu. Les étapes suivantes recueillent l’identité, le véhicule et les dates et tarifs. L’OCR importe un PDF, affiche son aperçu et préremplit les champs encore modifiables.
- L’écran final propose « Télécharger » et « S’inscrire pour enregistrer », ou « Enregistrer » après connexion. Le téléchargement produit un PDF autonome. Les outils secondaires permettent de remettre le fichier via le menu de partage de l’appareil ou de l’ouvrir pour l’imprimer. Le locataire peut utiliser sa copie hors ligne sans compte.
- Présenter les badges Android et iOS dans une section compacte en deux colonnes. Le pied de page présente les icônes sociales sous le logo et les liens d’information à côté de la connexion.

## Espace de l’agence

- Utiliser Clerk pour la connexion et la reprise du brouillon en mémoire. Protéger le tableau de bord et contrôler le propriétaire de chaque PDF côté serveur.
- Stocker les fichiers PDF dans Vercel Blob privé et leurs références et métadonnées techniques dans Neon. Les pièces transmises uniquement à l’OCR ne rejoignent pas le dossier de l’agence.
- Ouvrir « Mes fichiers » / « ملفاتي » sur un bandeau d’import PDF pleine largeur, puis une grille de cartes avec date d’ajout et icône de téléchargement. Utiliser un champ de période unique qui ouvre le calendrier de dates de début et de fin inclusives.

## Nettoyage et déploiement

- Supprimer le blog, sa navigation, son contenu et ses dépendances. Rediriger l’ancien parcours `/new` vers le formulaire. Retirer l’anglais.
- Vérifier le build, le parcours public dans les deux langues et la protection des routes. Appliquer la migration Neon sur la base cible et vérifier le stockage et l’isolation des comptes dans l’environnement configuré.
- Configurer le lien App Store et les coordonnées officielles lorsqu’ils sont disponibles.
