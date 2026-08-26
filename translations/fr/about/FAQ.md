# Foire aux questions

## Quelle édition choisir et pourquoi une application est-elle absente ?

L’édition Flux utilise l’environnement Flux basé sur Fluxbox et un ensemble de paquets réduit. Les éditions Standard, Toolbox et Ultra ajoutent progressivement différents logiciels, mais leur disponibilité varie selon la version. Consultez [À propos de MiniOS](/about/About-MiniOS.md), [Applications MiniOS](/about/MiniOS-Applications.md) et la [liste des paquets](/administration/Packages.md).

## Écrire l’ISO revient-il à installer MiniOS ?

Non. Écrire l’ISO crée un support live amorçable. L’installateur MiniOS permet de déployer soit un système live modulaire avec persistance optionnelle, soit un système natif classique. Choisissez une configuration avec [Installation de MiniOS](/installation/Installing-MiniOS.md) et [Installateur MiniOS](/installation/MiniOS-Installer.md).

## Quels sont les identifiants par défaut ?

Une image live non personnalisée utilise `live` / `evil` et `root` / `toor`, et peut autoriser la connexion automatique et l’administration sans mot de passe. Modifiez-les avant d’utiliser un réseau non sécurisé ; suivez [Renforcement de la sécurité](/administration/Security-Hardening.md).

## Écrire MiniOS sur une clé USB permet-il la persistance ?

Pas forcément. L’écriture brute de l’ISO et le démarrage classique de l’ISO avec Ventoy ne configurent pas automatiquement une session persistante. Suivez [Démarrage rapide](/installation/Quick-Start.md) et [Gestion des sessions](/configuration/Session-Management.md) selon la méthode d’écriture et de démarrage choisie.

## Quelle est la différence entre la session active et la session en cours d’exécution ?

La session active est celle sélectionnée pour le prochain démarrage ; la session en cours d’exécution fournit la persistance actuellement. Activer une session ne change pas le système en cours. Voir la [Gestion des sessions](/configuration/Session-Management.md).

## Pourquoi mes modifications ont-elles disparu après le redémarrage ?

Vous avez peut-être démarré une nouvelle session, utilisé un support sans persistance, sélectionné une session différente ou éteint l’ordinateur avant que les modifications ne soient enregistrées. Vérifiez la session en cours et la session active comme décrit dans la [Gestion des sessions](/configuration/Session-Management.md) et la section [Dépannage](/administration/Troubleshooting.md).

## LUKS et SquashFS sont-ils le même type de persistance ?

Non. LUKS stocke une session ext4 chiffrée et modifiable dans un conteneur. SquashFS est un instantané compressé qui s’exécute à partir d’une couche modifiable en RAM et doit être enregistré selon sa politique. Voir [Gestion des sessions](/configuration/Session-Management.md) et [Renforcement de la sécurité](/administration/Security-Hardening.md).

## Pourquoi une application ou un module du Store apparaît-il seulement après le redémarrage ?

Le mode module crée un module `.sb` en lecture seule pour le prochain démarrage ; il n’ajoute pas l’application à la pile de modules actuelle. Vérifiez son emplacement et redémarrez comme indiqué dans la section [MiniOS Store](/administration/MiniOS-Store.md).

## Dois-je installer un logiciel avec APT ou sous forme de module ?

Utilisez APT pour modifier un seul système en cours d’exécution ou une session persistante. Utilisez les modules pour des couches logicielles en lecture seule chargées au démarrage. Comparez les effets et les besoins de stockage dans [Mises à jour logicielles](/administration/Software-Updates.md) et [Création de modules](/development/Creating-Modules.md).

## Puis-je mettre à niveau MiniOS vers une nouvelle version sur place ?

Il n’existe pas de mise à niveau prise en charge sur place. Ne considérez pas une mise à niveau Debian comme une mise à niveau d’image MiniOS. Sauvegardez vos données et utilisez une image conçue pour la version cible ; voir [Mises à jour logicielles](/administration/Software-Updates.md).

## Dois-je utiliser `ip=` pour configurer le réseau normalement ?

Non. Fournir une configuration d'adresse via `ip=<configuration>` active le démarrage réseau anticipé et ignore les supports locaux. Configurez le système en cours d'exécution avec NetworkManager ou les outils réseau documentés. Consultez
[Boot réseau](/installation/Network-Boot.md) et
[Configuration réseau](/configuration/Network-Configuration.md).

## Comment conserver les paramètres Wi-Fi après redémarrage ?

Enregistrez le profil NetworkManager dans une session live persistante ou une installation native, puis testez un redémarrage. L’installateur ne crée ni ne modifie les profils Wi-Fi. Voir [Configuration réseau](/configuration/Network-Configuration.md) et [Gestion des sessions](/configuration/Session-Management.md).

## MiniOS prend-il en charge BIOS et UEFI ?

MiniOS prend en charge le BIOS hérité et l’UEFI x86-64, mais l’entrée de firmware disponible et la disposition des partitions de l’installateur restent importantes. Voir [Installation de MiniOS](/installation/Installing-MiniOS.md) et utilisez [Récupération du démarrage](/administration/Boot-Recovery.md) si un système installé ne démarre pas.

## Comment vérifier une image ISO ?

Téléchargez l’ISO et le fichier `.iso.sha256` correspondant depuis la même version officielle, puis comparez la somme de contrôle SHA-256 avant de l’écrire ou de la démarrer. Suivez [Vérification des téléchargements](/installation/Verifying-Downloads.md).

## Dois-je réparer d’abord une session ou un système de fichiers endommagé ?

Sauvegardez les données importantes et identifiez précisément le périphérique, le système de fichiers et le point de montage avant toute modification. Ne réparez jamais l’unique copie ou une session active. Commencez par [Sauvegarde et restauration](/administration/Backup-Recovery.md), [Dépannage](/administration/Troubleshooting.md) et [Récupération du démarrage](/administration/Boot-Recovery.md).

## Que dois-je inclure lorsque je demande de l’aide ou signale un problème ?

Indiquez l’édition et la version, les méthodes de démarrage et de persistance, le matériel, les étapes exactes, la première erreur et les journaux pertinents. Supprimez les identifiants et autres données sensibles, puis suivez la procédure [Collecte des journaux](/administration/Troubleshooting.md) et signalez les défauts reproductibles dans le [MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).

## Dois-je compiler depuis les sources ou utiliser Image Builder ?

Compilez depuis les sources si vous devez créer l’ensemble complet du système MiniOS et des modules. Utilisez [MiniOS Image Builder](/development/Image-Builder.md) pour une personnalisation guidée, ou [`minios-image-compose`](/development/Rebuilding-ISO.md) pour composer un arbre de contenu MiniOS existant en ligne de commande. Voir [Compilation de MiniOS](/development/Building-MiniOS.md) pour la construction depuis les sources).
