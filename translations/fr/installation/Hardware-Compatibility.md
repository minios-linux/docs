# Guide de compatibilité matérielle

La prise en charge du matériel dépend de la version et de l’image MiniOS : la distribution de base, le noyau, le microprogramme, les modules inclus et l’édition sont tous importants. Consultez la description de la version correspondant à l’image que vous avez téléchargée, puis testez une session live neuve avant de modifier les disques ou de compter sur la machine pour un usage persistant.

## Configuration requise

Les images MiniOS PC publiées ciblent l’architecture **amd64** (x86 64 bits), sauf indication contraire dans la description de la version. Les ressources nécessaires varient selon l’image, l’édition, l’environnement de bureau, les applications et le mode de démarrage :

- Le processeur doit être compatible avec l’architecture de l’image et le mode de microprogramme sélectionné.
- La RAM doit être suffisante pour l’édition choisie et la charge de travail. Les modes `toram` nécessitent
  une mémoire supplémentaire pour les données d’image copiées.
- Le support d’amorçage doit offrir assez d’espace pour l’image téléchargée. La persistance, les données utilisateur et une installation native requièrent un espace d’écriture supplémentaire.
- Les exigences graphiques dépendent de l’environnement de bureau et des applications dans l’édition sélectionnée.

Écrire une image sur un support de plus grande capacité ne crée pas automatiquement un espace de stockage persistant. Consultez le guide de référence [Modes de démarrage](/configuration/Boot-Modes.md) pour le comportement du démarrage live et [Démarrage rapide](/installation/Quick-Start.md) pour la préparation du support.

## Compatibilité des composants

### Processeurs

La compatibilité dépend de l’architecture et du noyau fournis dans l’image sélectionnée. Consultez les notes de version si vous utilisez un processeur récent ou des fonctionnalités CPU nécessitant la prise en charge d’un noyau plus récent.

### Graphiques

La prise en charge graphique dépend du pilote noyau, du microprogramme et de la pile graphique utilisateur présents dans l’image. Une carte peut fournir un affichage de base sans pour autant offrir l’accélération matérielle ou la prise en charge de tous les connecteurs. Certains matériels NVIDIA peuvent nécessiter un pilote propriétaire qui n’est pas inclus dans une image donnée.

### Réseau

La prise en charge Ethernet et Wi-Fi dépend du contrôleur, du pilote noyau et du microprogramme inclus dans l’image. Testez la connectivité réseau à partir d’une session neuve. Pour le Wi-Fi, vérifiez également si l’appareil nécessite un microprogramme ou un pilote externe absent de cette version.

### Stockage

Les périphériques USB, SATA, NVMe, IDE et SD/MMC fonctionnent uniquement si l’image sélectionnée inclut un pilote pour le contrôleur et si le noyau reconnaît le périphérique. L’analyse initrd ne rend pas un contrôleur non pris en charge compatible. Consultez [Découverte système par initrd](/configuration/Initrd-System-Discovery.md) pour le comportement exact de recherche en mode live.

Les modes live et natif ont des séquences de démarrage différentes. Le mode live détecte l’arborescence de données MiniOS et assemble les modules en lecture seule dans l’espace utilisateur initial ; le mode natif démarre sur une racine installée classique. Consultez [Chargement des modules initrd](/configuration/Initrd-Module-Loading.md) pour la gestion des modules live et [Installer MiniOS](/installation/Installing-MiniOS.md) pour la distinction des agencements.

### Virtualisation

MiniOS peut fonctionner en tant qu’invité si l’image sélectionnée inclut les pilotes pour les périphériques CPU, stockage, réseau et affichage configurés dans la VM. La prise en charge n’est pas garantie pour tous les hyperviseurs ou modèles de contrôleurs. La compatibilité VirtIO, VMware, Hyper-V et IDE ou SATA émulés doit être vérifiée selon la version et testée avec la configuration VM spécifique.

Les agents invités et les outils d’intégration de bureau varient également selon l’édition et l’image. Consultez la [liste des paquets](/administration/Packages.md) et le [guide de virtualisation](/administration/Virtualization.md) avant de supposer que le partage du presse-papiers, la résolution dynamique, l’arrêt propre ou la communication avec l’hôte sont disponibles.
