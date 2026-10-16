---
updated: 2026-08-31
---

# Mise à jour de MiniOS

MiniOS ne **dispose** pas d’une procédure de mise à niveau sur place prise en charge d’une version MiniOS à une autre. Le système live modulaire est composé de modules SquashFS en lecture seule et d’une couche de session inscriptible. Ainsi, la modification des paquets Debian sur le système en cours d’exécution ne remplace pas la version MiniOS elle-même.

::: warning Une nouvelle installation de la version MiniOS
Il n’existe pas d’équivalent MiniOS de `dist-upgrade` qui transforme une copie installée ou persistante d’une version MiniOS en une autre version. Pour passer à une version MiniOS plus récente, il faut l’installer, puis migrer les données et les paramètres que vous souhaitez conserver.
:::

## APT est autorisé

MiniOS ne bloque pas APT et ne l’interdit pas. Vous pouvez installer et mettre à jour des paquets Debian lorsque cela est utile :

```bash
sudo apt update
sudo apt upgrade
```

### MiniOS live modulaire

Dans une session MiniOS live, APT écrit les fichiers des paquets et leurs métadonnées dans la couche inscriptible. Si la persistance est activée, ces modifications peuvent être conservées après un redémarrage. Les modules en lecture seule `.sb` situés sous cette couche ne sont pas modifiés ; les fichiers mis à jour dans la session remplacent simplement ceux des modules.

Il s’agit de la maintenance des paquets **dans cette session**, et non d’une mise à jour de MiniOS.
Cela consomme également de l’espace de persistance et peut faire diverger considérablement la session de l’image publiée. Une nouvelle session démarre toujours avec l’ensemble de paquets contenu dans les modules MiniOS.

Ne modifiez pas les sources APT pour utiliser une autre version de Debian et n’exécutez pas `upgrade`, `full-upgrade` ni `dist-upgrade` dans l’espoir d’obtenir une version MiniOS plus récente.
Cela crée un état système hybride ; cela ne reproduit ni l’ensemble de modules, ni les fichiers de démarrage, ni la sélection du firmware, ni les paquets MiniOS, ni les autres choix d’une version MiniOS publiée.

### Après la conversion en installation native

Une installation native créée par le Programme d’installation MiniOS est un environnement de bureau Debian classique, et non le système live modulaire MiniOS. Elle conserve l’expérience de bureau familière MiniOS, notamment l’environnement de bureau sélectionné, l’identité visuelle et les applications courantes, tandis que les logiciels live spécifiques à MiniOS sont supprimés. Le système obtenu dispose d’un système de fichiers racine inscriptible : APT met à jour les paquets normalement, le noyau est géré au moyen des paquets Debian, et le chargeur d’amorçage ainsi que l’initramfs installés suivent le processus Debian classique.

Le modèle de mise à niveau de version de MiniOS ne s’applique donc pas à ce système converti. L’identité visuelle MiniOS et les logiciels de bureau courants peuvent être conservés, tandis que la maintenance suit le modèle Debian habituel plutôt que le processus de modules et de sessions de MiniOS.

## Passer à une version plus récente de MiniOS

Considérez une version plus récente de MiniOS comme un système distinct :

1. Téléchargez et [vérifiez](/installing-minios/Verifying-Downloads) la nouvelle image.
2. Sauvegardez les fichiers importants, la configuration, les modules utilisateur et les sessions persistantes comme indiqué dans [Sauvegarde de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Installez la nouvelle version à l’aide de la [méthode d’installation](/installing-minios/Installation-Methods) appropriée.
4. Démarrez-la d’abord avec une nouvelle session et vérifiez que le matériel et les applications dont vous avez besoin fonctionnent.
5. Migrez les fichiers personnels et les éléments de configuration de votre choix. Si Session Manager permet d’exporter l’ancienne session, importez son archive et laissez les vérifications de compatibilité s’exécuter au lieu de copier manuellement une session en cours d’utilisation.
6. Recréez ou réinstallez les modules personnalisés dont la compatibilité avec la version cible n’est pas confirmée.

Conservez l’ancienne installation ou sa sauvegarde jusqu’à ce que la nouvelle version ait été testée.
Ne combinez pas des modules de base, des fichiers de démarrage, des fichiers du noyau ou des fichiers initramfs provenant de différentes versions de MiniOS pour tenter de créer une mise à niveau.

## La gestion des modules et des noyaux est distincte

Un module créé par l’utilisateur `.sb` peut être remplacé ou recréé indépendamment si cela est intentionnel. Cela modifie une couche de personnalisation, et non la version MiniOS. Voir [Gestion des modules](/preparing-and-customizing/Managing-Modules).

Le noyau MiniOS est également géré comme un ensemble coordonné comprenant le module du noyau, `vmlinuz` et initramfs. Utilisez [Gestion des noyaux](/preparing-and-customizing/Managing-Kernels) pour cette opération. La mise à jour d’un simple paquet `linux-image` avec APT ne correspond pas à la procédure de gestion du noyau MiniOS, et la modification du noyau ne met pas à jour la version MiniOS.
