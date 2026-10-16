---
updated: 2026-10-15
---

# Sécurité

Les contrôles de sécurité de MiniOS sont conçus pour le système en fonctionnement : sessions temporaires, sessions persistantes, supports amovibles et configuration au démarrage. Le Programme d’installation MiniOS peut également effectuer une conversion native. Le système obtenu conserve l’environnement de bureau sélectionné et l’identité visuelle MiniOS, mais les logiciels MiniOS propres au système live sont supprimés. Vous pouvez alors le sécuriser et le maintenir à l’aide des outils Debian habituels, plutôt que de le traiter comme un autre mode live.
Protégez la session en cours, les données persistantes, le support de démarrage et toute configuration appliquée au démarrage.

## Commencez par un support fiable

Téléchargez MiniOS depuis une source officielle et vérifiez l’ISO avant de l’écrire sur le support.
Suivez les instructions de [Vérification des téléchargements](/installing-minios/Verifying-Downloads) et comparez le résultat avant de démarrer ou d’installer le système. La vérification détecte les téléchargements endommagés ou remplacés ; elle ne garantit pas qu’une clé USB déjà modifiée est sûre.

Gardez le périphérique USB sous contrôle physique. Les mots de passe du firmware et la restriction de l’ordre de démarrage peuvent limiter les démarrages non autorisés occasionnels, mais ne chiffrent pas les fichiers présents sur le périphérique. Secure Boot peut renforcer la protection de la chaîne de démarrage sur les images et le matériel compatibles ; vérifiez le comportement de la version et du firmware concernés au lieu de supposer que cette fonction est prise en charge.

## Remplacez les identifiants par défaut

Une image live MiniOS non personnalisée utilise les identifiants publiés `live` / `evil` et `root` / `toor`, avec une connexion automatique et un accès administratif sans mot de passe dans sa configuration privilégiant la simplicité. Toute personne pouvant accéder au système peut être en mesure d’utiliser ces identifiants, surtout si SSH est activé.

Avant de vous connecter à un réseau non fiable :

1. Définissez des mots de passe uniques pour l’utilisateur et root dans le Configurateur MiniOS.
2. Sélectionnez un profil de sécurité adapté et vérifiez chaque contrôle renseigné.
3. Désactivez SSH et XRDP, sauf si un accès à distance est nécessaire.
4. Redémarrez dans une nouvelle session après avoir modifié des paramètres ponctuels de compte ou de sécurité, puis vérifiez le comportement de connexion et les privilèges obtenus.

Le Configurator stocke des condensats de mots de passe chiffrés plutôt que les mots de passe en clair. Pour modifier un compte persistant déjà créé, utilisez `passwd` pour l’utilisateur actuel et `sudo passwd root` pour root. Après une conversion native, utilisez les outils habituels de gestion des comptes Debian.

## Utilisez les contrôles de sécurité du Configurator

Le Configurateur MiniOS propose trois profils. Chaque profil définit des paramètres concrets ; son nom n’est pas enregistré comme clé de configuration à l’exécution et chaque paramètre reste modifiable indépendamment.

| Profil | Comportement principal |
| --- | --- |
| `convenient` | Compatible avec la connexion automatique, sudo et PolicyKit sans mot de passe, connexions SSH de root et par mot de passe autorisées, paramètres XRDP/X11/écran de verrouillage assouplis, indications de mot de passe affichées. |
| `balanced` | Pas de connexion automatique, mot de passe requis pour sudo et PolicyKit, connexion SSH de root interdite mais connexion par mot de passe autorisée, paramètres XRDP/X11/écran de verrouillage renforcés. |
| `strict` | Pas de connexion automatique, mot de passe requis pour sudo et PolicyKit, connexions SSH de root et par mot de passe interdites, XRDP désactivé, paramètres X11/écran de verrouillage renforcés, indications de mot de passe masquées. |

Les paramètres par défaut du programme d’installation varient selon le mode de déploiement : les installations live privilégient `convenient`, tandis que la conversion native utilise par défaut `balanced`. Le paramètre natif est appliqué pendant la conversion ; après l’installation, utilisez les paramètres de sécurité Debian habituels. Il s’agit de paramètres par défaut, et non de recommandations adaptées à tous les modèles de menace.

Les mêmes paramètres sont disponibles sous forme de clés de configuration documentées, notamment `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` et `LIVE_LOCKSCREEN_MODE`. Privilégiez ces clés ou le Configurator plutôt que de modifier les fichiers générés sudoers, PolicyKit, du gestionnaire d’affichage ou de SSH. Consultez le [Fichier de configuration](/reference/configuration/config.conf).
Pour en savoir plus sur l’enregistrement des paramètres et leur applicabilité, consultez [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

La création de compte, les mots de passe, `LIVE_CONFIG_NOROOT` et le niveau de sécurité sont des paramètres ponctuels utilisés lors de la création d’une nouvelle session. Le Configurator indique l’applicabilité de chaque contrôle. Les paramètres reconfigurables, comme les services, sont appliqués après le redémarrage.

## Sécuriser l’accès à distance

SSH peut être activé dans une image MiniOS à des fins de récupération. Sur un réseau où les autres utilisateurs ne sont pas de confiance, considérez que les identifiants par défaut publiés sont compromis jusqu’à ce que vous ayez vérifié le contraire.

- Si SSH n’est pas nécessaire, ajoutez `ssh` à `DISABLE_SERVICES` dans Configurator et supprimez-le de `ENABLE_SERVICES` s’il est présent.
- Si SSH est nécessaire, désactivez la connexion root avec `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Privilégiez l’authentification par clé. Vérifiez la connexion par clé dans une autre session avant de définir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limitez les connexions entrantes à l’aide du pare-feu réseau ou du routeur, et n’exposez pas directement un système de récupération portable à Internet.
- Examinez XRDP séparément. Le profil strict le désactive ; le profil équilibré le renforce, mais ne désactive pas nécessairement son service.

Les paramètres de démarrage peuvent remplacer les valeurs des fichiers de configuration. En cas de comportement inattendu d’un service, vérifiez les [paramètres de démarrage](/reference/Boot-Parameters).

## Chiffrer les données persistantes

Les données persistantes non chiffrées aux formats natif, DynFileFS, DynBlk, VMDK, raw et SquashFS sont accessibles à quiconque obtient l’appareil. MiniOS peut ajouter une couche LUKS2 à Raw, DynFileFS, DynBlk ou VMDK. LUKS2 reste une couche de chiffrement, et non un mode de session distinct. Pour la créer au démarrage, sélectionnez cette option avec`perchencrypt=luks` ; les sessions existantes récupèrent leur état de chiffrement depuis les métadonnées de session, et non d’une commande passée ultérieurement en ligne de commande.

La limite du chiffrement varie selon le moteur. Raw chiffre l’image de bloc logique à l’intérieur de `changes.img` ; DynFileFS chiffre le `virtual.dat` exposé ; DynBlk et VMDK chiffrent le périphérique de bloc exposé par le pilote DynBlk. Les métadonnées de session, les fichiers de démarrage, les métadonnées du moteur et les descripteurs VMDK situés hors du périphérique de bloc chiffré, ainsi que les fichiers sans rapport présents sur le support, restent visibles. La compression du moteur DynBlk est désactivée lorsque LUKS2 est sélectionné ; VMDK ne prend pas en charge la compression du moteur.

La création au démarrage demande deux fois la phrase secrète dans l’initrd. Lorsque Installer précrée une session chiffrée sur la cible, son assistant recueille et confirme la phrase secrète, puis la transmet à `minios-session` via l’entrée standard. Elle n’est stockée ni dans la configuration, ni dans les journaux, ni dans les arguments du processus. Les sessions chiffrées existantes demandent leur phrase secrète au démarrage ; après trois tentatives de déverrouillage infructueuses, le démarrage s’arrête au lieu de basculer vers du texte en clair, un autre moteur ou un remplacement en mémoire pour la même demande de persistance.

La couche de persistance LUKS2 MiniOS protège le contenu du système de fichiers lorsque le mappeur est fermé. Elle ne protège pas les données après déverrouillage, les fichiers de démarrage non chiffrés, les fichiers copiés hors du moteur chiffré ni un système de fichiers racine natif. Le chiffrement de la persistance par couches ne chiffre pas la racine de manière native. Les exportations logiques contiennent les fichiers de session déchiffrés ; protégez donc vos archives de sauvegarde séparément. Utilisez une phrase secrète robuste et conservez une sauvegarde testée.

Le stockage temporaire du cache ou du journal réduit les écritures, mais ne constitue pas un chiffrement. Avec une persistance durable, MiniOS conserve `minios-boot` et `live-config` les diagnostics dans l’espace de stockage de la session, même lorsque `LIVE_LOG_STORAGE=volatile`. Pour une persistance durable SquashFS, ces fichiers se trouvent hors de `changes.sb`, dans le répertoire `boot-logs/` de la session. Avec `perchtoram`, la session et ses diagnostics sont stockés en mémoire ; leur persistance nécessite une sauvegarde réussie sur le support. Un périphérique de stockage non chiffré expose ses journaux ainsi que ses autres fichiers. `LIVE_CONFIG_DEBUG=true` active également les traces détaillées et les copies des données d’entrée utilisées pour la fusion des comptes utilisateur ; laissez le débogage désactivé en usage normal et examinez ces journaux avant de les partager. Voir [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Voir [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) et [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Appliquer les mises à jour avec discernement

Dans les sessions live persistantes, actualisez les métadonnées des paquets et installez les mises à jour de sécurité Debian avec le processus APT habituel, lorsque cela est approprié. Les modifications APT effectuées dans une nouvelle session live disparaissent au redémarrage. Les modules de base SquashFS sont en lecture seule ; remplacer l’ISO ou les modules par une version plus récente et fiable de MiniOS est souvent la méthode la plus simple pour mettre à jour le système live de base. Après une conversion native, la maintenance de sécurité des paquets suit simplement le processus APT Debian habituel pour le système installé.

Voir [Mises à jour logicielles](/maintenance-and-recovery/Updating-MiniOS) pour découvrir les procédures distinctes concernant APT, les modules, les images et le noyau.

Avant une mise à jour importante :

- Sauvegardez les fichiers importants et les sessions persistantes.
- Vérifiez qu’il reste suffisamment d’espace libre.
- Évitez d’interrompre les écritures ou d’éteindre l’appareil.
- Redémarrez et vérifiez le système mis à jour avant de vous débarrasser du support ou de la session précédente dont le bon fonctionnement est connu.

## Considérez les hooks et le préamorçage comme du code exécutable

L’option de démarrage `hooks` et les hooks live-config peuvent exécuter des fichiers provenant du système de fichiers racine, du support de démarrage ou d’une URL. Les hooks distants, les hooks provenant de supports modifiés et les fichiers de préamorçage non vérifiés peuvent s’exécuter avec les privilèges système. Utilisez uniquement des fichiers vérifiés provenant d’une source fiable, privilégiez une distribution authentifiée et évitez les hooks distants sur les réseaux non fiables. Voir [live-config](/reference/configuration/live-config) pour connaître l’ordre d’exécution et les emplacements pris en charge.

## Sauvegardez et mettez au rebut vos supports en toute sécurité

La persistance des données ne constitue pas une sauvegarde. Conservez une copie séparée des fichiers utilisateur et exportez ou copiez les sessions tant qu’elles sont en bon état. Testez la restauration sur un autre support.
Arrêtez le système correctement avant de retirer un support de stockage inscriptible et prévoyez suffisamment d’espace libre pour les métadonnées de session et le fonctionnement du système de fichiers.

Avant de mettre un appareil au rebut, effacez-le de manière sécurisée en fonction de la technologie de stockage et de la sensibilité des données. La simple suppression des fichiers ou le reformatage ne garantit pas que les anciennes données seront irrécupérables.
