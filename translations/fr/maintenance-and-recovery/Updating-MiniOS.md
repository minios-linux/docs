---
updated: 2026-08-31
---

# Mise à jour de MiniOS

MiniOS ne propose **pas** de procédure de mise à niveau sur place prise en charge d'une version MiniOS à une autre. Le système live modulaire est assemblé à partir de modules SquashFS en lecture seule, auxquels s’ajoute une couche de session en écriture. Ainsi, modifier les paquets Debian sur le système en cours d'exécution ne remplace pas la version MiniOS elle-même.

::: warning Une nouvelle version MiniOS correspond à une nouvelle installation
Il n’existe pas d’équivalent MiniOS à `dist-upgrade` permettant de transformer une copie installée ou persistante d’une version MiniOS en une autre version. Passer à une version MiniOS plus récente signifie installer cette version, puis migrer les données et paramètres que vous souhaitez conserver.
:::

## APT est autorisé

MiniOS ne bloque ni n’interdit l’utilisation d’APT. Vous pouvez installer et mettre à jour des paquets Debian lorsque cela est utile :

```bash
sudo apt update
sudo apt upgrade
```

### Live modulaire MiniOS

Dans une session live MiniOS, APT écrit les fichiers de paquets et les métadonnées de paquets dans la couche en écriture. Avec la persistance, ces modifications peuvent survivre à un redémarrage. Les modules `.sb` en lecture seule situés sous cette couche ne sont pas modifiés ; les fichiers mis à jour dans la session remplacent simplement ceux des modules.

Il s’agit de la maintenance des paquets **dans cette session**, et non d’une mise à jour de MiniOS.
Cela consomme également de l’espace de persistance et peut rendre la session très différente de l’image publiée. Une nouvelle session démarre toujours à partir de l’ensemble de paquets contenu dans les modules MiniOS.

Ne modifiez pas les sources APT vers une autre version de Debian et n’exécutez pas `upgrade`, `full-upgrade` ou `dist-upgrade` en espérant obtenir une version MiniOS plus récente.
Cela crée un état système hybride ; cela ne reproduit pas l’ensemble des modules, les fichiers de démarrage, la sélection du firmware, les paquets MiniOS ou les autres choix d’une version publiée MiniOS.

### Après conversion native

Une installation native créée par MiniOS est un bureau Debian classique, et non le système live modulaire MiniOS. Elle conserve l’expérience familière du bureau MiniOS, incluant l’environnement de bureau sélectionné, l’identité visuelle et les applications courantes, tandis que les logiciels live spécifiques à MiniOS sont supprimés. Le système obtenu dispose d’un système de fichiers racine accessible en écriture : APT met à jour les paquets normalement, le noyau est géré via les paquets Debian, et le chargeur d’amorçage ainsi que l’initramfs installés utilisent le processus Debian classique.

Le modèle de mise à niveau de version de MiniOS ne s’applique donc pas à ce système converti. L’identité visuelle et les logiciels de bureau ordinaires de MiniOS peuvent rester, tandis que la maintenance continue suit le modèle Debian standard, et non le processus modulaire/session de MiniOS.

## Passage à une version MiniOS plus récente

Considérez une version MiniOS plus récente comme un système distinct :

1. Téléchargez et [vérifiez](/installing-minios/Verifying-Downloads) la nouvelle image.
2. Sauvegardez les fichiers importants, la configuration, les modules utilisateur et les sessions persistantes comme décrit dans [Sauvegarder MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Installez la nouvelle version en utilisant la [méthode d’installation](/installing-minios/Installation-Methods) appropriée.
4. Démarrez-la d’abord avec une session vierge et vérifiez le matériel et les applications nécessaires.
5. Migrez les fichiers personnels et la configuration souhaitée. Lorsque Session Manager peut exporter l’ancienne session, importez son archive et laissez les vérifications de compatibilité s’exécuter au lieu de copier manuellement le magasin de session live.
6. Recréez ou réinstallez les modules personnalisés s’ils ne sont pas connus pour être compatibles avec la version cible.

Conservez l’ancienne installation ou la sauvegarde jusqu’à ce que la nouvelle version ait été testée.
Ne combinez pas les modules de base, fichiers de démarrage, fichiers du noyau ou fichiers initramfs de différentes versions MiniOS dans le but de fabriquer une mise à niveau.

## Les modules et noyaux sont des tâches de maintenance distinctes

Un module utilisateur `.sb` peut être remplacé ou reconstruit indépendamment lorsque cela est intentionnel. Cela modifie la couche de personnalisation ; cela ne modifie pas la version MiniOS. Voir [Gérer les modules](/preparing-and-customizing/Managing-Modules).

Le noyau MiniOS est également géré comme un module noyau coordonné, `vmlinuz`, et un ensemble initramfs. Utilisez [Gérer les noyaux](/preparing-and-customizing/Managing-Kernels) pour cette opération. Mettre à jour uniquement un paquet `linux-image` avec APT ne correspond pas au flux de gestion du noyau MiniOS, et changer le noyau ne met pas à jour la version MiniOS.
