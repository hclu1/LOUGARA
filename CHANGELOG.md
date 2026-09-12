# Journal des Modifications (Changelog)

Toutes les modifications notables apportées à ce projet sont consignées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [0.2.0] - 2026-09-12
### Ajouté
- Création complète de l'Espace Entrepreneurs (/entrepreneurs) : inscription acheteurs en base de données, annuaire des fournisseurs vérifiés, demandes de devis directes et publication d'appels d'offres.

## [0.1.4] - 2026-09-12
### Corrigé
- Suppression de toute génération artificielle d'email ou téléphone : extraction stricte des données réellement présentes sur le document.

## [0.1.3] - 2026-09-12
### Corrigé
- Correction de la reconnaissance du nom du représentant officiel : extraction exacte de JULIEN DUPÉ (au lieu de Doué).

## [0.1.2] - 2026-09-12
### Ajouté
- Auto-remplissage complet de l'Étape 4 (Coordonnées du représentant officiel : Nom, Email pro et Téléphone direct) dès la lecture optique du Kbis.

## [0.1.1] - 2026-09-12
### Corrigé
- Correction de l'extraction de l'activité Kbis (PORTAIL INTERNET) et classification automatique du secteur technologique.
