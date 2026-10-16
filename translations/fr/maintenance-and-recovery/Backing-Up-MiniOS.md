---
updated: 2026-10-15
---

# Sauvegarde de MiniOS

Une sauvegarde est le moyen fiable de récupérer MiniOS. La documentation ne garantit pas l’existence d’une procédure générale de réparation d’un chargeur d’amorçage, d’un système de fichiers ou d’un conteneur de persistance endommagé. Conservez des copies récupérables avant de modifier une version, un noyau, la disposition du stockage ou une session importante.

## Éléments à sauvegarder

Conservez les éléments qui ne peuvent pas être recréés simplement à partir d’une image MiniOS :

- les fichiers personnels, y compris les données d’application cachées auxquelles vous tenez ;
- `config.conf`, les fichiers `config.conf.d` vérifiés et les modifications intentionnelles apportées au menu ou aux paramètres d’amorçage ;
- les modules `.sb` créés par l’utilisateur ainsi qu’une note indiquant la version MiniOS pour laquelle ils ont été compilés ;
- les sessions persistantes contenant l’état système ou applicatif dont vous avez besoin ;
- les clés de chiffrement, les identifiants de récupération et autres secrets, stockés séparément de la sauvegarde qu’ils protègent.

Les fichiers stockés hors de la couche de session, par exemple dans un emplacement distinct réservé aux données utilisateur, doivent être sauvegardés séparément. Ne supposez pas qu’une archive de session contient les données montées depuis un autre système de fichiers.

## Exporter des sessions persistantes

Le Gestionnaire de sessions MiniOS permet d’exporter une session **inactive** `native`, `dynfilefs`, `dynblk`, `vmdk` ou `raw` session, y compris les formats pris en charge chiffrés avec LUKS2, dans une archive `.tar.zst` vérifiée. Commencez par identifier la session :

```bash
sudo minios-session list
sudo minios-session running
```

Démarrez ensuite une autre session ou **Démarrer sans enregistrer** et exportez la session inactive :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

L’export est une copie logique du contenu de la session, et non une copie octet par octet de son conteneur de stockage. Enregistrez-la sur un autre appareil.

Pour une session dont le backend Raw, DynFileFS, DynBlk ou VMDK est encapsulé dans LUKS2, l’archive contient les fichiers logiques déchiffrés. Protégez l’archive séparément si les données doivent rester chiffrées.

### Sessions SquashFS

La version actuelle du Gestionnaire de sessions n’exporte ni ne copie les sessions SquashFS. Utilisez **Enregistrer maintenant** avant l’arrêt afin que l’instantané actuel soit complet, puis protégez séparément les fichiers importants. Si vous avez besoin d’une copie complète et restaurable de l’ensemble du périphérique MiniOS, créez plutôt une image du périphérique hors ligne.

Ne vous fiez pas à la copie manuelle d’un répertoire de session monté ni à la reconstitution des `session.conf`, des segments DynFileFS, des fichiers de support DynBlk ou d’autres métadonnées du conteneur comme méthode de sauvegarde. Une sauvegarde manuelle octet par octet de DynBlk n’est sûre que lorsque le volume est détaché et doit conserver toutes les parties existantes, y compris celles dont le numéro comporte quatre chiffres ou plus, exactement comme elles sont ; la sauvegarde logique `volume*.db` est privilégiée.`minios-session export`

## RAM et images de persistance Ventoy

Avant de sauvegarder le stockage utilisé par une `perchtoram` session, enregistrez explicitement l’état RAM dans son espace de stockage d’origine ou en tant que nouvelle session. Sinon, une copie hors ligne du support d’origine ne contient que le dernier état enregistré. L’enregistrement nécessite le support inscriptible d’origine et son identité enregistrée ; voir [Sessions et persistance](/using-minios/Sessions-and-Persistence).

Un backend Persistence Plugin sélectionné Ventoy correspond à un environnement ext4, et non à une session MiniOS numérotée ; il ne peut pas être exporté via Session Manager. Arrêtez-le correctement avant de copier l’image complète du backend depuis un autre système ; conservez également sa configuration Ventoy. Conservez des sauvegardes distinctes de vos fichiers personnels importants.

## Sauvegarder la configuration et les modules

Sur les supports MiniOS inscriptibles, conservez `minios/config.conf`, `minios/config.conf.d/` et les modules créés par l’utilisateur stockés dans `minios/modules/`.
Notez également les paramètres de démarrage personnalisés ou les modifications du menu de démarrage qui ne sont pas évidents à partir de ces fichiers.

Un module conçu pour une version MiniOS n’est pas automatiquement compatible avec une autre.
Conservez le code source ou la recette nécessaire pour reconstruire les modules personnalisés importants.

## Créer une image complète de l’appareil

Une image complète de l’appareil est utile pour conserver ensemble la table de partition, les fichiers de démarrage, les modules, la configuration, les sessions et les autres données. Créez-la hors ligne : arrêtez MiniOS et créez une image de l’appareil depuis un autre système en cours d’exécution.

[Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility) propose les opérations **Créer une image** et **Écrire une image**. Enregistrez l’image sur un autre appareil physique. La restauration d’une image complète de l’appareil écrase la cible sélectionnée ; vérifiez donc le modèle et la capacité de la cible avant d’écrire l’image.

L’image d’un appareil complète, sans la remplacer, une sauvegarde distincte des fichiers personnels importants.

## Restaurer une archive de session

L’importation d’une archive Session Manager crée une nouvelle session numérotée ; elle n’écrase pas la session existante :

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Les vérifications de compatibilité sont effectuées pendant l’importation. Examinez la session importée avant de l’activer et conservez la session dont le fonctionnement est connu jusqu’à ce que la copie restaurée ait été testée.

Lors du passage à une autre version MiniOS, privilégiez la migration des données personnelles et de la configuration de votre choix. Ne partez pas du principe qu’une ancienne session complète ou un module personnalisé est compatible avec la nouvelle version simplement parce qu’il peut y être copié.

Voir [Sessions et persistance](/using-minios/Sessions-and-Persistence) pour la gestion des sessions et [Mise à jour de MiniOS](/maintenance-and-recovery/Updating-MiniOS) pour passer d’une version MiniOS à une autre.
