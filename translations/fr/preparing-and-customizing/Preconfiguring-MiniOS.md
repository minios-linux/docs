---
updated: 2026-10-15
program_commits:
    minios-configurator: 7705e764f152d2d2ae2268ce3ddde7e0adbad8bc
---

# Préconfigurer MiniOS

Le Configurateur MiniOS est un éditeur graphique de la configuration active MiniOS. Il valide les modifications et enregistre la configuration pour un démarrage ultérieur. Les choix initiaux concernant le stockage du cache et des journaux sont appliqués par `minios-boot` ; les autres composants de la configuration active sont exécutés plus tard. L’enregistrement ne modifie pas directement le système en cours d’exécution.

## Lancer le configurateur

Ouvrez le Configurateur MiniOS depuis le menu des applications ou exécutez :

```bash
minios-configurator
```

La cible par défaut est `/etc/live/config.conf`. Pour modifier un autre fichier standard, indiquez son chemin :

```bash
minios-configurator /path/to/config.conf
```

L’enregistrement nécessite une authentification PolicyKit. Les liens symboliques et les fichiers cibles qui ne sont pas des fichiers standard sont refusés.

## Configuration des supports et de l’exécution

MiniOS peut lire la configuration à deux emplacements :

- `minios/config.conf` et `minios/config.conf.d/*.conf` sur le support actif
- `/etc/live/config.conf` et `/etc/live/config.conf.d/*.conf` dans le système de fichiers racine en cours d’exécution

Le Configurateur MiniOS ne modifie que le fichier sélectionné. Sans argument de chemin, il modifie le fichier d’exécution `/etc/live/config.conf` ; il n’ouvre pas directement le fichier du support. MiniOS synchronise au démarrage la configuration la plus récente entre le système de fichiers d’exécution et les supports inscriptibles MiniOS. Les supports en lecture seule ne peuvent pas recevoir les modifications d’exécution, et la configuration d’exécution persistante peut être indépendante de la copie présente sur le support.

Au démarrage, MiniOS synchronise les fichiers du support et d’exécution en fonction de leur date de modification. Pour les nouvelles politiques de stockage, les fragments ultérieurs `config.conf.d` remplacent le fichier principal, `LIVE_CONFIG_CMDLINE` vient ensuite, et la ligne de commande réelle du noyau est prioritaire en dernier.
Utilisez `-i` pour superposer dans l’éditeur les paramètres reconnus de la ligne de commande actuelle du noyau :

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Le fichier sélectionné reste la cible d’enregistrement. Les paramètres inconnus du noyau sont ignorés.

## Quand les paramètres s’appliquent

Chaque contrôle indique quand il est utilisé. L’enregistrement n’applique jamais un paramètre à la session en cours.

### Appliqué après redémarrage

Le nom d’hôte, la langue et la région, le fuseau horaire, le clavier, la cible de démarrage, la sélection des services, le mode des modules, la gestion des supports du répertoire utilisateur, les paramètres de débogage et d’exportation des journaux, ainsi que les trois paramètres de stockage avancés sont lus au démarrage suivant. Redémarrez après l’enregistrement pour les appliquer.

Dans **Advanced**, **le mode des modules** accepte `simple` ou `merged`. Lorsque `LIVE_MODULE_MODE` est absent de la configuration sélectionnée, le Configurateur MiniOS actuel présente `merged` comme valeur par défaut effective. En mode fusionné, live-config actualise les utilisateurs, les caches et l’état des paquets afin d’intégrer la configuration de la pile de modules au système live en cours d’exécution.

Dans **Advanced**, **le stockage des journaux système**, **le cache de téléchargement APT** et **le cache du navigateur** proposent chacun `persistent` (par défaut) ou `volatile`. Ces paramètres prennent effet après l’activation réussie de la persistance, y compris dans une session copié RAM inscriptible dont les informations d’origine sont protégées. Avec une persistance durable, les diagnostics de démarrage MiniOS, l’état des paquets APT et les profils de navigateur restent sur le stockage ; seuls les journaux et caches sélectionnés sont déplacés vers un RAM à taille limitée. Dans une session copié RAM, l’état conservé doit tout de même être enregistré avec succès sur le stockage. Les caches RAM APT et du navigateur nécessitent au moins 1 Gio disponible et l’absence de swap autre que zRAM. La configuration du navigateur s’effectue après la création de l’utilisateur. Le Configurateur avertit si l’initrd ne contient pas le marqueur requis`perch-storage-v1` . Consultez [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) pour connaître les limites fixes RAM.

### Utilisé uniquement pour une nouvelle session

La création de compte, les mots de passe utilisateur et root, `noroot`, les règles sudo et PolicyKit, les règles SSH et XRDP, l’accès X11, les rappels de mot de passe et le verrouillage de l’écran sont des paramètres ponctuels. Une session persistante enregistre généralement les composants `live-config` terminés sous `/var/lib/live/config/`, donc modifier ces valeurs puis redémarrer la même session ne recrée ni le compte ni l’état de sécurité. Démarrez une nouvelle session pour appliquer ces paramètres initiaux.

Les profils de sécurité sont des préréglages de l’éditeur. Le nom du profil n’est pas enregistré ; les paramètres de sécurité individuels sont enregistrés et restent modifiables.

## Répertoires utilisateur et persistance

La liaison et le montage bind des répertoires utilisateur sont mutuellement exclusifs. Ils nécessitent tous deux un support de données local inscriptible existant MiniOS et un chemin relatif au support sécurisé. Ils ne sont pas disponibles avec `toram`, `toram=full`, ni `toram=trim`, ni lorsque la session de persistance active est chiffrée avec LUKS. La recopie est également désactivée pour une session chiffrée. MiniOS ne fusionne pas automatiquement deux arborescences de répertoires contenant déjà des données.

`perchmode` et `perchsize` sont des paramètres de démarrage initramfs, et non des paramètres du Configurateur MiniOS. Les nouveaux contrôles de stockage des caches et des journaux ne permettent pas de sélectionner ni de créer une session `perch`. Le Configurateur MiniOS ne crée, ne déverrouille, ne redimensionne et ne répare aucun conteneur de persistance. Pour la persistance chiffrée, il indique si le marqueur de chiffrement initramfs est présent.

## Comportement de l’enregistrement

L’aperçu répertorie uniquement les valeurs modifiées et masque les mots de passe. L’enregistrement ne met à jour que les clés modifiées, tout en préservant les commentaires, l’ordre, les clés inconnues, le propriétaire, les permissions et les attributs étendus. L’écriture est atomique.

Pour consulter la référence complète des variables et des paramètres de démarrage, voir [Fichier de configuration](/reference/configuration/config.conf), [Paramètres de démarrage](/reference/Boot-Parameters) et [live-config](/reference/configuration/live-config).
