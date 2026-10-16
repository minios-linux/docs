---
updated: 2026-10-15
---

# Démarrage rapide

Ce guide vous accompagne depuis le téléchargement d’une image MiniOS jusqu’à l’obtention d’un système opérationnel. Il présente uniquement les choix nécessaires pour un premier démarrage ; les guides associés détaillent chaque sujet.

## 1. Télécharger MiniOS

Choisissez l’édition qui correspond le mieux à vos besoins :

| Édition | Recommandée pour |
|---|---|
| **Standard** | **Recommandée à la plupart des utilisateurs et pour découvrir MiniOS.** Un système minimal offrant les fonctions essentielles et un bureau Xfce compact et efficace pour les tâches quotidiennes. |
| **Toolbox** | Une édition dédiée à l’administration système et au diagnostic, conçue pour les professionnels de l’informatique et la récupération de systèmes. Elle comprend Standard ainsi que les outils correspondants d’administration, de récupération, de réseau, de test matériel, de sauvegarde et d’accès à distance. |
| **Ultra** | Un bureau complet avec un large choix d’applications et d’outils professionnels pour la création et le développement. Elle comprend Toolbox ainsi que des logiciels de bureautique, de graphisme, de vidéo, d’audio, de 3D, de développement et de conteneurisation. |
| **Flux** | Une édition Fluxbox ultralégère, conçue pour limiter l’utilisation des ressources et fonctionner sur du matériel ancien. Elle propose moins d’applications et de fonctionnalités de bureau que Standard. **Déconseillée aux débutants.** |

La disponibilité exacte des paquets et des environnements de bureau dépend de la version. Consultez [À propos de MiniOS](/getting-started/About-MiniOS) pour en savoir plus sur le modèle d’éditions et [Paquets et éditions](/reference/Package-and-Edition-Contents) pour connaître la sélection de paquets maintenue.

Téléchargez l’image ISO depuis le [site web MiniOS](https://minios.dev), le site officiel des [versions GitHub](https://github.com/minios-linux/minios-live/releases) ou [SourceForge](https://sourceforge.net/projects/minios-linux/).

## 2. Vérifier le téléchargement

Vérifiez l’image ISO avant de l’installer. Les versions MiniOS fournissent un fichier `.iso.sha256` correspondant ; consultez [Vérifier les téléchargements](/installing-minios/Verifying-Downloads) pour connaître les commandes à utiliser sous Linux, macOS et Windows.

## 3. Installer MiniOS

Pour MiniOS, écrire le système sur un support amovible constitue déjà une méthode d’installation : le support obtenu est un système MiniOS amorçable.

Choisissez la méthode en fonction du résultat souhaité pour le support :

| Résultat souhaité | Méthode | Résultat |
|---|---|---|
| Une clé USB classique qui permet aussi de démarrer MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) en mode ISO classique ou [Installation basée sur des fichiers](/installing-minios/Manual-File-Based-Installation) | Les fichiers MiniOS et le chargeur d’amorçage se trouvent sur un système de fichiers classique ; le support peut donc toujours servir à stocker des fichiers ordinaires |
| MiniOS avec d’autres images ISO | [Ventoy](/installing-minios/installation-tools/Ventoy) | Ventoy conserve sa partition de données habituelle, prend en charge le démarrage multiple et MiniOS prend en charge les sessions persistantes avec cette disposition |
| Une installation MiniOS portable et gérée | [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) en **mode** Live | Crée une installation MiniOS modulaire et permet de configurer un stockage persistant |
| Une copie exacte de l’image ISO, bloc par bloc | [Rufus](/installing-minios/installation-tools/Rufus) en mode DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility) ou [`dd`](/installing-minios/installation-tools/dd) | Reproduit la disposition des blocs de l’image ISO : une méthode simple et prévisible, mais le support ne se comporte plus comme une clé USB polyvalente classique |

Si vous souhaitez également utiliser un support portable pour stocker des fichiers ordinaires, privilégiez Rufus en mode ISO, une installation basée sur des fichiers, Ventoy ou une installation Live adaptée créée avec le Programme d’installation MiniOS. L’écriture brute de l’image est utile lorsqu’une copie exacte de l’image publiée est plus importante que la réutilisation du support comme espace de stockage polyvalent.

::: danger Vérifier le support cible
La plupart des méthodes d’installation écrasent tout ou partie des données présentes sur le support sélectionné.
Sauvegardez les données importantes et vérifiez le modèle et la capacité du support avant de commencer.
:::

Consultez [Installer MiniOS](/installing-minios/Installation-Methods) pour découvrir les différences entre l’écriture brute d’une image, Ventoy, les dispositions basées sur des fichiers et le Programme d’installation MiniOS.

## 4. Démarrer MiniOS pour la première fois

1. Redémarrez l’ordinateur avec le périphérique MiniOS connecté.
2. Ouvrez le menu de démarrage du firmware de l’ordinateur et sélectionnez ce périphérique.
3. Laissez l’entrée par défaut **Démarrer MiniOS** sélectionnée et démarrez le système.
4. Vérifiez que l’affichage, le clavier, le réseau et les périphériques de stockage dont vous avez besoin fonctionnent correctement.

**Démarrer MiniOS** est le mode de démarrage par défaut normal. Il sélectionne automatiquement la persistance : MiniOS tente de reprendre une session par défaut compatible et, si aucune session utilisable n’existe, peut en créer une si un stockage inscriptible adapté est disponible. Si la persistance ne peut pas être activée, MiniOS continue avec une couche inscriptible temporaire et indique que les modifications ne seront pas enregistrées.

Cela signifie qu’un premier démarrage normal ne nécessite pas de créer une session à l’avance. Choisissez **Démarrer sans enregistrer** uniquement si vous souhaitez délibérément effectuer un démarrage temporaire vierge, sans ouvrir ni créer de session persistante.

Consultez [Modes de démarrage](/using-minios/Boot-Modes) pour découvrir les autres options de démarrage. Si le périphérique ne démarre pas ou si un élément matériel important ne fonctionne pas, consultez [Compatibilité matérielle](/getting-started/Hardware-Compatibility) et [Dépannage](/maintenance-and-recovery/Troubleshooting).

## 5. Choisir un autre comportement de session si nécessaire

Pour une utilisation portable normale, continuez à utiliser l’entrée **Démarrer MiniOS** par défaut. Choisissez un autre mode uniquement si vous souhaitez obtenir un résultat différent :

| Option de démarrage | À utiliser quand | Résultat |
|---|---|---|
| **Démarrer MiniOS** (par défaut) | Utilisation portable normale | Reprend automatiquement une session par défaut compatible ou en crée une si cela est pris en charge |
| **Démarrer une nouvelle session** | Vous souhaitez disposer d’un espace de travail supplémentaire distinct | Crée une session persistante numérotée supplémentaire et conserve les sessions existantes sans modification |
| **Choisir une session enregistrée** | Vous souhaitez choisir l’un de plusieurs espaces de travail existants | Vous permet de choisir une session existante de manière interactive |
| **Démarrer sans enregistrer** | Vous souhaitez un démarrage temporaire vierge, sans persistance | Utilise une couche inscriptible temporaire dans RAM |
| **Exécuter depuis la RAM** | Vous souhaitez copier MiniOS dans RAM pour ce démarrage | L’entrée fournie démarre temporairement sans session enregistrée. Avec une demande de persistance supplémentaire, les sessions prises en charge peuvent être copiées séparément et explicitement réenregistrées ; les données natives ne sont pas copiées |

La persistance automatique nécessite toujours un stockage inscriptible adapté. L’écriture brute d’une image ISO ne prépare pas à elle seule un stockage persistant. Les installations basées sur des fichiers, les dispositions Ventoy et les installations Live créées par [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) peuvent fournir des dispositions inscriptibles pour une utilisation persistante de MiniOS. Les sessions existantes peuvent être inspectées et gérées depuis [Gestion des sessions](/using-minios/Sessions-and-Persistence).

Avant de compter sur la persistance, redémarrez une fois et vérifiez que MiniOS indique bien la session attendue comme active et qu’une modification de test est conservée après le redémarrage.

## 6. Préconfigurer MiniOS

La plupart des outils de configuration propres à MiniOS préparent des paramètres pour un démarrage ultérieur ou une nouvelle session, au lieu de modifier immédiatement le bureau en cours d’exécution.

Utilisez **Configurateur MiniOS** pour cette préconfiguration : paramètres régionaux, fuseau horaire, clavier, nom d’hôte, services, valeurs par défaut des comptes, stratégie de sécurité et autres paramètres de démarrage MiniOS. Ouvrez-le depuis le menu des applications ou exécutez :

```bash
minios-configurator
```

Pour les paramètres courants en cours d’utilisation, comme les connexions réseau, le son, l’affichage et les préférences des applications, utilisez les outils standard du bureau et de Linux.
Certains paramètres du Configurateur MiniOS s’appliquent au prochain démarrage, tandis que les paramètres de compte et de sécurité peuvent être utilisés uniquement lors de la création d’une nouvelle session. Consultez [Configurateur MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS) pour connaître le comportement exact.

## Étapes suivantes

Une fois que MiniOS démarre et conserve l’état dont vous avez besoin :

- [applications et outils MiniOS](/using-minios/MiniOS-Applications) — consultez les utilitaires propres à MiniOS disponibles sur le système.
- [Configuration réseau](/using-minios/Networking) — utilisez NetworkManager normalement ou préparez une préconfiguration filaire MiniOS.
- [Boutique d’applications MiniOS](/using-minios/Installing-Software) — installez des applications depuis le catalogue MiniOS.
- [Gestionnaire de modules](/preparing-and-customizing/Managing-Modules) — inspectez et gérez les modules MiniOS.
- [Sauvegarde et récupération](/maintenance-and-recovery/Backing-Up-MiniOS) — protégez un système que vous prévoyez de continuer à utiliser.
