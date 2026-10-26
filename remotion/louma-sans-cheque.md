# Louma — La confiance prend la route

Vidéo verticale française, 1080 × 1920, 30 images/s, 42 secondes. Typographie animée, transitions par ressort, illustrations vectorielles et musique instrumentale originale à 120 BPM. Aucun appel OCR, aucune donnée client, aucune agence présentée comme partenaire existant. La première vidéo reste disponible sous `LoumaTikTok` ; cette composition s’appelle `LoumaSansCheque`.

## Déroulé

| Temps       | Message                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–4,5 s     | « Laissez-nous juste un chèque… » : accroche et chèque barré.                                                                                  |
| 4,5–11 s    | L’acceptation consciente d’un chèque conservé en garantie sans encaissement immédiat est sanctionnée ; amende de 2 % pour celui qui l’accepte. |
| 11–16 s     | Pas de chèque en blanc : montant et bénéficiaire ne doivent pas rester vides.                                                                  |
| 16–22,5 s   | Préautorisation bancaire : vérifier montant, carte acceptée et déblocage.                                                                      |
| 22,5–28,5 s | Trois repères : sans chèque de garantie, contrat transparent, caution encadrée.                                                                |
| 28,5–35,5 s | « Chez Louma, nous sommes engagés pour une location plus claire. » Présentation de l’ambition Louma Partner.                                   |
| 35,5–42 s   | Invitation aux agences à construire le réseau ; invitation aux conducteurs à suivre les conseils Louma.                                        |

## Publication proposée

« Laissez-nous juste un chèque pour la caution. » Avant d’accepter, prenez le bon réflexe. Au Maroc, l’acceptation consciente d’un chèque à conserver en garantie sans encaissement immédiat est sanctionnée. La réforme de 2026 prévoit une amende de 2 % de sa valeur pour celui qui l’accepte.

Ne remettez jamais de chèque en blanc. Demandez des conditions de caution écrites : montant, moyen accepté, retenues et restitution.

Chez Louma, nous sommes **engagés pour une location plus claire**. Notre ambition : vous orienter vers des agences aux pratiques transparentes.

🤝 Vous êtes une agence ? Construisons ensemble **Louma Partner**.
🚗 Vous louez une voiture ? Suivez Louma pour connaître les bons réflexes.

Programme partenaire en préparation. La préautorisation dépend des conditions de l’agence et de votre banque.

#Louma #LocationVoitureMaroc #Caution #ChequeDeGarantie #LoumaPartner #VoyageMaroc

## Sources

- Base éditoriale : `content/actus/fr/caution-sans-cheque-maroc.md`.
- Vérification juridique le 26 octobre 2026 : [Ministère de la Justice / Observatoire national de la criminalité, communiqué sur la loi 71.24](https://onc.justice.gov.ma/ar/articles/entree-vigueur-loi-71-24-modifiant-completant-loi-15-95-code-commerce), rubrique « Chèque accepté à titre de garantie ». Réforme publiée au BO 7478 du 29 janvier 2026.
- La vidéo concerne cette pratique de garantie, et non l’illégalité du paiement par chèque en général. Elle ne présente pas une peine d’emprisonnement comme sanction actuelle de cette pratique.

## Proposition de positionnement Louma Partner

**Signature :** « La confiance prend la route. »

**Promesse à construire :** un repère privé fondé sur des engagements vérifiables, avec une charte publiée avant toute attribution. Les trois critères montrés dans la vidéo sont des critères proposés, pas une certification déjà délivrée :

1. Pas de chèque conservé à titre de garantie ; moyens de caution annoncés avant réservation.
2. Contrat et prix transparents : frais, assurance, franchise et conditions de retour écrits.
3. Caution traçable : justificatif, retenues documentées et conditions de restitution explicites.

Avant lancement : définir les preuves exigées, la revue des candidatures, la durée de validité, le traitement des réclamations et le retrait du statut. Louma Partner n’est pas une certification publique et ne garantit pas l’absence de litige. Aucun nombre d’agences, avis ou partenaire fictif n’est utilisé dans cette vidéo.

## Exports

- `npm run video:trust:render` : `output/video/louma-sans-cheque.mp4`.
- `npm run video:trust:still` : couverture `output/video/louma-sans-cheque-cover.png`.
- Pour Chrome installé, ajouter `-- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- Musique : `python3 scripts/create-video-audio.py --duration 42 --bpm 120 --output public/video/louma-trust-beat.wav`.

La vidéo utilise le texte à l’écran et une musique instrumentale ; aucune voix off n’est incluse.
