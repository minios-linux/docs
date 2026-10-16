---
updated: 2026-10-15
---

# Modes de démarrage

Le mode de démarrage détermine si MiniOS démarre sur une session vierge, ouvre une session enregistrée ou fonctionne comme un système installé classique. Il n’est pas nécessaire de comprendre le processus de démarrage interne pour faire ce choix.

Les libellés des menus peuvent légèrement varier selon les versions, les modes du firmware et les outils de démarrage. Choisissez en fonction du résultat souhaité plutôt que du libellé exact.

## Choix rapide

L’entrée par défaut habituelle est **Démarrer MiniOS**. Elle utilise la sélection automatique de la persistance : MiniOS tente de reprendre une session par défaut compatible et peut en créer une nouvelle compatible si aucune session utilisable n’existe et qu’un stockage inscriptible adapté est disponible.

| Entrée du menu | À utiliser quand | Les modifications sont-elles enregistrées ? | Faut-il laisser la clé USB connectée ? |
|---|---|---|---|
| **Démarrer MiniOS** (par défaut) | Utilisation portable normale | Oui, si l’activation automatique de la persistance réussit | Oui |
| **Démarrer une nouvelle session** | Vous voulez un nouvel espace de travail distinct | Uniquement si la nouvelle session est créée et activée correctement | Oui |
| **Choisir une session enregistrée** | Vous voulez choisir parmi plusieurs espaces de travail existants | Uniquement si la session sélectionnée s’active correctement | Oui |
| **Démarrer sans enregistrer** | Vous voulez un démarrage temporaire vierge, sans persistance | Non | Oui |
| **Exécuter depuis la RAM** | Vous voulez copier les données système de MiniOS vers RAM pour ce démarrage | Les modifications effectuées dans RAM sont temporaires, sauf si une session de persistance prise en charge est explicitement enregistrée à nouveau ou enregistrée comme nouvelle | Jusqu’à ce que MiniOS ait correctement détaché la source et tout stockage dont vous avez encore besoin |

Pour un premier démarrage normal, laissez **Démarrer MiniOS** sélectionné. Utilisez **Démarrer sans enregistrer** uniquement si vous avez besoin d’un test matériel temporaire sur une session vierge ou d’une session de récupération qui ne doit ni ouvrir ni créer de persistance.

::: warning Vérifier que la persistance est active
Choisir une entrée de menu avec persistance demande l’ouverture d’une session, mais ne garantit pas qu’elle pourra être ouverte. Si le stockage est en lecture seule, plein, endommagé ou incompatible, MiniOS peut continuer sans enregistrer les modifications. Vérifiez l’avertissement au démarrage avant de commencer un travail qui doit être conservé.
:::

## Démarrer MiniOS

**Démarrer MiniOS** est la première entrée du menu et celle sélectionnée par défaut. Elle est destinée à un usage normal, y compris au premier démarrage d’un appareil MiniOS nouvellement préparé.

MiniOS recherche automatiquement une session persistante compatible. Si une session par défaut utilisable existe, elle la reprend. Sinon, MiniOS peut créer automatiquement une session compatible si un stockage inscriptible adapté est disponible.

Si la persistance ne peut pas être créée ou activée parce que le stockage est en lecture seule, plein, endommagé ou inadapté pour une autre raison, MiniOS continue avec une couche inscriptible temporaire et indique que la session n’est pas persistante. Vérifiez cet avertissement avant d’effectuer un travail qui doit être conservé après un redémarrage.

Pour une session persistante fonctionnelle, le Configurateur MiniOS peut conserver certains journaux et caches ordinaires dans RAM, tout en gardant les diagnostics de démarrage et les données utilisateur sur le stockage. Les trois paramètres et leurs limites de RAM sont décrits dans la section [Performances](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). Ils n’ont aucun effet sur un démarrage **Démarrer sans enregistrer**.

## Démarrer une nouvelle session

MiniOS ouvre le menu de configuration de la persistance, permet de choisir un backend de stockage pris en charge ainsi que les options de chiffrement ou de compression DynBlk applicables, puis crée une session persistante supplémentaire numérotée sans modifier les sessions existantes. C’est le comportement actuel de `perchdir=setup`. Utilisez cette option pour conserver des espaces de travail distincts ou tester une nouvelle configuration sans remplacer votre session de travail actuelle.

La création nécessite un stockage inscriptible compatible et suffisamment d’espace libre. Les choix de backend disponibles dépendent du système de fichiers, de l’état de Secure Boot, des pilotes et outils installés, ainsi que des capacités de l’initrd. Une nouvelle session ne constitue pas une sauvegarde d’une session existante.

## Choisir une session enregistrée

MiniOS affiche les sessions enregistrées disponibles et vous permet d’en sélectionner une. Utilisez cette option lorsqu’un appareil contient plusieurs espaces de travail. Si le support de persistance sélectionné est vide, le`ask` chemin passe automatiquement à la configuration de la persistance pour vous permettre de créer la première session.

Une session peut être incompatible si elle provient d’une autre version ou édition de MiniOS. Un autre`union=` paramètre peut également rendre une session incompatible.
La sélection interactive ne rend pas sûre une session incompatible.

La boîte de dialogue d’incompatibilité peut réinitialiser les logiciels installés sur le système tout en conservant les données et, si vous le souhaitez, les paramètres système. Les deux modes de réinitialisation préservent les dossiers personnels, les paramètres personnels, les comptes et les mots de passe. Ils nécessitent de l’espace libre pour stocker temporairement les données conservées ; une réinitialisation SquashFS ne devient définitive qu’après l’enregistrement. Consultez la section [Gestion des sessions](/using-minios/Sessions-and-Persistence) avant de lancer la réinitialisation.

## Démarrer sans enregistrer

Ce mode désactive volontairement la persistance pour le démarrage en cours. MiniOS utilise une zone temporaire inscriptible dans RAM ; les fichiers créés dans le système live, les paquets installés et les paramètres modifiés disparaissent à l’arrêt.

Utilisez ce mode lorsque vous souhaitez précisément :

- tester le matériel sans ouvrir ni créer de session persistante ;
- diagnostiquer un problème sans modifier l’état enregistré ;
- travailler temporairement sans rien avoir à conserver.

Démarrer sans enregistrer ne signifie pas que vous pouvez retirer le support de démarrage. En fonctionnement normal, le système continue de lire ses modules système depuis ce support.

## Exécuter depuis la RAM

Ce mode copie les données système de MiniOS dans RAM afin de réduire les lectures depuis la source. Il nécessite suffisamment de mémoire pour accueillir le système copié et la charge de travail en cours.

La copie du système et celle de la persistance sont distinctes. Lorsqu’une persistance est demandée, `toram` utilise par défaut `perchtoram` `trim` ; la session Raw, DynFileFS, DynBlk, VMDK ou SquashFS sélectionnée et prise en charge est ainsi copiée dans RAM, tandis que les autres sessions enregistrées restent sur le support d’origine. Utilisez `perchtoram=off` si vous souhaitez que le système soit dans RAM alors que la session de persistance active continue d’écrire directement sur le support de stockage, ou `perchtoram=full` si toutes les sessions enregistrées prises en charge doivent être copiées. Les données des répertoires natifs ne sont pas copiées : une demande RAM native acceptée crée plutôt un nouveau conteneur vide. Lors de la réinitialisation d’une session native, la copie est désactivée afin de préserver les données conservées. Si la mémoire est insuffisante pour copier une session ou si la copie échoue, MiniOS signale le repli et conserve la session sur le support de stockage.

Une session de persistance basée sur RAM n’est pas durable pendant son exécution. Le Gestionnaire de sessions MiniOS actuel peut enregistrer explicitement sur le support d’origine les modifications prises en charge basées sur RAM avec **Enregistrer maintenant** ou les enregistrer en tant que nouvelle session numérotée, à condition que le support d’origine soit présent, inscriptible et corresponde toujours à l’identité relevée au démarrage. Tant que l’enregistrement n’a pas abouti, les modifications non enregistrées de RAM sont perdues à l’arrêt. Les politiques d’enregistrement automatique de SquashFS utilisent le même moteur de session lorsque le support d’origine est disponible.

Ne retirez pas le périphérique de démarrage simplement parce que **Exécuter depuis la RAM** a été sélectionné. Vous ne pouvez le faire sans risque qu’après que MiniOS a correctement détaché le système de fichiers source, la boucle ISO, les mappages Ventoy et toute dépendance de persistance encore nécessaire. En cas d’échec du détachement, la source reste utilisée.

## Images de persistance Ventoy

Avec un backend Persistence Plugin Ventoy sélectionné, un démarrage persistant utilise un environnement ext4 inscriptible provenant de cette image, au lieu de sessions MiniOS numérotées. **Démarrer une nouvelle session** et **Choisir une session enregistrée** ne peuvent pas créer ni sélectionner de sessions numérotées dans ce mode ; sélectionnez plutôt un autre backend dans Ventoy. Le Gestionnaire de sessions et `perchtoram` ne sont pas disponibles ; même un démarrage système RAM maintient donc l’image en cours d’utilisation. **Démarrer sans enregistrer** utilise toujours une couche supérieure RAM temporaire. Les démarrages ordinaires de Ventoy sans image de plugin sélectionnée conservent le fonctionnement normal des sessions MiniOS. Consultez [Ventoy](/installing-minios/installation-tools/Ventoy).

## Installation native

::: warning L’installation native modifie le modèle système
Une installation native conserve l’environnement de bureau familier de MiniOS — son identité visuelle, l’environnement de bureau sélectionné et les applications habituelles — mais transforme l’image live en un bureau Debian classique. Les outils spécifiques à MiniOS pour les sessions, les modules, les noyaux modulaires et les autres fonctions liées au mode live sont supprimés, car ces fonctionnalités ne s’appliquent plus.
:::

Après la conversion native, utilisez les outils Debian habituels pour gérer les paquets, le noyau, la configuration et le chargeur d’amorçage. Le résultat conserve l’apparence familière et les applications de bureau habituelles de l’édition sélectionnée, mais les fonctionnalités live spécifiques à MiniOS ne sont plus disponibles. L’architecture live de MiniOS est décrite dans [À propos de MiniOS](/getting-started/About-MiniOS).

Utilisez [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) uniquement si vous souhaitez délibérément effectuer cette conversion et si l’image sélectionnée prend en charge le déploiement natif.

## Pour en savoir plus

- [Menus de démarrage](/preparing-and-customizing/Customizing-the-Boot-Menu) explique la navigation et la modification temporaire d’une entrée de menu.
- [Gestion des sessions](/using-minios/Sessions-and-Persistence) explique les modes de stockage, la création, le redimensionnement et la suppression des sessions.
- [Paramètres de démarrage](/reference/Boot-Parameters) fournit la référence complète de la ligne de commande.
- [Détection du système par initrd](/reference/boot-process/System-Discovery), [chargement des modules](/reference/boot-process/Module-Loading) et [persistance](/reference/boot-process/Persistence-Internals) expliquent comment les groupes de paramètres associés sont traités au démarrage.
