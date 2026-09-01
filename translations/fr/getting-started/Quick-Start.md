---
updated: 2026-08-31
---

# Démarrage rapide

Ce guide vous accompagne depuis l’image MiniOS téléchargée jusqu’à un système opérationnel. Il ne couvre que les choix nécessaires pour un premier démarrage ; les guides liés expliquent chaque sujet en détail.

## 1. Télécharger MiniOS

Choisissez l’édition qui correspond le mieux à vos besoins :

| Édition | Idéale pour |
|---|---|
| **Standard** | **Recommandée pour la plupart des utilisateurs et pour une première expérience avec MiniOS.** Un système minimal avec les fonctionnalités de base et un bureau Xfce compact et efficace pour l’informatique au quotidien. |
| **Toolbox** | Une édition d’administration système et de diagnostic pour les professionnels IT et la récupération système. Elle inclut Standard ainsi que les outils d’administration, de récupération, de réseau, de test matériel, de sauvegarde et d’accès à distance correspondants. |
| **Ultra** | Un bureau complet avec un large éventail d’applications et d’outils professionnels pour la créativité et le développement. Elle inclut Toolbox ainsi que des logiciels de bureautique, graphisme, vidéo, audio, 3D, développement et conteneurs. |
| **Flux** | Une édition Fluxbox ultra-légère pour une utilisation minimale des ressources et du matériel plus ancien. Elle propose un ensemble d’applications réduit et moins de commodités de bureau que Standard. **Non recommandée pour les débutants.** |

La disponibilité exacte des paquets et des environnements de bureau dépend de la version. Voir [À propos de MiniOS](/getting-started/About-MiniOS) pour le modèle d’édition et [Paquets et éditions](/reference/Package-and-Edition-Contents) pour la sélection de paquets maintenue.

Téléchargez l’ISO depuis le [site officiel MiniOS](https://minios.dev), la page officielle [GitHub Releases](https://github.com/minios-linux/minios-live/releases), ou [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Vérifier le téléchargement

Vérifiez l’ISO avant de l’installer. Les versions MiniOS fournissent un fichier `.iso.sha256` correspondant ; consultez [Vérification des téléchargements](/installing-minios/Verifying-Downloads) pour les commandes sous Linux, macOS et Windows.

## 3. Installer MiniOS

Pour MiniOS, écrire le système sur un support amovible est déjà une méthode d’installation : le périphérique obtenu est un système MiniOS amorçable.

Choisissez la méthode en fonction du résultat souhaité pour le périphérique :

| Ce que vous souhaitez | Méthode | Résultat |
|---|---|---|
| Une clé USB classique qui démarre aussi MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) en mode ISO normal ou [Installation basée sur des fichiers](/installing-minios/Manual-File-Based-Installation) | Les fichiers MiniOS et le chargeur d’amorçage résident sur un système de fichiers classique, la clé reste donc utilisable pour des fichiers ordinaires |
| MiniOS avec d’autres images ISO | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy conserve sa partition de données habituelle, prend en charge le multiboot, et MiniOS permet des sessions persistantes sur cette configuration |
| Une installation portable MiniOS gérée | [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) en mode **Live** | Crée une installation MiniOS modulaire et peut configurer un stockage persistant |
| Une copie exacte, bloc par bloc, de l’ISO | [Rufus](/installing-minios/installation-tools/Rufus) en mode DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility), ou [`dd`](/installing-minios/installation-tools/dd) | Reproduit la structure de blocs de l’ISO ; simple et prévisible, mais le périphérique ne fonctionne plus comme une clé USB classique |

Pour un support portable que vous souhaitez aussi utiliser pour le stockage de fichiers, privilégiez Rufus en mode ISO, une installation basée sur des fichiers, Ventoy, ou une installation Live adaptée réalisée avec le Programme d’installation MiniOS. L’écriture d’image brute est utile si une copie exacte de l’image publiée est plus importante que la réutilisation du support comme stockage général.

::: danger Vérifiez le périphérique cible
La plupart des méthodes d’installation écrasent tout ou partie des données du périphérique sélectionné.
Sauvegardez tout ce qui est important et vérifiez le modèle et la capacité du périphérique avant de commencer.
:::

Consultez [Installer MiniOS](/installing-minios/Installation-Methods) pour les différences entre l’écriture d’image brute, Ventoy, les agencements basés sur des fichiers et le Programme d’installation MiniOS.

## 4. Démarrer MiniOS pour la première fois

1. Redémarrez l’ordinateur avec le périphérique MiniOS branché.
2. Ouvrez le menu de démarrage du firmware de l’ordinateur et sélectionnez ce périphérique.
3. Laissez l’entrée par défaut **Démarrer MiniOS** sélectionnée et lancez le système.
4. Vérifiez que la carte graphique, le clavier, le réseau et les périphériques de stockage nécessaires fonctionnent correctement.

**Démarrer MiniOS** est le mode de démarrage par défaut. Il utilise une sélection automatique de la persistance : MiniOS tente de reprendre une session par défaut compatible et, si aucune session utilisable n’existe, peut en créer une si un espace de stockage réinscriptible adapté est disponible. Si la persistance ne peut pas être activée, MiniOS continue avec une couche temporaire réinscriptible et signale que les modifications ne seront pas sauvegardées.

Cela signifie qu’un premier démarrage classique ne nécessite pas de créer une session à l’avance. Choisissez **Démarrer sans sauvegarde** uniquement si vous souhaitez explicitement un démarrage temporaire propre qui n’ouvrira ni ne créera de session persistante.

Voir [Modes de démarrage](/using-minios/Boot-Modes) pour les autres options de démarrage. Si le périphérique ne démarre pas ou si un matériel important ne fonctionne pas, consultez [Compatibilité matérielle](/getting-started/Hardware-Compatibility) et [Dépannage](/maintenance-and-recovery/Troubleshooting).

## 5. Choisir un autre comportement de session si nécessaire

Pour une utilisation portable classique, continuez à utiliser l’entrée par défaut **Démarrer MiniOS**. Choisissez un autre mode uniquement si vous souhaitez un résultat différent :

| Choix au démarrage | À utiliser quand | Résultat |
|---|---|---|
| **Démarrer MiniOS** (par défaut) | Utilisation portable normale | Reprend automatiquement une session par défaut compatible ou en crée une nouvelle si pris en charge |
| **Démarrer une nouvelle session** | Vous souhaitez un espace de travail supplémentaire et séparé | Crée une session persistante supplémentaire numérotée et laisse les sessions existantes inchangées |
| **Choisir une session enregistrée** | Vous souhaitez sélectionner l’un des espaces de travail existants | Permet de choisir une session existante de façon interactive |
| **Démarrer sans enregistrer** | Vous souhaitez un démarrage temporaire propre sans persistance | Utilise une couche temporaire inscriptible en RAM |
| **Exécuter depuis RAM** | Vous voulez copier MiniOS dans RAM pour ce démarrage | Fonctionne à partir d’une copie RAM ; considérez les modifications comme temporaires |

La persistance automatique nécessite tout de même un espace inscriptible adapté. Une écriture brute de l’ISO ne prépare pas à elle seule un stockage persistant. Les installations basées sur des fichiers, les agencements Ventoy et les installations Live réalisées avec le [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) peuvent fournir des agencements inscriptibles pour une utilisation persistante de MiniOS. Les sessions existantes peuvent être consultées et gérées via [Gestion des sessions](/using-minios/Sessions-and-Persistence).

Avant de compter sur la persistance, redémarrez une fois et vérifiez que MiniOS signale la session attendue comme active et qu’une modification de test survit au redémarrage.

## 6. Préconfigurer MiniOS

La plupart des outils de configuration spécifiques à MiniOS préparent les paramètres pour un prochain démarrage ou une nouvelle session, plutôt que de modifier immédiatement le bureau en cours d’exécution.

Utilisez le **Configurateur MiniOS** pour cette préconfiguration : langue, fuseau horaire, clavier, nom d’hôte, services, paramètres par défaut des comptes, politique de sécurité et autres paramètres de démarrage MiniOS. Ouvrez-le depuis le menu des applications ou exécutez :

```bash
minios-configurator
```

Utilisez les outils standards du bureau et de Linux pour les réglages courants en cours d’utilisation, comme les connexions réseau, l’audio, la configuration de l’affichage et les préférences des applications.
Certains paramètres du Configurateur MiniOS s’appliquent au prochain démarrage, tandis que les paramètres de compte et de sécurité peuvent n’être utilisés que lors de la création d’une nouvelle session. Consultez [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) pour le comportement exact.

## Prochaines étapes

Une fois que MiniOS démarre et conserve l’état dont vous avez besoin :

- [Applications et outils MiniOS](/using-minios/MiniOS-Applications) — découvrez les utilitaires spécifiques à MiniOS disponibles dans le système.
- [Configuration réseau](/using-minios/Networking) — utilisez NetworkManager normalement ou préparez une préconfiguration filaire MiniOS.
- [Boutique d’applications MiniOS](/using-minios/Installing-Software) — installez des applications depuis le catalogue MiniOS.
- [Gestionnaire de modules](/preparing-and-customizing/Managing-Modules) — consultez et gérez les modules MiniOS.
- [Sauvegarde et restauration](/maintenance-and-recovery/Backing-Up-MiniOS) — protégez un système que vous prévoyez d’utiliser sur la durée.
