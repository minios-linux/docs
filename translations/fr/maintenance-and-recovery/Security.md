---
updated: 2026-09-13
---

# Sécurité

Les contrôles de sécurité MiniOS sont conçus autour du système live : sessions temporaires, sessions persistantes, supports amovibles et configuration au démarrage. Le Programme d’installation MiniOS peut également effectuer une conversion native. Le système obtenu conserve l’environnement de bureau sélectionné et l’identité visuelle MiniOS, mais le logiciel spécifique au mode live MiniOS est supprimé ; vous pouvez donc le sécuriser et le maintenir avec les outils Debian habituels, au lieu de le traiter comme un autre mode live.
Protégez la session en cours, les données persistantes, le support d’amorçage et toute configuration appliquée au démarrage.

## Commencez avec un support fiable

Téléchargez MiniOS depuis une source officielle et vérifiez l’ISO avant de l’écrire.
Suivez [Vérification des téléchargements](/installing-minios/Verifying-Downloads) et comparez le résultat avant de démarrer ou d’installer. La vérification permet de détecter un téléchargement corrompu ou remplacé ; elle ne garantit pas qu’une clé USB déjà modifiée soit sûre.

Gardez le contrôle physique de la clé USB. Les mots de passe du firmware et la restriction de l’ordre de démarrage peuvent limiter les démarrages non autorisés occasionnels, mais n’assurent pas le chiffrement des fichiers sur le support. Secure Boot peut offrir une protection supplémentaire de la chaîne de démarrage sur les images et matériels compatibles ; vérifiez le comportement réel de la version et du firmware au lieu de supposer leur compatibilité.

## Remplacer les identifiants par défaut

Une image live MiniOS non personnalisée utilise les identifiants publiés `live` / `evil` et `root` / `toor`, avec connexion automatique et accès administrateur sans mot de passe dans sa configuration orientée commodité. Toute personne pouvant accéder au système pourrait utiliser ces identifiants, surtout si SSH est actif.

Avant de rejoindre un réseau non fiable :

1. Définissez des mots de passe uniques pour l'utilisateur et root dans le Configurateur MiniOS.
2. Sélectionnez un profil de sécurité adapté et vérifiez chaque paramètre renseigné.
3. Désactivez SSH et XRDP sauf si un accès à distance est nécessaire.
4. Redémarrez dans une nouvelle session lors de la modification d'un compte temporaire ou des paramètres de sécurité, puis vérifiez le comportement de connexion et des privilèges obtenus.

Le Configurateur stocke les empreintes de mots de passe chiffrées plutôt que les mots de passe en clair. Si vous modifiez un compte persistant déjà créé, utilisez `passwd` pour l'utilisateur actuel et `sudo passwd root` pour root. Après conversion native, utilisez les outils standards de gestion des comptes Debian.

## Utiliser les contrôles de sécurité du Configurateur

Configurateur MiniOS propose trois profils. Un profil définit des paramètres concrets ; le nom du profil n’est pas enregistré comme clé de configuration à l’exécution, et chaque paramètre reste modifiable individuellement.

| Profil | Comportement principal |
| --- | --- |
| `convenient` | Compatible avec la connexion automatique, sudo et PolicyKit sans mot de passe, accès root et mot de passe SSH autorisés, XRDP/X11/écran de verrouillage en mode permissif, indices de mot de passe affichés. |
| `balanced` | Pas de connexion automatique, sudo et PolicyKit nécessitent un mot de passe, connexion SSH root refusée mais mot de passe SSH autorisé, XRDP/X11/écran de verrouillage renforcés. |
| `strict` | Pas de connexion automatique, sudo et PolicyKit nécessitent un mot de passe, connexion root et mot de passe SSH refusées, XRDP désactivé, X11/écran de verrouillage renforcés, indices de mot de passe masqués. |

Les valeurs par défaut de l’installateur varient selon le mode de déploiement : les installations live privilégient `convenient`, tandis que la conversion native commence par `balanced`. Le paramètre natif est appliqué lors de la conversion ; après l’installation, utilisez la configuration de sécurité Debian standard. Il s’agit de valeurs par défaut, et non de recommandations pour chaque modèle de menace.

Les mêmes paramètres sont disponibles sous forme de clés de configuration documentées, notamment `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, et `LIVE_LOCKSCREEN_MODE`. Privilégiez ces clés ou le Configurateur plutôt que de modifier les fichiers sudoers, PolicyKit, display-manager ou SSH générés. Voir [Fichier de configuration](/reference/configuration/config.conf).
Pour le comportement d’enregistrement et l’applicabilité des paramètres, consultez [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Création de compte, mots de passe, `LIVE_CONFIG_NOROOT`, et la posture de sécurité sont des paramètres ponctuels utilisés lors de la création d’une nouvelle session. Le Configurateur indique l’applicabilité de chaque contrôle. Les paramètres reconfigurables comme les services sont appliqués après redémarrage.

## Accès distant sécurisé

SSH peut être activé dans une image MiniOS pour des besoins de récupération. Sur un réseau où les autres utilisateurs ne sont pas fiables, considérez que les identifiants par défaut publiés sont exposés tant que vous n’avez pas confirmé le contraire.

- Si SSH n’est pas nécessaire, ajoutez `ssh` à `DISABLE_SERVICES` dans Configurator et retirez-le de `ENABLE_SERVICES` si présent.
- Si SSH est requis, interdisez la connexion root avec `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Privilégiez l’authentification par clé. Vérifiez la connexion par clé dans une session distincte avant de définir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limitez l’accès entrant avec le pare-feu réseau ou le routeur, et n’exposez pas un système de récupération portable directement à Internet.
- Examinez XRDP séparément. Le profil strict le désactive ; le profil équilibré le renforce mais ne désactive pas nécessairement son service.

Les paramètres de démarrage peuvent remplacer les valeurs des fichiers de configuration. Analysez tout comportement inattendu du service par rapport à [Paramètres de démarrage](/reference/Boot-Parameters).

## Chiffrer les données persistantes

Les stockages natifs non chiffrés, DynFileFS, dynblk, raw et SquashFS peuvent être lus par toute personne ayant accès à l’appareil. Dynblk est un backend bloc noyau léger, pas une couche de chiffrement ; son `volumeNNN.db` fichier de stockage contient des données de session ordinaires non chiffrées, sauf si le support de stockage sous-jacent est protégé séparément. Le Programme d’installation MiniOS peut configurer un conteneur LUKS chiffré pour une session live lorsque l’initrd source annonce la prise en charge de LUKS. L’initrd crée `changes.luks` au premier démarrage et demande sa phrase de passe ; le programme d’installation ne reçoit ni ne stocke cette phrase de passe.

La persistance LUKS protège le contenu tant que le conteneur est fermé. Elle ne protège pas les données après le déverrouillage, les fichiers de démarrage non chiffrés, les fichiers copiés en dehors du conteneur, ni un système de fichiers racine natif. La persistance de session LUKS n’est pas un chiffrement natif de la racine. Utilisez une phrase de passe robuste et conservez une sauvegarde testée.

Voir [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) et [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Appliquer les mises à jour de manière réfléchie

Actualisez les métadonnées des paquets et installez les mises à jour de sécurité Debian dans les sessions live persistantes en utilisant le workflow APT habituel lorsque cela est approprié. Les modifications APT dans une nouvelle session live disparaissent au redémarrage. Les modules de base SquashFS sont en lecture seule, donc remplacer l’ISO ou les modules par une nouvelle version de confiance de MiniOS est souvent la méthode la plus propre pour mettre à jour le système live de base. Après conversion native, la maintenance de sécurité des paquets se fait simplement via le workflow APT Debian classique pour ce système installé.

Voir [Mises à jour logicielles](/maintenance-and-recovery/Updating-MiniOS) pour les workflows distincts APT, module, image et noyau.

Avant une mise à jour importante :

- Sauvegardez les fichiers importants et les sessions persistantes.
- Vérifiez qu’il y a suffisamment d’espace libre disponible.
- Évitez d’interrompre les écritures ou d’éteindre l’appareil.
- Redémarrez et vérifiez le système mis à jour avant de supprimer le support ou la session précédente connue comme fonctionnelle.

## Traitez les hooks et le preseeding comme de l’exécution de code

L’option de démarrage `hooks` et les hooks live-config peuvent exécuter des fichiers depuis le système de fichiers racine, le support de démarrage ou une URL. Les hooks distants, les hooks sur médias modifiés et les preseeds non vérifiés peuvent s’exécuter avec les privilèges du système. Utilisez uniquement des fichiers vérifiés provenant d’une source de confiance, privilégiez une distribution authentifiée et évitez les hooks distants sur des réseaux non fiables. Consultez [live-config](/reference/configuration/live-config) pour l’ordre d’exécution et les emplacements pris en charge.

## Sauvegardez et mettez hors service les supports en toute sécurité

La persistance n'est pas une sauvegarde. Conservez une copie distincte des fichiers utilisateur et exportez ou copiez les sessions tant qu'elles sont intactes. Vérifiez la restauration sur différents supports.
Éteignez proprement avant de retirer un support inscriptible, et prévoyez de l'espace libre pour les métadonnées de session et le fonctionnement du système de fichiers.

Avant de vous débarrasser d’un appareil, effacez-le de façon sécurisée selon la technologie de stockage et la sensibilité des données. La simple suppression de fichiers ou le reformatage ne suffisent pas toujours à rendre les anciennes données irrécupérables.
