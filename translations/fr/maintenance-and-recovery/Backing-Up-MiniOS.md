---
updated: 2026-08-31
---

# Sauvegarde de MiniOS

Une sauvegarde constitue la méthode fiable pour restaurer MiniOS. La documentation ne garantit pas de procédure de réparation générique pour un bootloader, un système de fichiers ou un conteneur de persistance endommagé. Conservez des copies récupérables avant de modifier une version, un noyau, la structure de stockage ou une session importante.

## Que sauvegarder

Conservez les éléments qui ne peuvent pas simplement être recréés à partir d'une image MiniOS :

- fichiers personnels, y compris les données d'application cachées qui vous sont importantes ;
- `config.conf`, fichiers `config.conf.d` vérifiés, et modifications intentionnelles du menu de démarrage ou des paramètres de démarrage ;
- modules `.sb` créés par l'utilisateur et une note de la version MiniOS pour laquelle ils ont été construits ;
- sessions persistantes contenant l'état système ou applicatif dont vous avez besoin ;
- clés de chiffrement, identifiants de récupération et autres secrets stockés séparément de la sauvegarde qu'ils protègent.

Les fichiers stockés en dehors de la couche de session, par exemple dans un emplacement de données utilisateur distinct, doivent être sauvegardés séparément. N'assumez pas qu'une archive de session contient des données montées depuis un autre système de fichiers.

## Exporter des sessions persistantes

Le Gestionnaire de sessions MiniOS peut exporter une session **non active** `native`, `dynfilefs`, `raw` ou `luks` vers une archive `.tar.zst` vérifiée. Identifiez d'abord la session :

```bash
minios-session list
minios-session running
```

Démarrez ensuite une autre session ou choisissez **Démarrer sans enregistrer** et exportez la session inactive :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

L’exportation est une copie logique du contenu de la session, et non une copie bit à bit de son conteneur de stockage. Stockez-la sur un autre appareil.

Pour une session LUKS, l’archive contient les fichiers logiques déchiffrés. Protégez l’archive séparément si les données doivent rester chiffrées.

### Sessions SquashFS

Le Session Manager actuel n’exporte ni ne copie les sessions SquashFS. Utilisez **Sauvegarder maintenant** avant l’arrêt afin que l’instantané courant soit complet, puis protégez séparément les fichiers importants. Si vous avez besoin d’une copie complète et restaurable de l’ensemble du périphérique MiniOS, créez plutôt une image du périphérique hors ligne.

Ne comptez pas sur la copie manuelle d’un répertoire de session monté ni sur la reconstruction de `session.conf`, des segments DynFileFS ou des métadonnées de conteneur comme méthode de sauvegarde.

## Sauvegarder la configuration et les modules

Sur un support MiniOS inscriptible, conservez `minios/config.conf`, `minios/config.conf.d/` et les modules créés par l'utilisateur stockés sous `minios/modules/`.
Notez également les paramètres de démarrage personnalisés ou les modifications du menu de démarrage qui ne sont pas évidentes à partir de ces fichiers.

Un module construit pour une version MiniOS n'est pas automatiquement compatible avec une autre.
Conservez la source ou la recette nécessaire pour reconstruire les modules personnalisés importants.

## Créer une image de l'appareil entier

Une image de l'appareil entier est utile lorsque vous souhaitez conserver ensemble la table de partitions, les fichiers de démarrage, les modules, la configuration, les sessions et d'autres données. Créez-la hors ligne : éteignez MiniOS et réalisez l'image du périphérique depuis un autre système en fonctionnement.

L’Utilitaire de disque propose les opérations **Créer une image** et **Écrire une image**. Enregistrez l’image sur un autre support physique. La restauration d’une image de l’appareil entier écrase la cible sélectionnée, donc vérifiez le modèle et la capacité de la cible avant d’écrire.

Une image d’appareil complète est un complément, et non un substitut, à une sauvegarde séparée de vos fichiers personnels importants.

## Restaurer une archive de session

L'importation d'une archive Session Manager crée une nouvelle session numérotée ; elle n'écrase pas l'existante :

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Des vérifications de compatibilité sont effectuées lors de l'importation. Examinez la session importée avant de l'activer et conservez la session connue comme fonctionnelle jusqu'à ce que la copie restaurée ait été testée.

Lors du passage à une autre version MiniOS, il est préférable de migrer uniquement les données personnelles et la configuration nécessaires. N'assumez pas qu'une ancienne session complète ou un module personnalisé est compatible avec la nouvelle version simplement parce qu'il peut y être copié.

Voir [Sessions et persistance](/using-minios/Sessions-and-Persistence) pour la gestion des sessions et [Mise à jour de MiniOS](/maintenance-and-recovery/Updating-MiniOS) pour le passage entre les versions MiniOS.
