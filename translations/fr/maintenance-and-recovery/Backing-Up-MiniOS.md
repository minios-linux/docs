---
updated: 2026-10-06
---

# Sauvegarde de MiniOS

Une sauvegarde est la solution fiable pour restaurer MiniOS. La documentation ne garantit pas de procédure de réparation générale pour un bootloader, un système de fichiers ou un conteneur de persistance endommagé. Conservez des copies récupérables avant de modifier une version, un noyau, la structure du stockage ou une session importante.

## Que sauvegarder

Conservez les éléments qui ne peuvent pas simplement être recréés à partir d’une image MiniOS :

- vos fichiers personnels, y compris les données d’application cachées qui vous sont importantes ;
- `config.conf`, vérifiés `config.conf.d` fichiers, ainsi que les modifications intentionnelles du menu ou des paramètres de démarrage ;
- modules créés par l’utilisateur `.sb` et notez la version de MiniOS pour laquelle ils ont été construits ;
- sessions persistantes contenant un état système ou applicatif dont vous avez besoin ;
- clés de chiffrement, identifiants de récupération et autres secrets stockés séparément de la sauvegarde qu’ils protègent.

Les fichiers stockés en dehors de la couche session, par exemple dans un emplacement de données utilisateur séparé, doivent être sauvegardés séparément. N’assumez pas qu’une archive de session contient des données montées depuis un autre système de fichiers.

## Exporter des sessions persistantes

Le Gestionnaire de sessions MiniOS peut exporter une session **inactive** `native`, `dynfilefs`, `dynblk`, `vmdk`, ou `raw` session, y compris les formats chiffrés LUKS2 pris en charge, vers une archive vérifiée `.tar.zst`. Identifiez d’abord la session :

```bash
minios-session list
minios-session running
```

Démarrez ensuite une autre session ou **Démarrer sans enregistrer** et exportez la session inactive :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

L’exportation est une copie logique du contenu de la session, et non une copie bit à bit de son conteneur de stockage. Enregistrez-la sur un autre périphérique.

Pour une session dont le backend Raw, DynFileFS, DynBlk ou VMDK est encapsulé dans LUKS2, l’archive contient les fichiers logiques déchiffrés. Protégez l’archive séparément si les données doivent rester chiffrées.

### Sessions SquashFS

Le Gestionnaire de sessions actuel n’exporte ni ne copie les sessions SquashFS. Utilisez **Enregistrer maintenant** avant l’arrêt afin que l’instantané courant soit complet, puis protégez séparément les fichiers importants. Si vous avez besoin d’une copie complète et restaurable de tout le périphérique MiniOS, créez plutôt une image du périphérique hors ligne.

Ne vous fiez pas à la copie manuelle d’un répertoire de session monté ni à la reconstruction de `session.conf`, segments DynFileFS, fichiers de support DynBlk ou autres métadonnées de conteneur comme méthode de sauvegarde. Une sauvegarde manuelle bit à bit DynBlk n’est sûre que lorsque le volume est détaché et doit préserver toutes les `volume*.db` parties existantes, y compris les numéros de quatre chiffres ou plus, exactement tels qu’ils sont ; la sauvegarde logique `minios-session export` est préférable.

## Sauvegarder la configuration et les modules

Sur un support MiniOS inscriptible, conservez `minios/config.conf`, `minios/config.conf.d/`, ainsi que les modules créés par l’utilisateur stockés sous `minios/modules/`.
Notez également les paramètres personnalisés de démarrage ou les modifications du menu de démarrage qui ne sont pas évidentes à partir de ces fichiers.

Un module construit pour une version MiniOS n’est pas automatiquement compatible avec une autre.
Conservez la source ou la recette nécessaire pour reconstruire les modules personnalisés importants.

## Créer une image complète du périphérique

Une image complète du périphérique est utile si vous souhaitez conserver la table de partitions, les fichiers de démarrage, les modules, la configuration, les sessions et d’autres données ensemble. Créez-la hors ligne : éteignez MiniOS et réalisez l’image du périphérique depuis un autre système en fonctionnement.

[Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility) propose les opérations **Créer une image** et **Écrire une image**. Sauvegardez l’image sur un autre support physique. La restauration d’une image complète écrase la cible sélectionnée, vérifiez donc le modèle et la capacité avant d’écrire.

Une image de périphérique complète complète, mais ne remplace pas, une sauvegarde séparée de vos fichiers personnels importants.

## Restaurer une archive de session

L’import d’une archive du Gestionnaire de sessions crée une nouvelle session numérotée ; la session existante n’est pas écrasée :

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Des vérifications de compatibilité sont effectuées lors de l’import. Examinez la session importée avant de l’activer et conservez la session fonctionnelle connue jusqu’à ce que la copie restaurée ait été testée.

Lors du passage à une autre version de MiniOS, il est préférable de migrer uniquement les données personnelles et la configuration nécessaires. N’assumez pas qu’une ancienne session complète ou un module personnalisé est compatible avec la nouvelle version simplement parce qu’il peut y être copié.

Voir [Sessions et persistance](/using-minios/Sessions-and-Persistence) pour la gestion des sessions et [Mise à jour de MiniOS](/maintenance-and-recovery/Updating-MiniOS) pour le passage entre différentes versions de MiniOS.
