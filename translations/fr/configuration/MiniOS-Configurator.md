# MiniOS Configurator

MiniOS Configurator est un éditeur graphique pour les paramètres `live-config` de MiniOS. Il valide les modifications et écrit la configuration pour un prochain démarrage. Il ne modifie pas directement le système en cours d'exécution.

## Démarrer le configurateur

Ouvrez MiniOS Configurator depuis le menu des applications ou lancez :

```bash
minios-configurator
```

La cible par défaut est `/etc/live/config.conf`. Pour modifier un autre fichier régulier,
indiquez son chemin :

```bash
minios-configurator /path/to/config.conf
```

L'enregistrement nécessite une authentification PolicyKit. Les liens symboliques et les fichiers cibles non réguliers sont refusés.

## Configuration du support et à l'exécution

MiniOS peut lire la configuration à partir de deux emplacements :

- `minios/config.conf` et `minios/config.conf.d/*.conf` sur le support live
- `/etc/live/config.conf` et `/etc/live/config.conf.d/*.conf` dans le système de fichiers racine en cours d'exécution

Le Configurator modifie uniquement le fichier sélectionné. Sans argument de chemin, il modifie le fichier d'exécution `/etc/live/config.conf` ; il n'ouvre pas directement le fichier du support. MiniOS synchronise la configuration la plus récente entre le système de fichiers d'exécution et les supports MiniOS inscriptibles lors du démarrage. Les supports en lecture seule ne peuvent pas recevoir de modifications d'exécution, et une configuration d'exécution persistante peut rester indépendante de la copie sur le support.

Pour une option donnée, les paramètres du noyau ont priorité sur les fichiers de configuration, et la configuration du support a priorité sur celle du système de fichiers racine.
Utilisez `-i` pour superposer dans l'éditeur les paramètres reconnus de la ligne de commande du noyau en cours :

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Le fichier sélectionné reste la cible d'enregistrement. Les paramètres du noyau non reconnus sont ignorés.

## Quand les paramètres s'appliquent

Chaque contrôle indique quand il est utilisé. L'enregistrement n'applique jamais un paramètre à la session en cours.

### Appliqués après redémarrage

Le nom d'hôte, la langue, le fuseau horaire, le clavier, la cible de démarrage, la sélection des services, le mode des modules, la gestion des répertoires utilisateur sur le support, les paramètres de débogage et l'exportation des journaux sont lus lors d'un prochain démarrage. Redémarrez après l'enregistrement pour les appliquer.

### Utilisés uniquement pour une nouvelle session

La création de compte, les mots de passe utilisateur et root, `noroot`, la politique sudo et PolicyKit, la politique SSH et XRDP, l'accès X11, les indices de mot de passe et le verrouillage d'écran sont des paramètres à usage unique. Une session persistante enregistre normalement les composants `live-config` terminés sous `/var/lib/live/config/`, donc modifier ces valeurs puis redémarrer la même session ne recrée pas le compte ni l'état de sécurité. Démarrez une nouvelle session pour les appliquer comme paramètres initiaux.

Les profils de sécurité sont des préréglages de l'éditeur. Le nom du profil n'est pas enregistré ; les paramètres de sécurité individuels sont enregistrés et restent modifiables.

## Répertoires utilisateur et persistance

Le lien symbolique et le montage par liaison des répertoires utilisateur sont mutuellement exclusifs. Les deux utilisent un support de données MiniOS local inscriptible existant et un chemin relatif au support sécurisé. Ils ne sont pas disponibles avec `toram`, `toram=full` ou `toram=trim`, et MiniOS ne fusionne pas automatiquement deux arborescences de répertoires déjà peuplées.

`perchmode` et `perchsize` sont des paramètres de démarrage initramfs, pas des paramètres du Configurator. Le Configurator ne crée, ne déverrouille, ne redimensionne ni ne répare un conteneur de persistance. Pour la persistance chiffrée, il indique seulement si le marqueur de chiffrement initramfs est présent.

## Comportement de l'enregistrement

L'aperçu ne liste que les valeurs modifiées et masque les mots de passe. L'enregistrement met à jour uniquement les clés modifiées tout en préservant les commentaires, l'ordre, les clés inconnues, la propriété, les permissions et les attributs étendus. L'écriture est atomique.

Pour la référence complète des variables et des paramètres de démarrage, consultez
[Fichier de configuration](/configuration/Configuration-File.md),
[Paramètres de démarrage](/configuration/Boot-Parameters.md), et
[live-config](/configuration/live-config.md).
