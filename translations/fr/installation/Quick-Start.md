# Démarrage rapide

Ce guide explique comment télécharger, écrire, démarrer et effectuer la configuration initiale de MiniOS.

## 1. Choisir une édition

- **Minimum** propose un ensemble de paquets réduit et l’environnement Flux.
- **Standard** est l’édition Xfce polyvalente.
- **Toolbox** ajoute des outils d’administration, de diagnostic, de stockage et de récupération.
- **Ultra** inclut le plus large éventail d’applications.

La disponibilité des éditions et des environnements de bureau varie selon la version. Consultez
[À propos de MiniOS](/about/About-MiniOS.md) et la
[liste des paquets](/administration/Packages.md) avant de télécharger.

Téléchargez une image ISO depuis [minios.dev](https://minios.dev) ou la
[page des versions GitHub](https://github.com/minios-linux/minios-live/releases).
Vérifiez son empreinte avant de l’utiliser ; voir
[Vérification des téléchargements](/installation/Verifying-Downloads.md).

## 2. Préparer un périphérique cible

Utilisez un support suffisamment grand pour l’ISO sélectionné ainsi que pour toute donnée ou session persistante que vous souhaitez conserver. La taille des ISO varie selon les versions, vérifiez donc la taille du téléchargement et de l’outil d’écriture plutôt que de vous fier à une taille fixe indiquée dans un guide. Sauvegardez d’abord le périphérique cible : la plupart des méthodes d’installation écrasent tout ou partie de son contenu.

Choisissez une méthode et lisez son guide avant de sélectionner un périphérique :

- Windows : [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md) ou
  [Ventoy](/installation/tools/Ventoy.md)
- Linux : [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md) ou
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS : [`dd`](/installation/tools/dd.md) ou
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- Depuis MiniOS : [MiniOS Installer](/installation/MiniOS-Installer.md)

D’autres méthodes documentées sont [UNetbootin](/installation/tools/UNetbootin.md) et la [méthode originale](/installation/tools/Original-Method.md). Consultez
[Outils de création USB](/installation/tools/USB-Creation-Tools.md) pour une comparaison et
[Installation de MiniOS](/installation/Installing-MiniOS.md) pour un aperçu de l’installation.

## 3. Comprendre la persistance avant l’écriture

La persistance n’est pas créée par chaque méthode d’écriture ou de démarrage.

- Une écriture brute d’image avec `dd`, Etcher ou un outil similaire reproduit l’ISO. Cela ne configure pas une session persistante par défaut.
- Ventoy démarre généralement l’ISO comme un fichier. La persistance MiniOS doit être configurée séparément.
- MiniOS Installer peut créer une installation live et configurer un stockage de session natif, DynFileFS, brut ou chiffré LUKS.
- Un démarrage neuf fonctionne volontairement sans persistance. D’autres entrées du menu de démarrage MiniOS permettent de reprendre, créer ou sélectionner des sessions lorsque du stockage inscriptible est disponible.
- Une installation native est un système installé classique et n’utilise pas la persistance de session live de la même manière.

Consultez [Gestion des sessions](/configuration/Session-Management.md) et
[Paramètres de démarrage](/configuration/Boot-Parameters.md) avant de modifier le stockage des sessions. Conservez une sauvegarde de vos fichiers importants quel que soit le mode de persistance.

## 4. Démarrer MiniOS

1. Éteignez l’ordinateur et branchez le périphérique préparé.
2. Ouvrez le menu de démarrage du firmware et sélectionnez l’entrée UEFI ou legacy du périphérique.
3. Sélectionnez une session neuve pour un test matériel initial, ou une session persistante uniquement si elle a déjà été configurée.
4. Vérifiez que l’affichage, le clavier, le stockage et le réseau fonctionnent avant d’effectuer des modifications d’installation destructrices.

Si le périphérique n’apparaît pas ou si le bureau ne démarre pas, consultez
[Compatibilité matérielle](/installation/Hardware-Compatibility.md) et
[Résolution des problèmes](/administration/Troubleshooting.md).

## 5. Configurer le système

Ouvrez **Applications > Système > Configurer MiniOS**, ou exécutez :

```bash
minios-configurator
```

Le configurateur modifie `/etc/live/config.conf`. Il permet de définir l’identité utilisateur, les mots de passe, la langue, le fuseau horaire, le clavier, le nom d’hôte, les services, le stockage du dossier utilisateur et les contrôles de sécurité. Il ne modifie pas directement le système en cours d’exécution ; les paramètres enregistrés sont appliqués selon la pertinence de chaque réglage, généralement après un redémarrage ou lors de la création d’une nouvelle session.

Les profils de sécurité remplissent des paramètres concrets pour sudo, PolicyKit, SSH, XRDP, X11, les indices de mot de passe, le verrouillage d’écran et la connexion automatique. Vérifiez les contrôles résultants plutôt que de considérer le nom du profil comme un paramètre actif. Consultez
[Renforcement de la sécurité](/administration/Security-Hardening.md) et le
[guide du configurateur MiniOS](/configuration/MiniOS-Configurator.md). La
[référence du fichier de configuration](/configuration/Configuration-File.md) documente les clés sous-jacentes.

## 6. Installer des logiciels et sauvegarder son travail

Les modifications APT effectuées lors d’une session live ne sont conservées au redémarrage que si cette session est persistante. Les modules SquashFS restent séparés de la session inscriptible et peuvent être chargés dans le cadre du système modulaire ; voir
[Création de modules](/development/Creating-Modules.md).

Enregistrez les fichiers importants sur un support reconnu comme inscriptible et testez un arrêt propre suivi d’un redémarrage avant de vous fier à une session persistante.

## Obtenir de l’aide

- [Optimisation des performances](/administration/Performance-Optimization.md)
- [Gestion du noyau](/administration/Kernel-Management.md)
- [Construire MiniOS](/development/Building-MiniOS.md)
- [Reconstruire une ISO](/development/Rebuilding-ISO.md)
- [Problèmes sur GitHub](https://github.com/minios-linux/minios-live/issues)
- [Source MiniOS](https://github.com/minios-linux/minios-live)
- [Documentation Debian](https://www.debian.org/doc/)
