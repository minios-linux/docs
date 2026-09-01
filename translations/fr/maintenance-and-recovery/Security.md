---
updated: 2026-08-31
---

# Sécurité

Les contrôles de sécurité MiniOS sont conçus autour du système live : sessions temporaires, sessions persistantes, supports amovibles et configuration au démarrage. Le Programme d’installation MiniOS peut également effectuer une conversion native. Le système obtenu conserve l’environnement de bureau sélectionné et l’identité visuelle MiniOS, mais les logiciels spécifiques au mode live MiniOS sont supprimés, ce qui permet de le sécuriser et de le maintenir avec les outils Debian habituels, plutôt que de le traiter comme un autre mode live.
Protégez la session en cours, les données persistantes, le support de démarrage et toute configuration appliquée au démarrage.

## Démarrer avec un support fiable

Téléchargez MiniOS depuis une source officielle et vérifiez l’ISO avant de l’écrire.
Suivez [Vérification des téléchargements](/installing-minios/Verifying-Downloads) et comparez le résultat avant de démarrer ou d’installer. La vérification permet de détecter un téléchargement endommagé ou substitué ; elle ne garantit pas qu’une clé USB déjà modifiée soit sûre.

Gardez la clé USB sous contrôle physique. Les mots de passe du firmware et l’ordre de démarrage restreint peuvent limiter les démarrages non autorisés occasionnels, mais n’offrent pas de chiffrement des fichiers sur le support. Secure Boot peut offrir une protection supplémentaire de la chaîne de démarrage sur les images et matériels compatibles ; vérifiez le comportement réel de la version et du firmware au lieu de supposer la prise en charge.

## Remplacer les identifiants par défaut

Une image live MiniOS non personnalisée utilise les identifiants publiés `live` / `evil` et `root` / `toor`, avec connexion automatique et accès administrateur sans mot de passe dans sa configuration orientée commodité. Toute personne pouvant accéder au système pourrait utiliser ces identifiants, surtout si SSH est actif.

Avant de rejoindre un réseau non fiable :

1. Définissez des mots de passe uniques pour l’utilisateur et root dans le Configurateur MiniOS.
2. Sélectionnez un profil de sécurité adapté et vérifiez chaque contrôle renseigné.
3. Désactivez SSH et XRDP sauf si l’accès à distance est nécessaire.
4. Redémarrez dans une nouvelle session lors de la modification des paramètres de compte ou de sécurité à usage unique, puis vérifiez le comportement de connexion et de privilèges obtenu.

Le Configurateur stocke les empreintes de mot de passe chiffrées plutôt que les mots de passe en clair. Si vous modifiez un compte persistant déjà créé, utilisez `passwd` pour l’utilisateur courant et `sudo passwd root` pour root. Après une conversion native, utilisez les outils de gestion des comptes Debian habituels.

## Utiliser les contrôles de sécurité du Configurateur

Le Configurateur MiniOS propose trois profils. Un profil remplit des paramètres concrets ; le nom du profil lui-même n’est pas enregistré comme une clé de configuration à l’exécution, et chaque paramètre reste modifiable indépendamment.

| Profil | Comportement principal |
| --- | --- |
| `convenient` | Compatible avec la connexion automatique, sudo et PolicyKit sans mot de passe, connexion root et SSH par mot de passe autorisées, XRDP/X11/écran de verrouillage assouplis, indices de mot de passe affichés. |
| `balanced` | Pas de connexion automatique, sudo et PolicyKit nécessitent un mot de passe, connexion root SSH refusée mais connexion SSH par mot de passe autorisée, XRDP/X11/écran de verrouillage renforcés. |
| `strict` | Pas de connexion automatique, sudo et PolicyKit nécessitent un mot de passe, connexions root et SSH par mot de passe refusées, XRDP désactivé, X11/écran de verrouillage renforcés, indices de mot de passe masqués. |

Les valeurs par défaut de l’installateur varient selon le mode de déploiement : les installations live privilégient `convenient`, tandis que la conversion native commence avec `balanced`. Le paramètre natif est appliqué lors de la conversion ; après installation, utilisez la configuration de sécurité Debian habituelle. Ce sont des valeurs par défaut, pas des recommandations pour tous les modèles de menace.

Les mêmes paramètres sont disponibles sous forme de clés de configuration documentées, notamment `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` et `LIVE_LOCKSCREEN_MODE`. Privilégiez ces clés ou le Configurateur plutôt que de modifier les fichiers sudoers, PolicyKit, display-manager ou SSH générés. Voir [Fichier de configuration](/reference/configuration/config.conf).
Pour le comportement d’enregistrement et l’applicabilité des paramètres, consultez le [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

La création de comptes, les mots de passe, `LIVE_CONFIG_NOROOT` et la posture de sécurité sont des paramètres à usage unique appliqués lors de la création d’une nouvelle session. Le Configurateur indique l’applicabilité de chaque contrôle. Les paramètres reconfigurables, comme les services, sont appliqués après redémarrage.

## Sécuriser l’accès à distance

SSH peut être activé dans une image MiniOS pour des besoins de récupération. Sur un réseau où les autres utilisateurs ne sont pas fiables, considérez que les identifiants par défaut publiés sont exposés tant que vous n’avez pas confirmé le contraire.

- Si SSH n’est pas nécessaire, ajoutez `ssh` à `DISABLE_SERVICES` dans le Configurateur et retirez-le de `ENABLE_SERVICES` si présent.
- Si SSH est requis, refusez la connexion root avec `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Privilégiez l’authentification par clé. Vérifiez la connexion par clé dans une session séparée avant de définir `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limitez l’accès entrant avec le pare-feu réseau ou le routeur, et n’exposez jamais un système de récupération portable directement à Internet.
- Vérifiez XRDP séparément. Le profil strict le désactive ; le profil équilibré le renforce mais ne désactive pas nécessairement son service.

Les paramètres de démarrage peuvent remplacer les valeurs du fichier de configuration. Analysez tout comportement inattendu d’un service à l’aide des [Paramètres de démarrage](/reference/Boot-Parameters).

## Chiffrer les données persistantes

Une persistance native, DynFileFS ou brute non chiffrée peut être lue par toute personne ayant accès à l’appareil. Le Programme d’installation MiniOS peut configurer un conteneur LUKS chiffré pour une session live lorsque l’initrd source annonce la prise en charge de LUKS. L’initrd crée `changes.luks` au premier démarrage et demande sa phrase de passe ; le programme d’installation ne reçoit ni ne stocke cette phrase de passe.

La persistance LUKS protège le contenu tant que le conteneur est fermé. Elle ne protège pas les données après déverrouillage, les fichiers de démarrage non chiffrés, les fichiers copiés en dehors du conteneur, ni un système de fichiers racine natif. La persistance de session LUKS n’est pas un chiffrement natif du root. Utilisez une phrase de passe robuste et conservez une sauvegarde testée.

Voir [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) et [Gestion des sessions](/using-minios/Sessions-and-Persistence).

## Appliquer les mises à jour de façon maîtrisée

Actualisez les métadonnées des paquets et installez les mises à jour de sécurité Debian dans les sessions live persistantes en utilisant le flux de travail APT habituel lorsque cela est approprié. Les modifications APT dans une session live fraîche disparaissent au redémarrage. Les modules de base SquashFS sont en lecture seule, donc remplacer l’ISO ou les modules par une version plus récente et fiable de MiniOS est souvent la méthode la plus propre pour mettre à jour le système live de base. Après une conversion native, la maintenance de la sécurité des paquets se fait simplement via le flux de travail APT Debian classique pour ce système installé.

Voir [Mises à jour logicielles](/maintenance-and-recovery/Updating-MiniOS) pour les flux de travail séparés APT, module, image et noyau.

Avant une mise à jour importante :

- Sauvegardez les fichiers importants et les sessions persistantes.
- Vérifiez que suffisamment d’espace libre est disponible.
- Évitez d’interrompre les écritures ou d’éteindre l’appareil.
- Redémarrez et vérifiez le système mis à jour avant de supprimer l’ancien support ou la session connue comme fonctionnelle.

## Considérez les hooks et le preseeding comme de l’exécution de code

L’option de démarrage `hooks` et les hooks live-config peuvent exécuter des fichiers depuis le système de fichiers racine, le support de démarrage ou une URL. Les hooks distants, les hooks modifiés sur le support et les preseeds non vérifiés peuvent s’exécuter avec les privilèges système. Utilisez uniquement des fichiers vérifiés provenant d’une source de confiance, privilégiez la distribution authentifiée et évitez les hooks distants sur des réseaux non fiables. Voir [live-config](/reference/configuration/live-config) pour l’ordre d’exécution et les emplacements pris en charge.

## Sauvegarder et retirer les supports en toute sécurité

La persistance n’est pas une sauvegarde. Conservez une copie séparée des fichiers utilisateurs et exportez ou copiez les sessions tant qu’elles sont saines. Testez la restauration sur un support différent.
Arrêtez proprement le système avant de retirer un support inscriptible, et gardez de l’espace libre pour les métadonnées de session et le fonctionnement du système de fichiers.

Avant de vous débarrasser d’un appareil, effacez-le de façon sécurisée selon la technologie de stockage et la sensibilité des données. Supprimer des fichiers ou reformater ne suffit généralement pas à rendre les anciennes données irrécupérables.
