---
updated: 2026-10-06
---

# Modes de démarrage

Le mode de démarrage détermine si MiniOS démarre à neuf, ouvre une session enregistrée ou fonctionne comme un système installé classique. Il n'est pas nécessaire de comprendre le processus de démarrage interne pour faire ce choix.

Les intitulés des menus peuvent varier légèrement selon les versions, les modes du firmware et les outils de démarrage. Choisissez en fonction du résultat souhaité plutôt que du libellé exact.

## Choix rapide

L'entrée par défaut habituelle est **Démarrer MiniOS**. Elle utilise une sélection automatique de la persistance : MiniOS tente de reprendre une session par défaut compatible et peut en créer une nouvelle compatible si aucune session utilisable n'existe et qu'un support d'écriture adapté est disponible.

| Entrée du menu | À utiliser lorsque | Les modifications sont-elles enregistrées ? | Faut-il laisser la clé USB connectée ? |
|---|---|---|---|
| **Démarrer MiniOS** (par défaut) | Utilisation portable normale | Oui, si l’activation automatique de la persistance réussit | Oui |
| **Démarrer une nouvelle session** | Vous souhaitez un nouvel espace de travail séparé | Uniquement si la nouvelle session est créée et activée avec succès | Oui |
| **Choisir une session enregistrée** | Vous souhaitez sélectionner l’un des espaces de travail existants | Uniquement si la session sélectionnée s’active correctement | Oui |
| **Démarrer sans enregistrer** | Vous souhaitez un démarrage temporaire propre sans persistance | Non | Oui |
| **Exécuter depuis la RAM** | Vous souhaitez copier les données système de MiniOS vers RAM pour ce démarrage | Les modifications basées sur RAM sont temporaires, sauf si une session de persistance prise en charge est explicitement enregistrée ou sauvegardée comme nouvelle | Jusqu’à ce que MiniOS ait détaché avec succès la source et tout support de stockage dont vous avez encore besoin |

Pour un premier démarrage normal, laissez **Démarrer MiniOS** sélectionné. Utilisez **Démarrer sans enregistrer** lorsque vous avez besoin d’un test matériel temporaire propre ou d’une session de récupération qui ne doit ni ouvrir ni créer de persistance.

::: warning Vérifier que la persistance est active
Choisir une entrée de menu persistante demande une session, mais ne garantit pas que la session pourra être ouverte. Si le stockage est en lecture seule, plein, endommagé ou incompatible, MiniOS peut continuer sans enregistrer les modifications. Vérifiez l’avertissement au démarrage avant de commencer un travail qui doit être conservé.
:::

## Démarrer MiniOS

**Démarrer MiniOS** est la première entrée du menu et celle sélectionnée par défaut. Elle est conçue pour une utilisation normale, y compris lors du premier démarrage d’un périphérique MiniOS fraîchement préparé.

MiniOS recherche automatiquement une session persistante compatible. Si une session par défaut utilisable existe, elle est reprise. Si aucune n’existe, MiniOS peut créer automatiquement une session compatible si un support d’écriture adapté est disponible.

Si la persistance ne peut pas être créée ou activée parce que le stockage est en lecture seule, plein, endommagé ou inadapté, MiniOS continue avec une couche d’écriture temporaire et signale que la session n’est pas persistante. Vérifiez cet avertissement avant d’effectuer un travail qui doit survivre à un redémarrage.

Pour une session persistante fonctionnelle, le Configurateur MiniOS peut conserver certains journaux et caches standards dans RAM tout en gardant les diagnostics de démarrage et les données utilisateur sur le stockage. Les trois réglages et leurs limites RAM sont décrits dans [Performance](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch). Ils n’ont aucun effet lors d’un démarrage **Démarrer sans enregistrer**.

## Démarrer une nouvelle session

MiniOS ouvre le menu de configuration de la persistance, vous permet de choisir un backend de stockage pris en charge ainsi que les options de chiffrement ou de compression DynBlk applicables, puis crée une session persistante supplémentaire numérotée sans modifier les sessions existantes. Il s’agit du comportement actuel `perchdir=setup` . Utilisez-le pour garder des espaces de travail séparés ou pour tester une nouvelle configuration sans remplacer votre session de travail actuelle.

La création nécessite un stockage compatible en écriture et suffisamment d’espace libre. Les choix de backend disponibles dépendent du système de fichiers, de l’état de Secure Boot, des pilotes/outils installés et des capacités de l’initrd. Une nouvelle session n’est pas une sauvegarde d’une session existante.

## Choisir une session enregistrée

MiniOS affiche les sessions enregistrées disponibles et vous permet d’en sélectionner une. Utilisez cette option lorsqu’un même périphérique contient plusieurs espaces de travail. Si le stockage de persistance sélectionné est vide, le chemin `ask` permet d’accéder automatiquement à la configuration de la persistance afin de créer la première session.

Une session peut être incompatible si elle provient d’une autre version ou édition MiniOS. Un paramètre `union=` différent peut également rendre une session incompatible.
La sélection interactive ne rend pas une session incompatible sûre.

## Démarrer sans enregistrer

Ce mode désactive volontairement la persistance pour le démarrage en cours. MiniOS utilise une zone temporaire en écriture dans RAM, de sorte que les fichiers créés dans le système live, les paquets installés et les paramètres modifiés disparaissent à l’extinction.

Utilisez ce mode lorsque vous souhaitez spécifiquement :

- tester du matériel sans ouvrir ni créer de session persistante ;
- diagnostiquer un problème sans modifier l’état sauvegardé ;
- travailler temporairement sans rien conserver.

Démarrer sans sauvegarde ne signifie pas que le support de démarrage peut être retiré. Le système en cours d’exécution continue généralement de lire ses modules système sur ce support.

## Exécuter depuis la RAM

Ce mode copie les données système de MiniOS vers RAM afin de réduire les lectures depuis la source. Il nécessite suffisamment de mémoire pour le système copié et la charge de travail en cours.

La copie du système et la copie de la persistance sont désormais séparées. Avec une demande de persistance, `toram` la valeur par défaut est `perchtoram` sur `trim`, donc la session prise en charge sélectionnée (Raw, DynFileFS, DynBlk, VMDK ou SquashFS) est copiée dans RAM tandis que les autres sessions enregistrées restent sur le stockage d’origine. Utilisez `perchtoram=off` si vous souhaitez que le système soit dans RAM mais que la session de persistance active continue d’écrire directement sur le stockage, ou `perchtoram=full` lorsque toutes les sessions enregistrées prises en charge doivent être copiées. Les sessions de type répertoire natif ne sont pas copiées par `perchtoram`.

Une session de persistance basée sur RAM n’est pas durable tant qu’elle est en cours d’utilisation. Le Gestionnaire de sessions MiniOS actuel peut explicitement écrire les modifications prises en charge par RAM sur le stockage d’origine via **Enregistrer maintenant**, ou les sauvegarder comme une nouvelle session numérotée, à condition que le stockage d’origine soit présent, accessible en écriture et corresponde toujours à l’identité enregistrée au démarrage. Tant qu’une telle sauvegarde n’a pas réussi, les modifications RAM non enregistrées sont perdues à l’extinction. Les politiques d’enregistrement automatique SquashFS utilisent le même backend de session lorsque le stockage d’origine est disponible.

Ne retirez pas le périphérique de démarrage simplement parce que **Exécuter depuis la RAM** a été sélectionné. Cela n’est sûr qu’après que MiniOS a détaché avec succès le système de fichiers source, la boucle ISO, les mappages Ventoy et toute dépendance de persistance encore nécessaire. Si le détachement échoue, la source reste utilisée.

## Installation native

::: warning L’installation native modifie le modèle du système
Une installation native conserve l’expérience familière du bureau MiniOS — son identité visuelle, l’environnement de bureau sélectionné et les applications courantes — mais convertit l’image live en un bureau Debian classique. Les outils spécifiques à MiniOS pour les sessions, modules, noyaux modulaires et autres workflows live sont supprimés car ces fonctionnalités ne s’appliquent plus.
:::

Après la conversion native, utilisez les outils Debian habituels pour les paquets, le noyau, la configuration et le chargeur d’amorçage. Le résultat reste visuellement familier et conserve les applications de bureau de l’édition sélectionnée, mais l’ensemble des fonctionnalités live propres à MiniOS n’est plus présent. L’architecture live MiniOS est décrite dans [À propos de MiniOS](/getting-started/About-MiniOS).

Utilisez [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) uniquement si vous souhaitez explicitement cette conversion et si l’image sélectionnée prend en charge le déploiement natif.

## Pour plus de détails

- [Menus de démarrage](/preparing-and-customizing/Customizing-the-Boot-Menu) explique la navigation et la modification temporaire d’une entrée de menu.
- [Gestion des sessions](/using-minios/Sessions-and-Persistence) explique les modes de stockage, la création, le redimensionnement et la suppression de sessions.
- [Paramètres de démarrage](/reference/Boot-Parameters) est la référence complète de la ligne de commande.
- [Découverte système initrd](/reference/boot-process/System-Discovery), [chargement de modules](/reference/boot-process/Module-Loading), et [persistance](/reference/boot-process/Persistence-Internals) expliquent comment les groupes de paramètres associés sont traités au démarrage.
