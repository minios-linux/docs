---
updated: 2026-08-31
program_commits:
    minios-store: 2226f08d65dffd251ae016664239164a3b237fc0
---

# Installation de logiciels

La Boutique d’applications MiniOS propose un catalogue de recettes d’applications sur [store.minios.dev](https://store.minios.dev). Dans l’environnement live MiniOS, ces recettes peuvent être installées directement sur le système en cours d’exécution ou utilisées pour construire un ou plusieurs modules SquashFS (`.sb`).

Cette page décrit le workflow logiciel live MiniOS. Une installation native conserve le bureau sélectionné et les applications classiques, mais supprime les logiciels spécifiques à MiniOS prévus pour un usage live. Utilisez plutôt le workflow classique de gestion de paquets Debian sur ce système installé.

La navigation dans le catalogue ne nécessite pas de serveur local. L’installation, en revanche, oui : l’interface web se connecte soit au service local de la Boutique d’applications MiniOS, soit ouvre le gestionnaire d’URI `minios-store://` installé.

## Avant l’installation

Ouvrez les détails d’une application et examinez les informations suivantes avant de l’ajouter au panier :

- Les noms des paquets et la méthode d’installation.
- Le script d’installation, s’il est affiché.
- La page d’accueil de l’application et les informations sur le développeur.
- Si la recette télécharge un paquet Debian séparé.

Les recettes peuvent installer des paquets APT, télécharger des paquets Debian ou exécuter des scripts shell. Les opérations d’installation s’exécutent avec les privilèges root. Considérez une recette et chaque téléchargement ou dépôt utilisé comme du code privilégié.

## Installer une application

1. Ouvrez la Boutique d’applications MiniOS depuis le menu des applications. Le lanceur vérifie `https://store.minios.dev` et l’ouvre dans le navigateur par défaut.
2. Recherchez ou parcourez par catégorie, ouvrez les détails de l’application et examinez les paquets ou le script.
3. Ajoutez une ou plusieurs applications au panier.
4. Lors d’une session live MiniOS, sélectionnez `Module` ou `System`.
5. Pour plusieurs applications en mode module, choisissez un module combiné ou des modules séparés. Un module combiné peut également recevoir un nom personnalisé.
6. Sélectionnez `Install` et suivez la progression ainsi que la sortie des commandes. La page utilise le démon local lorsque son statut est `Connected`; sinon, elle tente d’utiliser le gestionnaire d’URI et peut afficher une demande d’authentification PolicyKit.

Un seul lot d’installation par démon peut être lancé à la fois. Fermer la boîte de dialogue de progression n’arrête pas nécessairement l’installation par le démon ; rouvrez l’indicateur d’installation pour la consulter ou annulez-la explicitement.

## Modes module et système

### Mode module

Le mode module exécute `apt2sb` ou `script2sb` dans un environnement isolé de création de modules. Il enregistre les fichiers `.sb` générés dans le premier emplacement inscriptible parmi les suivants :

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Le premier chemin correspond au répertoire des modules sur le support de démarrage MiniOS actuel. Un module créé à cet emplacement n’est pas activé dans la session en cours par la Boutique d’applications MiniOS. Laissez le module dans ce dossier et redémarrez pour le charger au prochain démarrage. Le résultat reste disponible uniquement si le support de démarrage sous-jacent est inscriptible et conserve le fichier.

Le second chemin est utilisé en secours lorsque le dossier de modules habituel n’est pas inscriptible. Un module dans le dossier de secours ne sera pas automatiquement inclus au prochain démarrage live. Utilisez `Open folder`, puis copiez le module finalisé dans le dossier `minios/modules` sur un support de démarrage MiniOS inscriptible avant de redémarrer.

Un module combiné contient toutes les recettes sélectionnées. Avec un emballage séparé, une erreur peut n’affecter qu’une recette tandis que les modules déjà terminés dans le lot restent dans le dossier cible.

### Mode système

Le mode système utilise APT ou un script de recette directement sur le système de fichiers racine en cours d’exécution. Les modifications prennent effet dans le système live actuel plutôt que de produire un module. La persistance de ces modifications après un redémarrage dépend de la configuration de persistance de la session.

Le mode système n’est pas transactionnel. Une opération échouée ou annulée peut laisser des paquets, l’état du dépôt ou des fichiers modifiés par des commandes précédentes.

## Service local et frontière de confiance

Le service `minios-store` s’exécute en tant que root car la construction de modules et l’installation directe de paquets nécessitent des opérations de montage, overlay, chroot, APT et dpkg. Par défaut, il n’écoute que sur `ws://127.0.0.1:8765`. L’interface web hébergée envoie l’ensemble des données de recette, y compris les scripts et les URL de téléchargement, à ce service local.

Le démon valide la structure de la requête et la méthode d’installation prise en charge, mais il n’authentifie ni ne signe indépendamment le contenu de la recette. Une page pouvant accéder à l’endpoint WebSocket local peut demander des opérations d’installation privilégiées. Par conséquent :

- Gardez le démon lié à `127.0.0.1`. N’exposez pas le port `8765` sur le réseau local ou Internet.
- Ne définissez pas `MINIOS_STORE_HOST` sur une adresse non-loopback sauf si une frontière de sécurité supplémentaire et vérifiée est en place.
- Accédez à la Boutique d’applications MiniOS uniquement via son site officiel en HTTPS et examinez les recettes avant toute installation.
- Arrêtez ou désactivez le service lorsque l’installation via le navigateur n’est pas nécessaire.

Gérez le service systemd avec :

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Le gestionnaire d’URI suit une voie distincte. Il lance l’installateur GTK via PolicyKit et ne nécessite pas le démon WebSocket. Les entrées URI actuelles sont interprétées comme des noms de paquets APT avec un niveau de module et un paramètre de compression demandés. L’installateur démarre après autorisation, donc vérifiez la requête du navigateur avant d’accepter l’invite d’authentification.

## Annulation

Sélectionnez `Cancel` dans la boîte de dialogue de progression web ou `Cancel installation` dans l’installateur GTK. L’annulation marque le lot comme annulé et termine le processus enfant actuellement suivi. Les recettes restantes ne sont pas lancées.

L’annulation n’est pas un retour arrière. Les paquets ou modules terminés précédemment restent, et une commande interrompue pendant APT, dpkg, un script, un téléchargement ou la construction d’un module peut laisser un état partiel ou un fichier de sortie incomplet. Après annulation :

1. Lisez le journal d’installation final.
2. Vérifiez le répertoire de modules cible pour des fichiers inattendus ou de taille nulle.
3. Pour le mode système, exécutez `sudo dpkg --audit` et réparez la configuration des paquets si nécessaire.
4. Supprimez uniquement les éléments que vous avez identifiés comme appartenant à l’opération annulée.

## Dépannage

### La Boutique d’applications MiniOS est hors ligne

Vérifiez l’accès réseau à `https://store.minios.dev`. Un statut `Offline` signifie également que le navigateur n’est pas connecté au démon WebSocket local ; l’installation peut néanmoins se poursuivre via le gestionnaire d’URI si `minios-store-gui` est installé.

### Le navigateur ne peut pas se connecter au démon

Vérifiez le service et ses journaux :

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

L’endpoint normal est `ws://127.0.0.1:8765`. Un conflit de port, un service arrêté, l’absence de `python3-websockets` ou des restrictions du navigateur peuvent empêcher la connexion. Redémarrer le navigateur ne réactive pas un démon arrêté.

### L’authentification échoue ou aucune invite n’apparaît

L’installateur URI nécessite PolicyKit, `pkexec` et un agent d’authentification de bureau actif. Lancez l’installateur depuis une session graphique active et vérifiez que `minios-store-gui` est installé. N’essayez pas de contourner l’invite en exposant le démon root sur le réseau.

### La construction du module échoue

Développez le journal d’installation et utilisez la dernière erreur de commande plutôt que le simple résumé. Les causes courantes incluent des paquets indisponibles, des échecs de dépôt ou de DNS, un espace libre insuffisant, un outil de compression non pris en charge ou un répertoire de modules en lecture seule. Le démon signale lorsqu’il est passé sur `/var/lib/minios-store/modules`.

### L’application est absente après l’installation

En mode module, redémarrez après avoir confirmé que le fichier `.sb` se trouve dans le répertoire `minios/modules` du support de démarrage. Un fichier laissé dans le répertoire de secours n’est pas chargé automatiquement. En mode système sur une session live, vérifiez que la session est persistante si l’application a disparu après redémarrage.

### Une installation système annulée a laissé dpkg inachevé

Vérifiez l’état des paquets avant de réessayer :

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Examinez les modifications APT proposées avant de valider toute opération de réparation supplémentaire.

## Documentation associée

- [Créer des modules](/preparing-and-customizing/Managing-Modules#creating-modules)
- [Reconstruire l’ISO](/preparing-and-customizing/Creating-Custom-MiniOS-Images)
