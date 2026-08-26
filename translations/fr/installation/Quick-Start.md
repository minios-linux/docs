---
updated: 2026-08-26
---

# Démarrage rapide

Ce guide explique comment télécharger, écrire, démarrer et effectuer la configuration initiale de MiniOS.

## 1. Choisissez une édition

- **Flux** propose un ensemble de paquets réduit et l’environnement Flux.
- **Standard** est l’édition Xfce à usage général.
- **Toolbox** ajoute des outils d’administration, de diagnostic, de stockage et de récupération.
- **Ultra** inclut le plus large éventail d’applications.

La disponibilité des éditions et des environnements de bureau varie selon la version. Consultez
[À propos de MiniOS](/about/About-MiniOS.md) et la
[liste des paquets](/administration/Packages.md) avant de télécharger.

Téléchargez une image ISO depuis [minios.dev](https://minios.dev) ou la
[page des releases GitHub](https://github.com/minios-linux/minios-live/releases).
Vérifiez son empreinte avant utilisation ; voir
[Validation des téléchargements](/installation/Verifying-Downloads.md).

## 2. Préparer un périphérique cible

Utilisez un périphérique suffisamment grand pour l’ISO sélectionné ainsi que pour toute donnée ou session persistante que vous souhaitez conserver. La taille des ISO varie selon les versions, il est donc préférable de vérifier la taille lors du téléchargement et avec l’outil d’écriture, plutôt que de se fier à une taille fixe indiquée dans un guide. Sauvegardez d’abord le périphérique cible : la plupart des méthodes d’installation écrasent tout ou partie de son contenu.

Choisissez une méthode et lisez son guide avant de sélectionner un périphérique :

- Windows : [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), ou
  [Ventoy](/installation/tools/Ventoy.md)
- Linux : [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md), ou
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS : [`dd`](/installation/tools/dd.md) ou
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- Depuis MiniOS : [MiniOS Installer](/installation/MiniOS-Installer.md)

D’autres méthodes documentées sont [UNetbootin](/installation/tools/UNetbootin.md) et [Installation USB basée sur des fichiers](/installation/tools/File-Based-USB-Installation.md). Consultez [Outils de création USB](/installation/tools/USB-Creation-Tools.md) pour une comparaison et [Installer MiniOS](/installation/Installing-MiniOS.md) pour un aperçu de l’installation.

## 3. Comprendre la persistance avant d’écrire

La persistance n’est pas créée par chaque méthode d’écriture ou de démarrage.

- Une écriture d’image brute avec `dd`, Etcher ou un outil similaire reproduit l’ISO. Cela ne configure pas à lui seul une session persistante.
- Ventoy démarre normalement l’ISO en tant que fichier. La persistance MiniOS doit être configurée séparément.
- L’installateur MiniOS peut créer une installation live et configurer un stockage de session natif, DynFileFS, brut ou chiffré LUKS.
- Un démarrage neuf s’effectue volontairement sans persistance. D’autres entrées du menu de démarrage MiniOS permettent de reprendre, créer ou sélectionner des sessions lorsque du stockage inscriptible est disponible.
- Une installation native est un système installé de façon classique et n’utilise pas la persistance de session live de la même manière.

Utilisez [Modes de démarrage](/configuration/Boot-Modes.md) comme guide de référence pour le comportement visible des sessions live. Consultez [Gestion des sessions](/configuration/Session-Management.md) pour les choix de stockage, [Persistance Initrd](/configuration/Initrd-Persistence.md) pour le contrat détaillé au démarrage, et [Paramètres de démarrage](/configuration/Boot-Parameters.md) avant de modifier les options du noyau. Conservez une sauvegarde de vos fichiers importants quel que soit le mode de persistance.

## 4. Démarrer MiniOS

1. Éteignez l’ordinateur et connectez le périphérique préparé.
2. Ouvrez le menu de démarrage du firmware et sélectionnez l’entrée UEFI ou legacy du périphérique.
3. Sélectionnez une session neuve pour un test matériel initial, ou une session persistante uniquement si elle a déjà été configurée.
4. Vérifiez que l’affichage, le clavier, le stockage et le réseau fonctionnent avant d’effectuer des modifications d’installation irréversibles.

Si le périphérique n’apparaît pas ou si le bureau ne démarre pas, consultez la page [Compatibilité matérielle](/installation/Hardware-Compatibility.md) et [Dépannage](/administration/Troubleshooting.md). En cas d’échec lors de la détection de la source live, consultez [Découverte du système Initrd](/configuration/Initrd-System-Discovery.md).

## 5. Configurer le système

Ouvrez **Applications > Système > Configurer MiniOS**, ou exécutez :

```bash
minios-configurator
```

Le Configurateur modifie `/etc/live/config.conf`. Il permet de définir l’identité utilisateur,
les mots de passe, la langue, le fuseau horaire, le clavier, le nom d’hôte, les services, le stockage du répertoire utilisateur et les contrôles de sécurité. Il ne modifie pas directement le système en cours d’exécution ;
les paramètres enregistrés sont appliqués selon leur applicabilité, généralement
après un redémarrage ou lors de la création d’une nouvelle session.

Les profils de sécurité remplissent des paramètres concrets pour sudo, PolicyKit, SSH, XRDP, X11,
les indices de mot de passe, le verrouillage d’écran et la connexion automatique. Vérifiez les contrôles résultants plutôt que de considérer le nom du profil comme un paramètre actif. Consultez
[Renforcement de la sécurité](/administration/Security-Hardening.md) et le
[guide du Configurateur MiniOS](/configuration/MiniOS-Configurator.md). La
[référence du fichier de configuration](/configuration/Configuration-File.md) documente
les clés sous-jacentes.

Configurez les connexions filaires et Wi-Fi habituelles avec la [Configuration réseau](/configuration/Network-Configuration.md). Le paramètre de démarrage réseau `ip=` n’est pas un paramètre persistant de NetworkManager.

## 6. Installer des logiciels et sauvegarder son travail

Les modifications APT effectuées dans une session live ne sont conservées après redémarrage que si la session est persistante. Les modules SquashFS restent séparés de la session inscriptible et peuvent être chargés dans le système modulaire ; voir [Création de modules](/development/Creating-Modules.md) et [Chargement de modules Initrd](/configuration/Initrd-Module-Loading.md).

Enregistrez les fichiers importants sur un support reconnu comme inscriptible et testez au moins un arrêt propre et un redémarrage avant de vous fier à une session persistante.

## Obtenir de l’aide

- [Optimisation des performances](/administration/Performance-Optimization.md)
- [Applications et outils MiniOS](/about/MiniOS-Applications.md)
- [Sauvegarde et récupération](/administration/Backup-Recovery.md)
- [Foire aux questions](/about/FAQ.md)
- [Gestion du noyau](/administration/Kernel-Management.md)
- [Compiler MiniOS](/development/Building-MiniOS.md)
- [Reconstruire une ISO](/development/Rebuilding-ISO.md)
- [Problèmes sur GitHub](https://github.com/minios-linux/minios-live/issues)
- [Source de MiniOS](https://github.com/minios-linux/minios-live)
- [Documentation Debian](https://www.debian.org/doc/)
