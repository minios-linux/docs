---
updated: 2026-08-26
---

# À propos de MiniOS

MiniOS est une distribution Linux basée sur Debian, conçue pour fonctionner à partir d’un support amovible ou d’un disque local. Son système en lecture seule est assemblé à partir de modules SquashFS, avec des sessions optionnelles en écriture pour les fichiers, les paramètres et les paquets installés. MiniOS prend en charge les systèmes x86 64 bits et peut démarrer en mode UEFI ou BIOS hérité.

## Modèle système

- Le système de base et les logiciels optionnels sont des modules distincts. Les modules peuvent être sélectionnés au démarrage ou ajoutés sans devoir reconstruire l’ensemble du système.
- Une session live fraîche laisse les modules de base inchangés.
- La persistance peut enregistrer les modifications dans un répertoire natif, un conteneur DynFileFS extensible, une image brute de taille fixe ou un conteneur LUKS chiffré, selon l’installation et le système de fichiers cible.
- L’installateur MiniOS peut réaliser une installation live modulaire ou, lorsque l’image le permet, déployer une installation Linux native classique.

Consultez [Modes de démarrage](/configuration/Boot-Modes.md) pour le guide de référence du comportement en session live et [Architecture du système](/about/System-Architecture.md) pour la structure du démarrage et des modules. Les contrats détaillés du démarrage initial sont documentés dans [découverte du système initrd](/configuration/Initrd-System-Discovery.md), [chargement des modules initrd](/configuration/Initrd-Module-Loading.md) et [persistance initrd](/configuration/Initrd-Persistence.md).

## Éditions

Les éditions disponibles dépendent de la version et de la distribution de base :

- **Flux** utilise l’environnement Flux et un ensemble de paquets réduit. Elle convient aux systèmes où une sélection logicielle plus restreinte est privilégiée.
- **Standard** est l’édition polyvalente. Les versions actuelles standard de Debian et Ubuntu utilisent Xfce.
- **Toolbox** ajoute des outils d’administration système, de stockage, de diagnostic et de récupération.
- **Ultra** propose un ensemble d’applications plus large en complément des autres éditions.

Xfce est l’environnement de bureau habituel dans les images Standard, Toolbox et Ultra, mais ce n’est pas le seul environnement MiniOS. L’édition Flux utilise Fluxbox, et certaines configurations prises en charge peuvent proposer d’autres environnements. Consultez la description de la version avant de télécharger si le choix de l’environnement de bureau est important pour vous.

Pour la liste des logiciels inclus dans chaque édition, consultez la [liste des paquets](/administration/Packages.md) et [Applications et outils MiniOS](/about/MiniOS-Applications.md).

## Installation et persistance

Une ISO peut être écrite comme image amorçable, copiée sur un périphérique multiboot ou installée avec MiniOS Installer. Ces méthodes n’ont pas toutes le même comportement de stockage. Les outils d’écriture d’image comme `dd` et Etcher reproduisent la structure de l’ISO ; Ventoy démarre le fichier ISO ; MiniOS Installer peut allouer et configurer un espace de stockage en écriture pour la session. Ne supposez pas qu’une méthode d’écriture active la persistance.

Commencez par le [Démarrage rapide](/installation/Quick-Start.md) et suivez le guide correspondant à la méthode d’installation choisie. La persistance peut aussi être sélectionnée depuis un menu de démarrage adapté ou configurée via les paramètres de démarrage documentés lorsque le stockage en écriture est disponible. Consultez [Modes de démarrage](/configuration/Boot-Modes.md) pour le comportement de la session live résultante et [Gestion de session](/configuration/Session-Management.md) pour les options de stockage.

## Ressources du projet

- [Site web MiniOS](https://minios.dev)
- [Code source](https://github.com/minios-linux/minios-live)
- [Gestionnaire de tickets](https://github.com/minios-linux/minios-live/issues)
- [Foire aux questions](/about/FAQ.md)
