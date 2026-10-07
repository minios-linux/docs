---
updated: 2026-10-06
program_commits:
    minios-store: eec5785dd7eb547961c2799f1907496a33be2e8c
---

# Installation de logiciels

La Boutique d’applications MiniOS propose un catalogue de recettes d’applications à l’adresse [store.minios.dev](https://store.minios.dev). Dans l’environnement live MiniOS, ces recettes peuvent être installées directement sur le système en cours d’exécution ou utilisées pour créer un ou plusieurs modules SquashFS (`.sb`) .

Cette page décrit le flux d’installation logicielle en mode live MiniOS. Une installation native conserve l’environnement de bureau et les applications sélectionnées, mais supprime les logiciels spécifiques à MiniOS conçus pour le fonctionnement en mode live. Utilisez alors la gestion habituelle des paquets Debian sur le système installé.

La navigation dans le catalogue ne nécessite pas de serveur local. L’installation, elle, en requiert un : l’interface web se connecte soit au démon local de la Boutique d’applications MiniOS, soit ouvre le gestionnaire d’URI installé`minios-store://` .

## Avant l’installation

Ouvrez la fiche d’une application et vérifiez les informations suivantes avant de l’ajouter au panier :

- Les noms des paquets et la méthode d’installation.
- Le script d’installation, s’il est affiché.
- La page d’accueil de l’application et les informations sur le développeur.
- Captures d’écran et illustrations, si disponibles. Il s’agit de métadonnées de présentation, non d’une preuve de fiabilité de la recette.
- Si la recette télécharge un paquet Debian séparé.
- Toute licence logicielle supplémentaire affichée par la recette. Les recettes nécessitant une acceptation explicite ne peuvent être installées tant que vous n’avez pas accepté cette licence.

Les recettes peuvent installer des paquets APT, télécharger des paquets Debian ou exécuter des scripts shell. Les opérations d’installation sont exécutées avec les droits administrateur. Considérez chaque recette et chaque téléchargement ou dépôt utilisé comme du code privilégié.

## Installer une application

1. Ouvrez la Boutique d’applications MiniOS depuis le menu des applications. Le lanceur vérifie `https://store.minios.dev` et l’ouvre dans le navigateur par défaut.
2. Recherchez ou parcourez par catégorie, ouvrez la fiche de l’application et examinez les paquets ou le script.
3. Ajoutez une ou plusieurs applications au panier.
4. En session live MiniOS, sélectionnez `Module` ou `System`.
5. En mode module, choisissez le niveau de construction si nécessaire. **Par défaut de la recette** conserve le niveau configuré dans chaque recette ; **Auto** utilise tous les modules actuellement chargés comme base de construction et produit un nom de module sans numéro ; un niveau numérique de `01` à `09` utilise uniquement les modules chargés jusqu’à ce niveau. Préférez « Par défaut de la recette » sauf si vous souhaitez éviter des dépendances sur des couches optionnelles supérieures.
6. Pour plusieurs applications en mode module, choisissez un module combiné ou des modules séparés. Un module combiné peut aussi recevoir un nom personnalisé.
7. Acceptez toute licence de recette nécessitant une acceptation explicite.
8. Sélectionnez `Install` et suivez la progression ainsi que la sortie des commandes. La page utilise le démon local lorsque son état est `Connected` ; sinon, elle tente d’utiliser le gestionnaire d’URI et peut afficher une demande d’authentification PolicyKit.

Un seul lot d’installation via le démon peut être lancé à la fois. Fermer la fenêtre de progression ne stoppe pas forcément l’installation en cours ; rouvrez l’indicateur d’installation pour la consulter ou annulez-la explicitement.

## Modes module et système

### Mode module

Le mode module exécute `apt2sb` ou `script2sb` dans un environnement isolé de construction de modules. Il enregistre les fichiers `.sb` résultants dans le premier emplacement inscriptible ci-dessous :

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Le premier chemin correspond au répertoire des modules sur le support de démarrage MiniOS actuel. Un module créé à cet emplacement n’est pas activé dans la session en cours par la Boutique d’applications MiniOS. Laissez le module dans ce dossier et redémarrez pour le charger au prochain démarrage. Le résultat reste disponible uniquement si le support de démarrage sous-jacent est inscriptible et conserve le fichier.

Le second chemin est un emplacement de secours utilisé lorsque le répertoire des modules habituel n’est pas inscriptible. Un module dans ce dossier de secours n’est pas intégré automatiquement au prochain démarrage live. Utilisez `Open folder`, puis copiez le module finalisé dans le répertoire `minios/modules` sur un support de démarrage MiniOS inscriptible avant de redémarrer.

Un module combiné regroupe toutes les recettes sélectionnées. En cas d’empaquetage séparé, une erreur peut n’affecter qu’une recette tandis que les modules déjà terminés restent dans le dossier cible.

### Mode système

Le mode système utilise APT ou un script de recette directement sur le système de fichiers racine en cours d’exécution. Les modifications prennent effet immédiatement dans le système live, sans produire de module. Leur persistance après redémarrage dépend de la configuration de persistance de la session.

Le mode système n’est pas transactionnel. Une opération échouée ou annulée peut laisser des paquets, l’état du dépôt ou des fichiers modifiés par des commandes précédentes.

## Service local et frontière de confiance

Le `minios-store` service s’exécute en tant que root car la construction de modules et l’installation directe de paquets nécessitent des opérations de montage, overlay, chroot, APT et dpkg. Par défaut, il écoute uniquement sur `ws://127.0.0.1:8765`. L’interface web hébergée transmet l’intégralité des données de recette, y compris scripts et URL de téléchargement, à ce service local.

Le démon valide la structure de la requête et la méthode d’installation prise en charge, mais il n’authentifie ni ne signe indépendamment la recette. Une page pouvant accéder au point de terminaison WebSocket local peut demander une installation privilégiée. Ainsi :

- Laissez le démon lié à `127.0.0.1`. N’exposez pas le port `8765` sur le réseau local ou Internet.
- Ne définissez pas `MINIOS_STORE_HOST` sur une adresse autre que loopback sauf si une frontière de sécurité supplémentaire et validée est en place.
- Accédez à la Boutique d’applications MiniOS uniquement via son site officiel HTTPS et examinez les recettes avant installation.
- Arrêtez ou désactivez le service lorsque l’installation via le navigateur n’est pas nécessaire.

Gérez le service systemd avec :

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Le gestionnaire d’URI est une voie distincte. Il lance l’installateur GTK via PolicyKit et ne nécessite pas le démon WebSocket. Les liens Store actuels incluent une recette encodée complète, ce qui permet aux recettes APT, script et DEB téléchargé d’utiliser le même chemin de secours ; les acceptations de licence explicites sont transmises séparément et revérifiées par l’installateur local. L’ancien format `recipes=id:level:compression` reste un mode de compatibilité et est interprété comme une recette APT. L’installateur démarre après autorisation, donc vérifiez la requête du navigateur avant d’accepter la demande d’authentification.

## Annulation

Sélectionnez `Cancel` dans la fenêtre de progression web ou `Cancel installation` dans l’installateur GTK. L’annulation marque le lot comme annulé et termine le processus enfant suivi. Les recettes restantes ne sont pas lancées.

L’annulation n’est pas un retour arrière. Les paquets ou modules déjà terminés restent présents, et une commande interrompue lors d’APT, dpkg, d’un script, d’un téléchargement ou de la construction d’un module peut laisser un état partiel ou un fichier de sortie incomplet. Après annulation :

1. Consultez le journal d’installation final.
2. Vérifiez le dossier cible des modules pour détecter des fichiers inattendus ou de taille nulle.
3. En mode système, exécutez `sudo dpkg --audit` et réparez la configuration des paquets si besoin.
4. Ne supprimez que les éléments que vous avez identifiés comme appartenant à l’opération annulée.

## Dépannage

### La Boutique d’applications MiniOS est hors ligne

Vérifiez l’accès réseau à `https://store.minios.dev`. Un état `Offline` indique aussi que le navigateur n’est pas connecté au démon WebSocket local ; l’installation peut néanmoins se poursuivre via le gestionnaire d’URI si `minios-store-gui` est installé.

### Le navigateur ne peut pas se connecter au démon

Vérifiez le service et ses journaux :

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Le point de terminaison habituel est `ws://127.0.0.1:8765`. Un conflit de port, un service arrêté, l’absence de `python3-websockets`, ou des restrictions du navigateur peuvent empêcher la connexion. Redémarrer le navigateur ne relance pas un démon arrêté.

### Échec d’authentification ou absence de demande

L’installateur URI requiert PolicyKit, `pkexec`, et un agent d’authentification de bureau actif. Lancez l’installateur depuis une session graphique active et vérifiez que `minios-store-gui` est installé. N’essayez pas de contourner la demande en exposant le démon root sur le réseau.

### Échec de la construction du module

Développez le journal d’installation et utilisez la dernière erreur de commande plutôt que le simple résumé. Les causes fréquentes incluent des paquets indisponibles, des échecs de dépôt ou DNS, un espace disque insuffisant, un outil de compression non pris en charge ou un dossier de modules en lecture seule. Le démon signale lorsqu’il bascule vers `/var/lib/minios-store/modules` .

### L’application est absente après installation

En mode module, redémarrez après avoir vérifié que le fichier `.sb` se trouve dans le dossier `minios/modules` du support de démarrage. Un fichier laissé dans le dossier de secours n’est pas chargé automatiquement. En mode système sur une session live, vérifiez que la session est persistante si l’application a disparu après redémarrage.

### Une installation système annulée a laissé dpkg inachevé

Vérifiez l’état des paquets avant de réessayer :

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Examinez les modifications APT proposées avant de confirmer toute opération de réparation supplémentaire.

## Documentation associée

- [Créer des modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Reconstruire une ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
