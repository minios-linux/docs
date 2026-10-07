---
updated: 2026-10-06
---

# Sécurité

Les contrôles de sécurité MiniOS sont conçus autour du système live : sessions temporaires, sessions persistantes, supports amovibles et configuration au démarrage. Le Programme d’installation MiniOS peut également effectuer une conversion native. Le système résultant conserve l’environnement de bureau sélectionné et l’identité visuelle MiniOS, mais le logiciel spécifique au mode live MiniOS est supprimé ; il faut donc le sécuriser et l’administrer avec les outils Debian habituels, au lieu de le traiter comme un autre mode live.
Protégez la session en cours, les données persistantes, le support de démarrage et toute configuration appliquée au démarrage.

## Commencez avec un support de confiance

Téléchargez MiniOS depuis une source officielle et vérifiez l’ISO avant de l’écrire.
Suivez [Vérification des téléchargements](/installing-minios/Verifying-Downloads) et comparez le résultat avant de démarrer ou d’installer. La vérification détecte un téléchargement endommagé ou remplacé ; elle ne garantit pas qu’un périphérique USB déjà modifié est sûr.

Gardez le périphérique USB sous contrôle physique. Les mots de passe du firmware et la restriction de l’ordre de démarrage peuvent limiter les démarrages non autorisés occasionnels, mais n’offrent pas de chiffrement des fichiers sur le périphérique. Secure Boot peut fournir une protection supplémentaire de la chaîne de démarrage sur les images et matériels compatibles ; vérifiez le comportement réel de la version et du firmware au lieu de supposer leur prise en charge.

## Remplacez les identifiants par défaut

Une image live MiniOS non personnalisée utilise les identifiants publiés `live` / `evil` et `root` / `toor`, avec connexion automatique et accès administrateur sans mot de passe dans sa configuration orientée commodité. Toute personne ayant accès au système peut utiliser ces identifiants, en particulier si SSH est actif.

Avant de rejoindre un réseau non fiable :

1. Définissez des mots de passe uniques pour l’utilisateur et root dans le Configurateur MiniOS.
2. Sélectionnez un profil de sécurité adapté et vérifiez chaque contrôle renseigné.
3. Désactivez SSH et XRDP sauf si l’accès à distance est nécessaire.
4. Redémarrez dans une nouvelle session après avoir modifié les paramètres de compte unique ou de sécurité, puis vérifiez le comportement de connexion et de privilèges obtenu.

Le Configurateur stocke les empreintes de mots de passe chiffrées et non les mots de passe en clair. Si vous modifiez un compte persistant déjà créé, utilisez `passwd` pour l’utilisateur actuel et `sudo passwd root` pour root. Après une conversion native, utilisez les outils de gestion de comptes Debian habituels.

## Utiliser les contrôles de sécurité du Configurateur

Le Configurateur MiniOS propose trois profils. Un profil applique des paramètres concrets ; le nom du profil n’est pas enregistré comme clé de configuration à l’exécution, et chaque paramètre reste modifiable individuellement.

| Profil | Comportement principal |
| --- | --- |
| `convenient` | Compatible avec la connexion automatique, sudo et PolicyKit sans mot de passe, accès root et SSH par mot de passe autorisés, XRDP/X11/écran de verrouillage assouplis, indices de mot de passe affichés. |
| `balanced` | Pas de connexion automatique, sudo et PolicyKit nécessitent un mot de passe, connexion SSH root refusée mais SSH par mot de passe autorisé, XRDP/X11/écran de verrouillage renforcés. |
| `strict` | Pas de connexion automatique, sudo et PolicyKit nécessitent un mot de passe, connexion SSH root et par mot de passe refusée, XRDP désactivé, X11/écran de verrouillage renforcés, indices de mot de passe masqués. |

Les paramètres par défaut de l’installateur varient selon le mode de déploiement : les installations live privilégient `convenient`, tandis que la conversion native démarre avec `balanced`. Le paramètre natif est appliqué lors de la conversion ; après installation, utilisez la configuration de sécurité Debian standard. Il s’agit de valeurs par défaut, non de recommandations pour chaque modèle de menace.

Les mêmes paramètres sont disponibles sous forme de clés de configuration documentées, notamment `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, et `LIVE_LOCKSCREEN_MODE`. Privilégiez ces clés ou le Configurateur plutôt que de modifier les fichiers sudoers, PolicyKit, display-manager ou SSH générés. Voir [Fichier de configuration](/reference/configuration/config.conf).
Pour le comportement d’enregistrement et l’applicabilité des paramètres, voir [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

La création de comptes, les mots de passe, `LIVE_CONFIG_NOROOT`, et la posture de sécurité sont des paramètres ponctuels appliqués lors de la création d’une nouvelle session. Le Configurateur indique l’applicabilité de chaque contrôle. Les paramètres reconfigurables comme les services sont appliqués après redémarrage.

## Sécuriser l’accès à distance

SSH peut être activé dans une image MiniOS pour des besoins de récupération. Sur un réseau où les autres utilisateurs ne sont pas fiables, considérez que les identifiants par défaut publiés sont exposés tant que vous ne les avez pas changés.

- Si SSH n’est pas nécessaire, ajoutez `ssh` à `DISABLE_SERVICES` dans le Configurateur et retirez-le de `ENABLE_SERVICES` s’il est présent.
- Si SSH est requis, interdisez la connexion root avec `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Privilégiez l’authentification par clé. Vérifiez la connexion par clé dans une session séparée avant de définir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limitez l’accès entrant via le pare-feu réseau ou le routeur, et n’exposez jamais directement un système de récupération portable à Internet.
- Vérifiez XRDP séparément. Le profil strict le désactive ; le profil équilibré le renforce mais ne désactive pas forcément son service.

Les paramètres de démarrage peuvent remplacer les valeurs du fichier de configuration. Analysez tout comportement inattendu du service en consultant [Paramètres de démarrage](/reference/Boot-Parameters).

## Chiffrer les données persistantes

Les persistances non chiffrées native, DynFileFS, DynBlk, VMDK, raw et SquashFS peuvent être lues par toute personne ayant accès au périphérique. MiniOS permet de superposer LUKS2 sur Raw, DynFileFS, DynBlk ou VMDK. LUKS2 reste une couche de chiffrement, pas un mode de session distinct. Pour la création au démarrage, sélectionnez-le avec `perchencrypt=luks` ; les sessions existantes récupèrent leur état de chiffrement depuis les métadonnées de session, et non via une modification ultérieure de la ligne de commande.

La frontière de chiffrement dépend du backend. Raw chiffre l’image de blocs logiques à l’intérieur de `changes.img` ; DynFileFS chiffre le `virtual.dat` exposé ; DynBlk et VMDK chiffrent le périphérique de blocs exposé par le pilote DynBlk. Les métadonnées de session, fichiers de démarrage, métadonnées du backend et descripteurs VMDK hors du périphérique chiffré, ainsi que les fichiers non liés présents sur le support, restent visibles. La compression backend DynBlk est désactivée lorsque LUKS2 est sélectionné ; VMDK ne propose pas de compression backend.

L’initrd crée le système de fichiers chiffré lors de la première utilisation et demande sa phrase de passe ; l’installateur ne reçoit ni ne stocke cette phrase de passe. Au démarrage, trois tentatives de déverrouillage échouées interrompent la séquence de démarrage, sans retour en mode non chiffré, vers un autre backend ou vers un remplacement en mémoire sous la même demande de persistance.

La couche de persistance LUKS2 MiniOS protège le contenu du système de fichiers tant que le mapper est fermé. Elle ne protège pas les données après le déverrouillage, les fichiers de démarrage non chiffrés, les fichiers copiés hors du backend chiffré, ni un système de fichiers racine natif. Le chiffrement de persistance en couche n’est pas un chiffrement natif de la racine. Les exports logiques contiennent les fichiers de session déchiffrés, il faut donc protéger les archives de sauvegarde séparément. Utilisez une phrase de passe robuste et conservez une sauvegarde testée.

Le cache temporaire ou le stockage du journal vise à réduire les écritures, ce n’est pas un chiffrement. Même avec `LIVE_LOG_STORAGE=volatile`, MiniOS conserve `minios-boot` et `live-config` les diagnostics sur le stockage durable de la session. Pour SquashFS, ces fichiers sont en dehors de `changes.sb`, dans le répertoire `boot-logs/` de la session. Un périphérique de stockage non chiffré les expose avec les autres fichiers. `LIVE_CONFIG_DEBUG=true` active également des traces détaillées et des copies des entrées de fusion de comptes utilisateurs ; gardez le mode debug désactivé en usage courant et examinez ces journaux avant tout partage. Voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Voir [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) et [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Appliquer les mises à jour de façon réfléchie

Actualisez les métadonnées des paquets et installez les mises à jour de sécurité Debian dans les sessions live persistantes en utilisant le flux de travail APT habituel lorsque cela est approprié. Les modifications APT dans une session live fraîche disparaissent au redémarrage. Les modules de base SquashFS sont en lecture seule, donc remplacer l’ISO ou les modules par une version MiniOS plus récente et de confiance est souvent la méthode la plus propre pour mettre à jour le système live de base. Après conversion native, la maintenance de la sécurité des paquets suit simplement le flux de travail APT Debian classique pour ce système installé.

Voir [Mises à jour logicielles](/maintenance-and-recovery/Updating-MiniOS) pour les procédures distinctes APT, module, image et noyau.

Avant une mise à jour importante :

- Sauvegardez les fichiers importants et les sessions persistantes.
- Vérifiez que suffisamment d’espace libre est disponible.
- Évitez d’interrompre les écritures ou d’éteindre le périphérique.
- Redémarrez et vérifiez le système mis à jour avant de supprimer l’ancien support ou la session connue comme fonctionnelle.

## Considérez les hooks et le preseeding comme de l’exécution de code

L’option de démarrage `hooks` et les hooks live-config peuvent exécuter des fichiers depuis le système de fichiers racine, le support de démarrage ou une URL. Les hooks distants, les hooks modifiés sur le support et les preseeds non vérifiés peuvent s’exécuter avec les privilèges système. Utilisez uniquement des fichiers vérifiés provenant d’une source fiable, privilégiez la distribution authentifiée et évitez les hooks distants sur des réseaux non fiables. Voir [live-config](/reference/configuration/live-config) pour l’ordre d’exécution et les emplacements pris en charge.

## Sauvegarder et retirer les supports en toute sécurité

La persistance n’est pas une sauvegarde. Conservez une copie distincte des fichiers utilisateurs et exportez ou copiez les sessions tant qu’elles sont saines. Testez la restauration sur différents supports.
Arrêtez proprement le système avant de retirer un support inscriptible et laissez de l’espace libre pour les métadonnées de session et le fonctionnement du système de fichiers.

Avant de vous débarrasser d’un périphérique, effacez-le de façon sécurisée en fonction de la technologie de stockage et de la sensibilité des données. Supprimer les fichiers ou reformater ne suffit pas forcément à rendre les anciennes données irrécupérables.
