---
updated: 2026-10-15
---

# Méthodes d’installation

MiniOS est un système d’exploitation qui privilégie le mode live. Installer MiniOS consiste généralement à placer son système live modulaire sur un support amovible ou un autre disque. Écrire ou copier MiniOS sur une clé USB constitue donc une méthode d’installation à part entière, et non une simple préparation à une installation ultérieure.

Il existe deux grandes familles d’installation :

- **Installation live** conserve la pile de modules MiniOS, la configuration au démarrage, la persistance des sessions et les workflows de gestion de MiniOS. L’écriture d’une image brute, l’installation à partir de fichiers, Ventoy et le mode live du Programme d’installation MiniOS permettent tous d’exécuter le système live MiniOS.
- **Installation native** est une conversion facultative effectuée par [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer). Elle crée un environnement de bureau Debian classique à partir de l’image MiniOS sélectionnée, en conservant son environnement de bureau, son identité visuelle et ses applications courantes, tout en supprimant les logiciels spécifiques à MiniOS nécessaires à l’architecture live.

## Télécharger et vérifier l’ISO

Téléchargez un ISO depuis le [site officiel](https://minios.dev), la page officielle des [versions GitHub](https://github.com/minios-linux/minios-live/releases) ou [SourceForge](https://sourceforge.net/projects/minios-linux/). Vérifiez-le avant de l’écrire sur un périphérique ; consultez [Vérifier les téléchargements](/installing-minios/Verifying-Downloads).

## Installer MiniOS sur un support amovible

Choisissez la méthode en fonction de la disposition souhaitée sur le périphérique cible :

| Résultat | Méthode | Contenu obtenu |
|---|---|---|
| Système de fichiers inscriptible classique qui démarre aussi MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) en mode ISO ou [installation manuelle à partir de fichiers](/installing-minios/Manual-File-Based-Installation) | Fichiers MiniOS et chargeur d’amorçage sur un système de fichiers classique ; l’espace restant reste disponible pour les fichiers courants |
| Périphérique multiboot avec prise en charge de la persistance MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | Partition de données Ventoy pour les fichiers ISO et prise en charge des sessions persistantes MiniOS |
| Installation modulaire MiniOS gérée | [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) en mode **live** | Disposition des modules MiniOS avec stockage persistant facultatif configuré par le programme d’installation |
| Copie exacte de l’ISO publiée, bloc par bloc | [Rufus](/installing-minios/installation-tools/Rufus) en mode DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility), ou [`dd`](/installing-minios/installation-tools/dd) | Disposition des blocs identique à celle de l’ISO ; méthode simple et prévisible, mais le périphérique cible ne fonctionne plus comme une clé USB classique à usage général |

::: danger L’écriture d’une image brute remplace la disposition existante du périphérique
Le mode DD Rufus, Etcher, l’écriture d’image avec l’Utilitaire de disque et `dd` remplacent la disposition des blocs existante du périphérique. Vérifiez le modèle et la capacité du périphérique cible, et sauvegardez les données importantes avant de commencer. Cet avertissement ne concerne pas le mode ISO Rufus, Ventoy ni l’installation à partir de fichiers.
:::

## Démarrer la session live

1. Redémarrez l’ordinateur et ouvrez le menu de démarrage du firmware.
2. Sélectionnez le périphérique USB ou un autre support amorçable.
3. Démarrez MiniOS et vérifiez que le stockage, le réseau et les périphériques d’entrée fonctionnent comme prévu.

Les paramètres du firmware varient selon l’ordinateur. Une image MiniOS peut démarrer en mode BIOS ou UEFI ; le déploiement ultérieur du Programme d’installation MiniOS sur la cible n’est pas limité au MBR.

Consultez [Modes de démarrage](/using-minios/Boot-Modes) pour connaître le comportement de référence du démarrage live. Si le démarrage initial ne trouve pas l’image ou ses modules, consultez [Détection du système par l’initrd](/reference/boot-process/System-Discovery).

## Choisir une disposition installée

Depuis la session live, lancez [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) pour installer le système sur un autre lecteur USB, SSD ou disque dur.

- **Mode live** conserve la pile de modules compressés, la disposition de démarrage MiniOS, les outils de gestion MiniOS et la persistance de session en option. Choisissez cette option pour installer MiniOS lui-même sur le disque cible.
- **Mode natif**déploie l’image sélectionnée sous la forme d’un environnement de bureau Debian classique et inscriptible. Le système cible conserve l’environnement de bureau, l’identité visuelle et les applications habituelles de l’édition sélectionnée, tandis que le runtime live MiniOS et les logiciels de gestion propres au mode live sont supprimés. Le système installé utilise un initramfs, un chargeur d’amorçage, des paquets de noyau et un processus de gestion des paquets Debian classiques.

::: warning L’installation native repose sur un modèle système différent
L’architecture MiniOS qui définit le système est le système live modulaire décrit dans [À propos de MiniOS](/getting-started/About-MiniOS). Le mode natif conserve l’expérience de bureau familière de MiniOS, avec son identité visuelle, son environnement de bureau et ses applications habituelles, mais convertit le système en une installation Debian classique. Les outils MiniOS propres au mode live, destinés aux sessions, aux modules, aux noyaux modulaires et aux autres fonctionnalités live, sont supprimés, car ces fonctionnalités ne s’appliquent plus. Choisissez une installation live pour bénéficier de l’ensemble des fonctionnalités de MiniOS.
:::

La persistance live peut être créée à l’avance sur le disque cible par le Programme d’installation MiniOS ou préparée au début du démarrage. Le fonctionnement détaillé est expliqué dans [Persistance dans l’initrd](/reference/boot-process/Persistence-Internals). Elle ne s’applique pas après la conversion en mode natif.

Le programme d’installation prend en charge les dispositions BIOS/MBR, UEFI/MBR et UEFI/GPT. L’installation live automatique sur l’ensemble du disque utilise le MBR avec prise en charge du démarrage BIOS et UEFI ; les disques de 2 Tio ou plus nécessitent de choisir explicitement UEFI/GPT. Le BIOS sur GPT n’est pas pris en charge. Les workflows en mode natif et avec une table de partitions existante suivent des règles distinctes. Consultez [Utiliser le Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) pour connaître les limites liées à l’emplacement, au système de fichiers, à la persistance et au partitionnement.
