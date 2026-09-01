---
updated: 2026-08-26
program_commits:
    minios-configurator: d2e9837de73c3c95ac3717168969a882ec97f04c
---

# Préconfiguration de MiniOS

Le Configurateur MiniOS est un éditeur graphique pour les paramètres MiniOS `live-config`. Il valide les modifications et écrit la configuration pour un démarrage ultérieur. Il ne modifie pas directement le système en cours d'exécution.

## Démarrer le configurateur

Ouvrez le Configurateur MiniOS depuis le menu des applications ou exécutez :

```bash
minios-configurator
```

La cible par défaut est `/etc/live/config.conf`. Pour modifier un autre fichier régulier, indiquez son chemin :

```bash
minios-configurator /path/to/config.conf
```

L'enregistrement nécessite une authentification PolicyKit. Les liens symboliques et les fichiers cibles non réguliers sont refusés.

## Configuration des supports et à l'exécution

MiniOS peut lire la configuration à partir de deux emplacements :

- `minios/config.conf` et `minios/config.conf.d/*.conf` sur le support live
- `/etc/live/config.conf` et `/etc/live/config.conf.d/*.conf` dans le système de fichiers racine en cours d'exécution

Le Configurateur MiniOS ne modifie que le fichier sélectionné. Sans argument de chemin, il édite le fichier runtime `/etc/live/config.conf` ; il n'ouvre pas directement le fichier du support. MiniOS synchronise la configuration la plus récente entre le système de fichiers runtime et les supports MiniOS inscriptibles au démarrage. Les supports en lecture seule ne peuvent pas recevoir de modifications runtime, et une configuration persistante à l'exécution peut rester indépendante de la copie sur le support.

Pour une option donnée, les paramètres du noyau priment sur les fichiers de configuration, et la configuration du support prime sur celle du système de fichiers racine.
Utilisez `-i` pour superposer dans l'éditeur les paramètres reconnus de la ligne de commande du noyau en cours :

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Le fichier sélectionné reste la cible d'enregistrement. Les paramètres noyau inconnus sont ignorés.

## Quand les paramètres sont appliqués

Chaque contrôle indique quand il est utilisé. L'enregistrement n'applique jamais un paramètre à la session en cours.

### Appliqué après redémarrage

Le nom d'hôte, la langue, le fuseau horaire, le clavier, la cible de démarrage, la sélection des services, le mode des modules, la gestion des médias des répertoires utilisateurs, les paramètres de débogage et l'exportation des journaux sont lus lors d'un prochain démarrage. Redémarrez après l'enregistrement pour les appliquer.

### Utilisé uniquement pour une nouvelle session

La création de compte, les mots de passe utilisateur et root, `noroot`, les politiques sudo et PolicyKit, les politiques SSH et XRDP, l'accès X11, les indices de mot de passe et le verrouillage d'écran sont des paramètres à usage unique. Une session persistante enregistre normalement les composants `live-config` terminés sous `/var/lib/live/config/`, donc modifier ces valeurs et redémarrer la même session ne recrée pas le compte ou l'état de sécurité. Démarrez une nouvelle session pour les appliquer comme paramètres initiaux.

Les profils de sécurité sont des préréglages de l'éditeur. Le nom du profil n'est pas enregistré ; les paramètres de sécurité individuels sont enregistrés et restent modifiables.

## Répertoires utilisateurs et persistance

Le lien symbolique et le montage par liaison des répertoires utilisateurs sont mutuellement exclusifs. Les deux utilisent un support de données local MiniOS existant et inscriptible ainsi qu'un chemin sûr relatif au support. Ils ne sont pas disponibles avec `toram`, `toram=full` ou `toram=trim`, et MiniOS ne fusionne pas automatiquement deux arbres de répertoires déjà remplis.

`perchmode` et `perchsize` sont des paramètres de démarrage initramfs, et non des paramètres du Configurateur MiniOS. Le Configurateur MiniOS ne crée pas, ne déverrouille pas, ne redimensionne pas et ne répare pas de conteneur de persistance. Pour la persistance chiffrée, il indique uniquement si le marqueur de chiffrement initramfs est présent.

## Comportement de l'enregistrement

L'aperçu ne liste que les valeurs modifiées et masque les mots de passe. L'enregistrement ne met à jour que les clés modifiées tout en préservant les commentaires, l'ordre, les clés inconnues, la propriété, les permissions et les attributs étendus. L'écriture est atomique.

Pour la référence complète des variables et des paramètres de démarrage, consultez [Fichier de configuration](/reference/configuration/config.conf), [Paramètres de démarrage](/reference/Boot-Parameters) et [live-config](/reference/configuration/live-config).
