---
updated: 2026-10-15
program_commits:
    minios-store: c3d0d31db7966cd7809f0f4ba1ca642133c8f07a
---

# Installation de logiciels

La Boutique d’applications MiniOS propose un catalogue de recettes d’applications à l’adresse [store.minios.dev](https://store.minios.dev). Dans l’environnement live MiniOS, ces recettes peuvent être installées directement sur le système en cours d’exécution ou servir à créer un ou plusieurs modules SquashFS (`.sb`) .

Cette page décrit le processus d’installation de logiciels live MiniOS. Une installation native conserve le bureau sélectionné et les applications courantes, mais supprime les logiciels spécifiques à MiniOS destinés au fonctionnement live. Utilisez plutôt la méthode habituelle de gestion des paquets Debian sur le système installé.

La consultation du catalogue ne nécessite pas de serveur local. L’installation, elle, en nécessite un : l’interface Web se connecte au service de la Boutique d’applications MiniOS ou ouvre le gestionnaire d’URI installé `minios-store://`.

## Avant l’installation

Ouvrez la fiche d’une application et examinez les informations suivantes avant de l’ajouter au panier :

- Les noms des paquets et la méthode d’installation.
- Le script d’installation, s’il est affiché.
- La page d’accueil de l’application et les informations sur son développeur.
- Les captures d’écran et les illustrations de l’application, le cas échéant. Il s’agit de métadonnées de présentation, et non d’une preuve de fiabilité de la recette.
- La recette télécharge-t-elle un paquet Debian distinct ?
- Toute licence logicielle supplémentaire indiquée par la recette. Les recettes dont l’installation nécessite une acceptation ne peuvent être installées qu’après acceptation explicite de la licence.

Les recettes peuvent installer des paquets APT, télécharger des paquets Debian ou exécuter des scripts shell. Les opérations d’installation s’exécutent avec les privilèges root. Considérez toute recette, ainsi que chaque téléchargement et dépôt qu’elle utilise, comme du code privilégié.

## Installer une application

1. Ouvrez la Boutique d’applications MiniOS depuis le menu des applications. Le lanceur vérifie `https://store.minios.dev` et l’ouvre dans le navigateur par défaut.
2. Recherchez une application ou parcourez les catégories, ouvrez sa fiche et examinez les paquets ou le script.
3. Ajoutez une ou plusieurs applications au panier.
4. Dans une session live MiniOS, sélectionnez `Module` ou `System`.
5. En mode module, choisissez le niveau de compilation si nécessaire. **Par défaut pour la recette** conserve le niveau configuré pour chaque recette ; **Automatique** utilise tous les modules actuellement chargés comme base de compilation et génère un nom de module sans numéro ; un niveau numérique de `01` à `09` n’utilise que les modules chargés jusqu’à ce niveau. Privilégiez l’option « Par défaut pour la recette », sauf si vous souhaitez délibérément éviter les dépendances aux couches facultatives supérieures.
6. Pour plusieurs applications en mode module, choisissez un module combiné ou des modules séparés. Vous pouvez également attribuer un nom personnalisé à un module combiné.
7. Acceptez les licences des recettes qui l’exigent explicitement.
8. Sélectionnez `Install` et suivez la progression ainsi que la sortie des commandes. La page utilise le service local lorsqu’il est indiqué comme `Connected` ; sinon, elle tente d’utiliser le gestionnaire d’URI et peut afficher une demande d’authentification PolicyKit.

Une seule série d’installations par le service peut être exécutée à la fois. Fermer la boîte de dialogue de progression n’arrête pas nécessairement une installation en cours par le service ; rouvrez l’indicateur d’installation pour la consulter ou l’annuler explicitement.

## Modes module et système

### Mode module

Le mode module exécute `apt2sb` ou `script2sb` dans un environnement isolé de création de modules. Il écrit les fichiers `.sb` obtenus dans le premier emplacement accessible en écriture ci-dessous :

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Le premier chemin correspond au répertoire des modules de l’arborescence de données effective MiniOS. Lors d’un démarrage normal avec accès en écriture, il se trouve sur le stockage, mais après une `toram`copie système, il peut être adossé à RAM ; Store vérifie l’accès en écriture, pas la durabilité. Un module créé n’est pas activé dans la session en cours. Il ne sera chargé lors d’un démarrage ultérieur que s’il est copié sur un stockage durable `minios/modules/`et autorisé par les filtres de démarrage. Utilisez **Ajouter au prochain démarrage** ou `sudo sb next-boot add /path/to/module.sb`si un stockage durable adapté est disponible.

Le second chemin est un emplacement de secours utilisé lorsque le répertoire normal des modules n’est pas accessible en écriture. Un module dans cet emplacement n’est pas automatiquement inclus dans le prochain démarrage actif. Utilisez `Open folder`, puis copiez le module terminé dans le répertoire `minios/modules` du support de démarrage MiniOS accessible en écriture avant de redémarrer.

Un module combiné contient toutes les recettes sélectionnées. Avec un empaquetage séparé, une erreur peut affecter une recette, tandis que les modules achevés plus tôt dans le lot restent dans le répertoire cible.

### Mode système

Le mode système utilise APT ou un script de recette directement sur le système de fichiers racine en cours d’exécution. Les modifications prennent effet dans le système actif actuel au lieu de produire un module. Leur persistance après un redémarrage dépend de la configuration de persistance de la session.

Le mode système n’est pas transactionnel. Une opération échouée ou annulée peut laisser des paquets, l’état des dépôts ou des fichiers modifiés par des commandes précédentes.

## Service local et périmètre de confiance

Le service `minios-store` s’exécute en tant que root, car la création de modules et l’installation directe de paquets nécessitent des opérations mount, overlay, chroot, APT et dpkg. Par défaut, il écoute uniquement sur `ws://127.0.0.1:8765`. L’interface web hébergée transmet au service local les données complètes des recettes, y compris les scripts et les URL de téléchargement.

Le démon valide la structure de la requête et la méthode d’installation prise en charge, mais il n’authentifie pas et ne signe pas indépendamment le contenu de la recette. Une page pouvant accéder au point de terminaison WebSocket local peut demander l’exécution d’une installation avec privilèges. Par conséquent :

- Laissez le démon lié à `127.0.0.1`. N’exposez pas le port `8765` à un réseau local ni à Internet.
- Ne définissez pas `MINIOS_STORE_HOST` sur une adresse qui n’est pas une adresse de bouclage, sauf si une autre mesure de sécurité a été mise en place et examinée.
- Accédez à la Boutique d’applications MiniOS uniquement depuis son site HTTPS officiel et examinez les recettes avant de les installer.
- Arrêtez ou désactivez le service lorsque l’installation depuis le navigateur n’est pas nécessaire.

Gérez le service systemd avec :

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Le gestionnaire d’URI constitue une voie distincte. Il lance l’installateur GTK via PolicyKit et ne nécessite pas le démon WebSocket. Les liens actuels de Store incluent une recette complète encodée, permettant aux recettes APT, aux scripts et aux paquets DEB téléchargés d’utiliser la même solution de repli ; les acceptations explicites de licence sont transmises séparément et validées à nouveau par l’installateur local. L’ancien formulaire `recipes=id:level:compression` reste une solution de repli pour assurer la compatibilité et est interprété comme une recette APT. L’installateur démarre après autorisation ; examinez donc la requête du navigateur avant d’accepter la demande d’authentification.

## Annulation

Sélectionnez `Cancel` dans la boîte de dialogue de progression web ou `Cancel installation` dans l’installateur GTK. L’annulation marque le lot comme annulé et arrête le processus enfant suivi en cours. Les recettes restantes ne sont pas lancées.

L’annulation n’annule pas les modifications déjà effectuées. Les paquets ou modules terminés précédemment sont conservés, et une commande interrompue pendant APT, dpkg, l’exécution d’un script, un téléchargement ou la création d’un module peut laisser un état partiel ou un fichier de sortie incomplet. Après l’annulation :

1. Consultez le journal d’installation final.
2. Vérifiez que le répertoire cible des modules ne contient aucun fichier inattendu ou vide.
3. En mode système, exécutez `sudo dpkg --audit` et réparez la configuration des paquets si nécessaire.
4. Supprimez uniquement les éléments que vous avez identifiés comme appartenant à l’opération annulée.

## Résolution des problèmes

### Boutique d’applications MiniOS hors ligne

Vérifiez l’accès au réseau à `https://store.minios.dev`. Un statut `Offline` signifie également que le navigateur n’est pas connecté au démon WebSocket local ; l’installation peut toutefois se poursuivre via le gestionnaire d’URI si `minios-store-gui` est installé.

### Le navigateur ne parvient pas à se connecter au démon

Vérifiez le service et ses journaux :

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

Le point de terminaison habituel est `ws://127.0.0.1:8765`. Un conflit de port, un service arrêté, l’absence de `python3-websockets` ou des restrictions du navigateur peuvent empêcher la connexion. Redémarrer le navigateur ne répare pas un démon arrêté.

### Échec de l’authentification ou absence d’invite

L’installateur URI nécessite PolicyKit, `pkexec` et un agent d’authentification de bureau actif. Lancez l’installateur depuis une session graphique active et vérifiez que `minios-store-gui` est installé. Ne contournez pas l’invite en exposant le démon root sur le réseau.

### La création du module échoue

Développez le journal d’installation et examinez la dernière erreur de commande plutôt que de vous fier uniquement au résumé. Les causes fréquentes sont les paquets indisponibles, les problèmes de dépôt ou de DNS, l’espace libre insuffisant, un outil de compression non pris en charge et un répertoire de modules en lecture seule. Le daemon indique lorsqu’il est passé en mode `/var/lib/minios-store/modules`.

### L’application est absente après l’installation

En mode module, redémarrez après avoir vérifié que le fichier `.sb` se trouve dans le répertoire `minios/modules` du support de démarrage. Un fichier placé dans le répertoire de secours n’est pas chargé automatiquement. En mode système, lors d’une session live, vérifiez que la session est persistante si l’application a disparu après le redémarrage.

### Une installation système annulée a laissé dpkg dans un état incomplet

Vérifiez l’état des paquets avant de réessayer :

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Examinez les modifications proposées par APT avant de confirmer toute opération de réparation supplémentaire.

## Documentation associée

- [Créer des modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Reconstruire une ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
