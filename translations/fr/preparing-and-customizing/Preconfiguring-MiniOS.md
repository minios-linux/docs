---
updated: 2026-10-06
program_commits:
    minios-configurator: 4d82e44c6ee6f04909e9dd3ef8e31389d3ac8817
---

# Préconfiguration de MiniOS

Le Configurateur MiniOS est un éditeur graphique pour la configuration dynamique de MiniOS. Il valide les modifications et écrit la configuration pour un prochain démarrage. Les choix précoces de cache/journalisation sont appliqués par `minios-boot`; les autres composants live-config s’exécutent plus tard. L’enregistrement ne modifie pas directement le système en cours d’exécution.

## Démarrer le configurateur

Ouvrez le Configurateur MiniOS depuis le menu des applications ou exécutez :

```bash
minios-configurator
```

La cible par défaut est `/etc/live/config.conf`. Pour modifier un autre fichier régulier, indiquez son chemin :

```bash
minios-configurator /path/to/config.conf
```

L’enregistrement nécessite une authentification PolicyKit. Les liens symboliques et les fichiers cibles non réguliers sont refusés.

## Configuration des supports et à l’exécution

MiniOS peut lire la configuration à partir de deux emplacements :

- `minios/config.conf` et `minios/config.conf.d/*.conf` sur le support live
- `/etc/live/config.conf` et `/etc/live/config.conf.d/*.conf` dans le système de fichiers racine en cours d’exécution

Le Configurateur MiniOS modifie uniquement le fichier sélectionné. Sans argument de chemin, il édite le fichier runtime `/etc/live/config.conf`; il n’ouvre pas directement le fichier du support. MiniOS synchronise la configuration la plus récente entre le système de fichiers runtime et les supports MiniOS inscriptibles lors du démarrage. Les supports en lecture seule ne peuvent pas recevoir de modifications runtime, et une configuration runtime persistante peut rester indépendante de la copie sur le support.

Au démarrage, MiniOS synchronise les fichiers du support et runtime selon la date de modification. Pour les nouvelles politiques de stockage, les fragments `config.conf.d` les plus récents remplacent le fichier principal, `LIVE_CONFIG_CMDLINE` vient ensuite, et la ligne de commande du noyau l’emporte en dernier.
Utilisez `-i` pour appliquer dans l’éditeur les paramètres reconnus de la ligne de commande du noyau en cours :

```bash
minios-configurator --inherit-cmdline /etc/live/config.conf
```

Le fichier sélectionné reste la cible d’enregistrement. Les paramètres noyau inconnus sont ignorés.

## Quand les paramètres s’appliquent

Chaque contrôle indique quand il est utilisé. L’enregistrement n’applique jamais un paramètre à la session en cours.

### Appliqué après redémarrage

Le nom d’hôte, la langue, le fuseau horaire, le clavier, la cible de démarrage, la sélection des services, le mode module, la gestion des médias des répertoires utilisateur, les paramètres de débogage, l’export des journaux et les trois paramètres avancés de stockage sont lus lors d’un prochain démarrage. Redémarrez après l’enregistrement pour les appliquer.

Dans **Avancé**, **Mode module** accepte `simple` ou `merged`. Si `LIVE_MODULE_MODE` est absent de la configuration sélectionnée, le Configurateur MiniOS affiche `merged` comme valeur par défaut effective. En mode fusionné, live-config actualise les utilisateurs, les caches et l’état des paquets afin que la configuration de la pile de modules soit intégrée au système live en cours d’exécution.

Dans **Avancé**, **Stockage des journaux système**, **Cache de téléchargement APT**, et **Cache du navigateur** proposent chacun `persistent` (par défaut) ou `volatile`. Leurs choix `volatile` s’appliquent uniquement à une session `perch` saine et durable. Les journaux de `minios-boot` et `live-config` restent persistants même si les journaux ordinaires sont temporaires. L’état des paquets APT et les profils navigateur restent persistants ; seuls les journaux et caches sélectionnés sont déplacés vers RAM à capacité limitée. La configuration du navigateur s’effectue après la création de l’utilisateur live. Le configurateur signale si l’initrd en cours n’a pas le marqueur `perch-storage-v1` requis pour ces paramètres. Voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch) avant de choisir les tailles RAM pour une machine à faible mémoire.

### Utilisé uniquement pour une nouvelle session

La création de compte, les mots de passe utilisateur et root, `noroot`, les politiques sudo et PolicyKit, les politiques SSH et XRDP, l’accès X11, les indices de mot de passe et le verrouillage d’écran sont des paramètres à usage unique. Une session persistante enregistre normalement les composants `live-config` terminés sous `/var/lib/live/config/`, donc modifier ces valeurs et redémarrer la même session ne recréera pas le compte ou l’état de sécurité. Démarrez une nouvelle session pour les appliquer comme paramètres initiaux.

Les profils de sécurité sont des préréglages de l’éditeur. Le nom du profil n’est pas enregistré ; les paramètres de sécurité individuels sont sauvegardés et restent modifiables.

## Répertoires utilisateur et persistance

Le lien et le montage par liaison des répertoires utilisateur sont mutuellement exclusifs. Les deux utilisent un support de données local MiniOS existant, inscriptible, et un chemin relatif au support sécurisé. Ils ne sont pas disponibles avec `toram`, `toram=full`, ou `toram=trim`, et MiniOS ne fusionne pas automatiquement deux arborescences de répertoires déjà peuplées.

`perchmode` et `perchsize` sont des paramètres de démarrage initramfs, pas des réglages du Configurateur MiniOS. Les nouveaux contrôles de stockage de cache/journalisation ne sélectionnent ni ne créent de `perch` session. Le Configurateur MiniOS ne crée pas, ne déverrouille pas, ne redimensionne pas et ne répare pas de conteneur de persistance. Pour la persistance chiffrée, il indique si le marqueur de chiffrement initramfs est présent.

## Comportement de l’enregistrement

La révision affiche uniquement les valeurs modifiées et masque les mots de passe. L’enregistrement met à jour uniquement les clés modifiées tout en préservant les commentaires, l’ordre, les clés inconnues, la propriété, les permissions et les attributs étendus. L’écriture est atomique.

Pour la référence complète des variables et paramètres de démarrage, voir [Fichier de configuration](/reference/configuration/config.conf), [Paramètres de démarrage](/reference/Boot-Parameters), et [live-config](/reference/configuration/live-config).
