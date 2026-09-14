---
updated: 2026-09-13
---

# Sauvegarde de MiniOS

Une sauvegarde est la solution fiable pour restaurer MiniOS. La documentation n'offre aucune procédure de réparation générique pour un bootloader, un système de fichiers ou un conteneur de persistance endommagé. Conservez des copies récupérables avant de modifier une version, le noyau, la structure de stockage ou une session importante.

## Que sauvegarder

Conservez les éléments qui ne peuvent pas être simplement recréés à partir d’une image MiniOS :

- vos fichiers personnels, y compris les données d’application cachées qui vous importent ;
- `config.conf`, vérifiés `config.conf.d` fichiers, ainsi que les modifications intentionnelles du menu de démarrage ou des paramètres de démarrage ;
- modules créés par l’utilisateur `.sb` et notez la version MiniOS pour laquelle ils ont été construits ;
- les sessions persistantes contenant l’état système ou applicatif dont vous avez besoin ;
- les clés de chiffrement, identifiants de récupération et autres secrets stockés séparément de la sauvegarde qu’ils protègent.

Les fichiers stockés en dehors de la couche session, par exemple dans un emplacement utilisateur séparé, doivent être sauvegardés séparément. Ne supposez pas qu’une archive de session contient des données montées depuis un autre système de fichiers.

## Exporter des sessions persistantes

Le Gestionnaire de sessions MiniOS peut exporter une session **inactive** `native`, `dynfilefs`, `dynblk`, `raw`, ou `luks` vers une archive vérifiée de session`.tar.zst`. Identifiez d’abord la session :

```bash
minios-session list
minios-session running
```

Démarrez ensuite une autre session ou **Démarrer sans sauvegarder** et exportez la session inactive :

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

L’exportation crée une copie logique du contenu de la session, et non une copie bit à bit de son conteneur de stockage. Enregistrez-la sur un autre appareil.

Pour une session LUKS, l’archive contient les fichiers logiques déchiffrés. Protégez l’archive séparément si les données doivent rester chiffrées.

### sessions SquashFS

Le Gestionnaire de sessions actuel n’exporte ni ne copie les sessions SquashFS. Utilisez **Enregistrer maintenant** avant l’arrêt afin que l’instantané courant soit complet, puis protégez séparément les fichiers importants. Si vous avez besoin d’une copie complète et restaurable de l’intégralité du périphérique MiniOS, créez plutôt une image du périphérique hors ligne.

Ne comptez pas sur la copie manuelle d’un répertoire de session monté ni sur la reconstruction de `session.conf`, des segments DynFileFS, des fichiers dynblk ou d’autres métadonnées de conteneur comme méthode de sauvegarde. Une sauvegarde manuelle bit à bit d’un dynblk n’est sûre que si le volume est détaché et doit préserver l’intégralité de son espace `volume000.db` jusqu’à la fin de `volume063.db` l’espace de nom tel qu’il existe ; la sauvegarde logique de `minios-session export` est recommandée.

## Sauvegarder la configuration et les modules

Sur un support MiniOS inscriptible, conservez `minios/config.conf`, `minios/config.conf.d/`, ainsi que les modules créés par l’utilisateur stockés dans `minios/modules/`.
Notez également les paramètres de démarrage personnalisés ou modifications du menu de démarrage qui ne sont pas évidents dans ces fichiers.

Un module compilé pour une version MiniOS n’est pas forcément compatible avec une autre.
Gardez la source ou la recette nécessaire pour reconstruire les modules personnalisés importants.

## Créer une image complète du périphérique

Une image complète du périphérique est utile si vous souhaitez conserver la table de partitions, les fichiers de démarrage, les modules, la configuration, les sessions et d’autres données ensemble. Créez-la hors ligne : éteignez MiniOS et réalisez l’image depuis un autre système en fonctionnement.

[Utilitaire de disque](/installing-minios/installation-tools/Drive-Utility) propose les opérations **Créer une image** et **Écrire une image**. Sauvegardez l’image sur un autre support physique. Restaurer une image complète du périphérique écrase la cible sélectionnée, vérifiez donc bien le modèle et la capacité avant d’écrire.

Une image de périphérique complète complète, mais ne remplace pas, une sauvegarde séparée de vos fichiers personnels importants.

## Restaurer une archive de session

L’import d’une archive du Gestionnaire de sessions crée une nouvelle session numérotée ; elle ne remplace pas l’existante :

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

Des vérifications de compatibilité sont effectuées à l’import. Vérifiez la session importée avant de l’activer et conservez la session fonctionnelle connue jusqu’à ce que la copie restaurée ait été testée.

Lors du passage à une autre version MiniOS, privilégiez la migration des données personnelles et de la configuration sélectionnées. Ne supposez pas qu’une ancienne session complète ou un module personnalisé est compatible avec la nouvelle version simplement parce qu’il peut y être copié.

Voir [Sessions et persistance](/using-minios/Sessions-and-Persistence) pour la gestion des sessions et [Mise à jour de MiniOS](/maintenance-and-recovery/Updating-MiniOS) pour le passage entre les versions MiniOS.
