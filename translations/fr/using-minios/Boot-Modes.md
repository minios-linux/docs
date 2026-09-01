---
updated: 2026-08-31
---

# Modes de démarrage

Le mode de démarrage détermine si MiniOS démarre proprement, ouvre une session enregistrée ou fonctionne comme un système installé classique. Il n’est pas nécessaire de comprendre le processus de démarrage interne pour faire ce choix.

Les libellés des menus peuvent varier légèrement selon les versions, les modes du firmware et les outils de démarrage. Choisissez en fonction du résultat souhaité plutôt qu’en vous fiant à la formulation exacte.

## Choix rapide

L’entrée par défaut normale est **Démarrer MiniOS**. Elle utilise une sélection automatique de la persistance : MiniOS tente de reprendre une session par défaut compatible et peut en créer une nouvelle compatible si aucune session utilisable n’existe et qu’un espace d’écriture approprié est disponible.

| Entrée du menu | À utiliser lorsque | Les modifications sont-elles enregistrées ? | Faut-il laisser la clé USB connectée ? |
|---|---|---|---|
| **Démarrer MiniOS** (par défaut) | Utilisation portable normale | Oui, si l’activation automatique de la persistance réussit | Oui |
| **Démarrer une nouvelle session** | Vous souhaitez un nouvel espace de travail séparé | Uniquement si la nouvelle session est créée et activée avec succès | Oui |
| **Choisir une session enregistrée** | Vous souhaitez sélectionner un des espaces de travail existants | Uniquement si la session sélectionnée s’active correctement | Oui |
| **Démarrer sans enregistrer** | Vous voulez un démarrage temporaire sans persistance | Non | Oui |
| **Exécuter depuis RAM** | Vous souhaitez copier MiniOS dans RAM pour ce démarrage | Non ; la copie RAM est considérée comme temporaire | Jusqu’à ce que MiniOS ait détaché la source avec succès |

Pour un premier démarrage classique, laissez **Démarrer MiniOS** sélectionné. Utilisez **Démarrer sans enregistrer** uniquement si vous avez besoin d’un test matériel temporaire ou d’une session de récupération qui ne doit ni ouvrir ni créer de persistance.

::: warning Vérifiez que la persistance est active
Choisir une entrée de menu persistante demande une session ; cela ne garantit pas que la session puisse être ouverte. Si le stockage est en lecture seule, plein, endommagé ou incompatible, MiniOS peut continuer sans enregistrer les modifications. Vérifiez l’avertissement affiché au démarrage avant de commencer un travail qui doit être conservé.
:::

## Démarrer MiniOS

**Démarrer MiniOS** est la première entrée du menu et celle sélectionnée par défaut. Elle est prévue pour une utilisation normale, y compris lors du premier démarrage d’un périphérique MiniOS fraîchement préparé.

MiniOS recherche automatiquement une session persistante compatible. Si une session par défaut utilisable existe, elle est reprise. Si aucune n’existe, MiniOS peut créer automatiquement une session compatible si un espace d’écriture approprié est disponible.

Si la persistance ne peut pas être créée ou activée parce que le stockage est en lecture seule, plein, endommagé ou inadapté, MiniOS continue avec une couche temporaire en écriture et signale que la session n’est pas persistante. Vérifiez cet avertissement avant d’effectuer un travail qui doit survivre à un redémarrage.

## Démarrer une nouvelle session

MiniOS crée une session persistante supplémentaire numérotée et laisse les sessions existantes inchangées. Utilisez cette option pour séparer vos espaces de travail ou tester une nouvelle configuration sans remplacer votre session de travail actuelle.

La création nécessite un espace de stockage compatible en écriture et suffisamment d’espace libre. Une nouvelle session n’est pas une sauvegarde d’une session existante.

## Choisir une session enregistrée

MiniOS affiche les sessions enregistrées disponibles et vous permet d’en sélectionner une. Utilisez cette option lorsqu’un même périphérique contient plusieurs espaces de travail. Pour créer la première session sur un stockage vide, choisissez plutôt **Démarrer une nouvelle session**.

Une session peut être incompatible si elle provient d’une autre version ou édition de MiniOS. Un réglage `union=` différent peut également rendre une session incompatible.
La sélection interactive ne rend pas une session incompatible sûre.

## Démarrer sans enregistrer

Ce mode désactive volontairement la persistance pour le démarrage en cours. MiniOS utilise une zone temporaire en écriture dans RAM, de sorte que les fichiers créés dans le système live, les paquets installés et les paramètres modifiés disparaissent à l’extinction.

Utilisez ce mode lorsque vous souhaitez spécifiquement :

- tester du matériel sans ouvrir ni créer de session persistante ;
- diagnostiquer un problème sans modifier l’état sauvegardé ;
- travailler temporairement sans rien devoir conserver.

Démarrer sans enregistrer ne signifie pas que le support de démarrage peut être retiré. Le système en cours d’exécution continue normalement de lire ses modules système à partir de ce support.

## Exécuter depuis RAM

Ce mode copie les données de MiniOS dans RAM afin de réduire les lectures depuis la source. Il nécessite suffisamment de mémoire pour le système copié et la charge de travail en cours.

Considérez une session chargée en RAM comme temporaire. Combiner `toram` avec la persistance copie les données de session sélectionnées dans RAM ; les modifications ultérieures ne sont pas recopiées vers le stockage de persistance d’origine.

Ne retirez pas le périphérique de démarrage simplement parce que **Exécuter depuis RAM** a été sélectionné. Cela n’est sûr que lorsque MiniOS a détaché avec succès le système de fichiers source, la boucle ISO et tout mappage Ventoy. Si cette opération échoue, la source reste utilisée.

## Installation native

::: warning L’installation native modifie le modèle système
Une installation native conserve l’expérience de bureau familière de MiniOS — son identité visuelle, l’environnement de bureau choisi et les applications habituelles — mais convertit l’image live en un bureau Debian classique. Les outils spécifiques à MiniOS pour la gestion des sessions, modules, noyaux modulaires et autres flux de travail live sont supprimés, car ces fonctionnalités ne sont plus pertinentes.
:::

Après la conversion native, utilisez les outils Debian classiques pour la gestion des paquets, du noyau, de la configuration et du chargeur d’amorçage. Le résultat reste visuellement familier et conserve les applications de bureau habituelles de l’édition sélectionnée, mais l’ensemble des fonctionnalités live propres à MiniOS n’est plus disponible. L’architecture live de MiniOS est décrite dans [À propos de MiniOS](/getting-started/About-MiniOS).

Utilisez le [Programme d’installation MiniOS](/installing-minios/MiniOS-Installer) uniquement si vous souhaitez effectuer cette conversion et que l’image sélectionnée prend en charge le déploiement natif.

## Pour plus de détails

- [Menus de démarrage](/preparing-and-customizing/Customizing-the-Boot-Menu) explique la navigation et la modification temporaire d’une entrée de menu.
- [Gestion des sessions](/using-minios/Sessions-and-Persistence) détaille les modes de stockage, la création, le redimensionnement et la suppression de sessions.
- [Paramètres de démarrage](/reference/Boot-Parameters) est la référence complète des paramètres en ligne de commande.
- [Découverte système par initrd](/reference/boot-process/System-Discovery), [chargement des modules](/reference/boot-process/Module-Loading) et [persistance](/reference/boot-process/Persistence-Internals) expliquent comment les groupes de paramètres associés sont traités au démarrage.
