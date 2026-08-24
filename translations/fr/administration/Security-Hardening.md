# Renforcement de la sécurité

MiniOS peut fonctionner comme système de récupération live, système portable persistant ou installation native. Les contrôles appropriés dépendent de l’utilisation du système. Protégez la session en cours, les données persistantes, le support de démarrage et toute configuration appliquée au démarrage.

## Commencez avec un support de confiance

Téléchargez MiniOS depuis une source officielle et vérifiez l’ISO avant de l’écrire. Suivez [Vérification des téléchargements](/installation/Verifying-Downloads.md) et comparez le résultat avant de démarrer ou d’installer. La vérification détecte un téléchargement endommagé ou substitué ; elle ne garantit pas qu’une clé USB déjà modifiée soit sûre.

Gardez la clé USB sous contrôle physique. Les mots de passe du firmware et l’ordre de démarrage restreint peuvent limiter les démarrages non autorisés occasionnels, mais n’offrent pas de chiffrement des fichiers sur le support. Secure Boot peut fournir une protection supplémentaire de la chaîne de démarrage sur les images et matériels compatibles ; vérifiez le comportement réel de la version et du firmware au lieu de supposer la prise en charge.

## Remplacez les identifiants par défaut

Une image live MiniOS non personnalisée utilise les identifiants publiés `live` /
`evil` et `root` / `toor`, avec connexion automatique et accès administrateur sans mot de passe dans sa configuration orientée commodité. Toute personne pouvant accéder au système pourrait utiliser ces identifiants, surtout si SSH est actif.

Avant de rejoindre un réseau non fiable :

1. Définissez des mots de passe uniques pour l’utilisateur et root dans le Configurateur MiniOS.
2. Sélectionnez un profil de sécurité adapté et vérifiez chaque contrôle renseigné.
3. Désactivez SSH et XRDP sauf si l’accès à distance est nécessaire.
4. Redémarrez dans une nouvelle session après avoir modifié les paramètres de compte ou de sécurité à usage unique, puis vérifiez le comportement de connexion et de privilèges obtenu.

Le Configurateur stocke les empreintes de mots de passe chiffrées plutôt que les mots de passe en clair. Si vous modifiez un compte persistant ou natif déjà créé, utilisez `passwd` pour l’utilisateur courant et `sudo passwd root` pour root.

## Utilisez les contrôles de sécurité du Configurateur

Le Configurateur MiniOS propose trois profils. Un profil remplit des paramètres concrets ; le nom du profil lui-même n’est pas enregistré comme clé de configuration en cours d’exécution, et chaque paramètre reste modifiable indépendamment.

| Profil | Comportement principal |
| --- | --- |
| `convenient` | Compatible avec la connexion automatique, sudo et PolicyKit sans mot de passe, connexion SSH root et par mot de passe autorisée, XRDP/X11/écran de verrouillage assouplis, indices de mot de passe affichés. |
| `balanced` | Pas de connexion automatique, sudo et PolicyKit nécessitent un mot de passe, connexion SSH root refusée mais connexion SSH par mot de passe autorisée, XRDP/X11/écran de verrouillage renforcés. |
| `strict` | Pas de connexion automatique, sudo et PolicyKit nécessitent un mot de passe, connexion SSH root et par mot de passe refusée, XRDP désactivé, X11/écran de verrouillage renforcés, indices de mot de passe masqués. |

Les valeurs par défaut de l’installateur varient selon le mode d’installation : les installations live privilégient `convenient`, tandis que les installations natives privilégient `balanced`. Ce sont des valeurs par défaut, pas des recommandations pour tous les modèles de menace.

Les mêmes paramètres sont disponibles sous forme de clés de configuration documentées, notamment `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`,
`LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`,
`LIVE_ISSUE_PASSWORD_HINTS` et `LIVE_LOCKSCREEN_MODE`. Privilégiez ces clés ou le Configurateur plutôt que la modification directe des fichiers sudoers, PolicyKit, display-manager ou SSH générés. Voir [Fichier de configuration](/configuration/Configuration-File.md).
Pour le comportement d’enregistrement et l’applicabilité des paramètres, voir
[MiniOS Configurateur](/configuration/MiniOS-Configurator.md).

La création de compte, les mots de passe, `LIVE_CONFIG_NOROOT` et la posture de sécurité sont des paramètres à usage unique appliqués lors de la création d’une nouvelle session. Le Configurateur affiche l’applicabilité de chaque contrôle. Les paramètres reconfigurables comme les services sont appliqués après redémarrage.

## Sécurisez l’accès distant

SSH peut être activé dans une image MiniOS à des fins de récupération. Sur un réseau où les autres utilisateurs ne sont pas fiables, considérez que les identifiants par défaut publiés sont exposés tant que vous n’avez pas confirmé le contraire.

- Si SSH n’est pas nécessaire, ajoutez `ssh` à `DISABLE_SERVICES` dans le Configurateur et retirez-le de `ENABLE_SERVICES` si présent.
- Si SSH est requis, refusez la connexion root avec `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Privilégiez l’authentification par clé. Vérifiez la connexion par clé dans une session distincte avant de définir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limitez l’accès entrant avec le pare-feu réseau ou le routeur, et n’exposez pas un système de récupération portable directement à Internet.
- Vérifiez XRDP séparément. Le profil strict le désactive ; le profil équilibré le renforce mais ne désactive pas nécessairement son service.

Les paramètres de démarrage peuvent outrepasser les valeurs du fichier de configuration. Analysez tout comportement inattendu de service en consultant [Paramètres de démarrage](/configuration/Boot-Parameters.md).

## Chiffrez les données persistantes

Une persistance non chiffrée (native, DynFileFS ou brute) peut être lue par toute personne ayant accès au support. L’installateur MiniOS peut configurer un conteneur LUKS chiffré pour une session live lorsque l’initrd source annonce la prise en charge de LUKS. L’initrd crée `changes.luks` au premier démarrage et demande sa phrase de passe ; l’installateur ne reçoit ni ne stocke cette phrase de passe.

La persistance LUKS protège le contenu tant que le conteneur est fermé. Elle ne protège pas les données après déverrouillage, les fichiers de démarrage non chiffrés, les fichiers copiés en dehors du conteneur ou un système de fichiers racine natif. La persistance de session LUKS n’est pas un chiffrement natif du root. Utilisez une phrase de passe robuste et conservez une sauvegarde testée.

Voir [Installateur MiniOS](/installation/MiniOS-Installer.md) et [Gestion de session](/configuration/Session-Management.md).

## Appliquez les mises à jour de façon délibérée

Actualisez les métadonnées des paquets et installez les mises à jour de sécurité Debian dans les sessions live persistantes ou les installations natives en utilisant le flux de travail APT habituel. Les modifications APT dans une session live fraîche disparaissent au redémarrage. Les modules de base SquashFS sont en lecture seule, donc remplacer l’ISO ou les modules par une version MiniOS plus récente et de confiance est souvent la méthode la plus propre pour mettre à jour le système live de base.

Voir [Mises à jour logicielles](/administration/Software-Updates.md) pour les flux de travail distincts APT, module, image et noyau.

Avant une mise à jour importante :

- Sauvegardez les fichiers importants et les sessions persistantes.
- Vérifiez qu’il y a suffisamment d’espace libre disponible.
- Évitez d’interrompre les écritures ou d’éteindre l’appareil.
- Redémarrez et vérifiez le système mis à jour avant de supprimer le support ou la session précédemment validés.

## Considérez les hooks et le preseeding comme de l’exécution de code

L’option de démarrage `hooks` et les hooks live-config peuvent exécuter des fichiers depuis le système de fichiers racine, le support de démarrage ou une URL. Les hooks distants, les hooks modifiés sur le support et les preseeds non vérifiés peuvent s’exécuter avec les privilèges système. Utilisez uniquement des fichiers vérifiés provenant d’une source de confiance, privilégiez la distribution authentifiée et évitez les hooks distants sur les réseaux non fiables. Voir [live-config](/configuration/live-config.md) pour l’ordre d’exécution et les emplacements pris en charge.

## Sauvegardez et retirez les supports en toute sécurité

La persistance n’est pas une sauvegarde. Conservez une copie séparée des fichiers utilisateur et exportez ou copiez les sessions tant qu’elles sont saines. Testez la restauration sur un autre support. Arrêtez proprement avant de retirer un stockage inscriptible et prévoyez de l’espace libre pour les métadonnées de session et le fonctionnement du système de fichiers.

Avant de vous débarrasser d’un appareil, effacez-le de façon sécurisée en fonction de la technologie de stockage et de la sensibilité des données. Supprimer des fichiers ou reformater ne suffit pas toujours à rendre les anciennes données irrécupérables.
