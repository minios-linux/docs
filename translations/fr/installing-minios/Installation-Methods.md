---
updated: 2026-08-31
---

# Méthodes d’installation

MiniOS est un système d’exploitation orienté live. Installer MiniOS signifie généralement placer son système live modulaire sur un support amovible ou un autre disque, donc écrire ou copier MiniOS sur une clé USB constitue déjà une méthode d’installation, et non une simple préparation pour une installation ultérieure.

Il existe deux grandes familles d’installation :

- **Installation live** : conserve la pile de modules MiniOS, la configuration au démarrage, la persistance de session et les workflows de gestion MiniOS. L’écriture d’image brute, l’installation basée sur des fichiers, Ventoy et le mode Live du Programme d’installation MiniOS produisent tous des moyens d’exécuter le système live MiniOS.
- **Installation native** : conversion optionnelle effectuée par le [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer). Elle crée un bureau Debian conventionnel à partir de l’image MiniOS sélectionnée, en conservant son environnement de bureau, son identité visuelle et ses applications classiques, tout en supprimant les logiciels spécifiques à MiniOS qui existent pour l’architecture live.

## Télécharger et vérifier l’ISO

Téléchargez une ISO depuis le [site officiel](https://minios.dev), la page officielle des [releases GitHub](https://github.com/minios-linux/minios-live/releases), ou [SourceForge](https://sourceforge.net/projects/minios-linux/). Vérifiez l’image avant de l’écrire sur un périphérique ; consultez [Vérification des téléchargements](/installing-minios/Verifying-Downloads).

## Installer MiniOS sur un support amovible

Choisissez la méthode selon la disposition souhaitée sur le périphérique cible :

| Résultat | Méthode | Ce que vous obtenez |
|---|---|---|
| Système de fichiers inscriptible classique qui démarre aussi MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) en mode ISO ou [installation manuelle basée sur des fichiers](/installing-minios/Manual-File-Based-Installation) | Fichiers MiniOS et chargeur d’amorçage sur un système de fichiers classique ; l’espace restant reste utilisable pour des fichiers ordinaires |
| Périphérique multiboot avec prise en charge de la persistance MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | Partition de données Ventoy pour les fichiers ISO plus prise en charge de session persistante MiniOS |
| Installation modulaire MiniOS gérée | [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) en mode **Live** | Agencement modulaire MiniOS avec stockage persistant optionnel configuré par l’installateur |
| Copie exacte bloc à bloc de l’ISO publié | [Rufus](/installing-minios/installation-tools/Rufus) en mode DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility), ou [`dd`](/installing-minios/installation-tools/dd) | Disposition des blocs ISO à l’identique ; simple et prévisible, mais le support ne se comporte plus comme une clé USB classique polyvalente |

::: danger L’écriture d’image brute écrase la disposition cible
Le mode DD Rufus, Etcher, l’écriture d’image via Utilitaire de disque et `dd` remplacent la disposition des blocs existante du périphérique. Vérifiez le modèle et la capacité du support cible et sauvegardez tout ce qui est important avant de commencer. Cet avertissement ne concerne pas le mode ISO Rufus, Ventoy ou une installation basée sur des fichiers.
:::

## Démarrer la session live

1. Redémarrez l’ordinateur et ouvrez le menu de démarrage du firmware.
2. Sélectionnez le périphérique USB ou un autre média amorçable.
3. Lancez MiniOS et vérifiez que le stockage, le réseau et les périphériques d’entrée fonctionnent comme prévu.

Les paramètres du firmware varient selon l’ordinateur. Une image MiniOS peut démarrer via BIOS ou UEFI ; la cible d’un déploiement ultérieur par le Programme d’installation MiniOS n’est pas limitée à MBR.

Utilisez [Modes de démarrage](/using-minios/Boot-Modes) comme guide de référence pour le comportement du démarrage live. Si le démarrage initial ne trouve pas l’image ou ses modules, consultez [Découverte système Initrd](/reference/boot-process/System-Discovery).

## Choisir une disposition installée

Depuis la session live, lancez le [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) lorsque vous souhaitez installer le système sur une autre clé USB, un SSD ou un disque dur.

- **Mode live** : préserve la pile de modules compressés, la disposition de démarrage MiniOS, les outils de gestion MiniOS et la persistance de session en option. Choisissez cette option si vous souhaitez MiniOS lui-même sur le disque cible.
- **Mode natif** : déploie l’image sélectionnée en un bureau Debian classique inscriptible. Le disque cible conserve l’environnement de bureau, l’identité visuelle et les applications classiques de l’édition sélectionnée, tandis que le runtime live MiniOS et les outils de gestion spécifiques au mode live sont supprimés. Le système installé utilise un initramfs Debian conventionnel, un chargeur d’amorçage, les paquets du noyau et le workflow de gestion des paquets Debian.

::: warning L’installation native utilise un modèle système différent
L’architecture caractéristique de MiniOS est le système live modulaire décrit dans [À propos de MiniOS](/getting-started/About-MiniOS). Le mode natif conserve l’expérience de bureau MiniOS familière, incluant son identité visuelle, son environnement de bureau et ses applications classiques, mais convertit le système en une installation Debian conventionnelle. Les outils spécifiques à MiniOS pour les sessions, modules, noyaux modulaires et autres workflows live sont supprimés, car ces fonctionnalités ne s’appliquent plus. Choisissez une installation live si vous souhaitez l’ensemble complet des fonctionnalités MiniOS.
:::

La persistance live est préparée au tout début du démarrage ; le comportement détaillé est décrit dans [Persistance Initrd](/reference/boot-process/Persistence-Internals). Elle ne s’applique plus après une conversion native.

L’installateur prend en charge automatiquement les dispositions BIOS/MBR, UEFI/MBR et UEFI/GPT. Le BIOS sur GPT n’est pas pris en charge par l’installateur actuel. Consultez [Utiliser le Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) pour les limites de placement, de système de fichiers, de persistance et de partitionnement.
