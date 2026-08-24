# MiniOS Store

MiniOS Store propose un catalogue de recettes d'applications sur [store.minios.dev](https://store.minios.dev). Sur MiniOS, ces recettes peuvent être installées directement dans le système en cours d'exécution ou utilisées pour créer un ou plusieurs modules SquashFS (`.sb`).

La navigation dans le catalogue ne nécessite pas de serveur local. L'installation, en revanche, en requiert un : l'interface web se connecte soit au démon MiniOS Store local, soit ouvre le gestionnaire d'URI `minios-store://` installé.

## Avant l'installation

Ouvrez les détails d'une application et examinez les informations suivantes avant de l'ajouter au panier :

- Les noms des paquets et la méthode d'installation.
- Le script d'installation, s'il est affiché.
- La page d'accueil de l'application et les informations sur le développeur.
- Si la recette télécharge un paquet Debian séparé.

Les recettes peuvent installer des paquets APT, télécharger des paquets Debian ou exécuter des scripts shell. Les opérations d'installation s'exécutent avec les privilèges root. Considérez une recette ainsi que chaque téléchargement ou dépôt utilisé comme du code privilégié.

## Installer une application

1. Ouvrez MiniOS Store depuis le menu des applications. Le lanceur vérifie `https://store.minios.dev` et l'ouvre dans le navigateur par défaut.
2. Recherchez ou parcourez par catégorie, ouvrez les détails de l'application et examinez les paquets ou le script.
3. Ajoutez une ou plusieurs applications au panier.
4. Lors d'une session live MiniOS, sélectionnez `Module` ou `System`. Un système MiniOS installé nativement utilise automatiquement le mode `System`.
5. Pour plusieurs applications en mode module, choisissez un module combiné ou des modules séparés. Un module combiné peut aussi recevoir un nom personnalisé.
6. Sélectionnez `Install` et suivez la progression et la sortie des commandes. La page utilise le démon local si son statut est `Connected`; sinon, elle tente d'utiliser le gestionnaire d'URI et peut afficher une demande d'authentification PolicyKit.

Un seul lot d'installation via le démon peut être exécuté à la fois. Fermer la boîte de dialogue de progression n'arrête pas nécessairement l'installation ; rouvrez l'indicateur d'installation pour la consulter ou annulez-la explicitement.

## Modes module et système

### Mode module

Le mode module exécute `apt2sb` ou `script2sb` dans un environnement isolé de construction de modules. Il écrit les fichiers résultants `.sb` dans le premier emplacement inscriptible parmi les suivants :

1. `/run/initramfs/memory/data/minios/modules`
2. `/var/lib/minios-store/modules`

Le premier chemin correspond au répertoire des modules sur le support de démarrage MiniOS actuel. Un module créé à cet endroit n'est pas activé dans la session en cours par MiniOS Store. Laissez le module dans ce répertoire et redémarrez pour le charger au prochain démarrage. Le résultat reste disponible uniquement si le support de démarrage sous-jacent est inscriptible et conserve le fichier.

Le second chemin est utilisé en secours lorsque le répertoire normal des modules n'est pas inscriptible. Un module dans le répertoire de secours ne fait pas automatiquement partie du prochain démarrage live. Utilisez `Open folder`, puis copiez le module finalisé dans le répertoire `minios/modules` sur un support de démarrage MiniOS inscriptible avant de redémarrer.

Un module combiné contient toutes les recettes sélectionnées. Avec un emballage séparé, une erreur peut affecter une recette tandis que les modules terminés plus tôt dans le lot restent dans le répertoire cible.

### Mode système

Le mode système utilise APT ou un script de recette directement sur le système de fichiers racine en cours d'exécution. Les modifications prennent effet sur le système actuel plutôt que de produire un module. Lors d'une session live, la persistance de ces modifications après un redémarrage dépend de la configuration de la session. Sur un système installé nativement, MiniOS Store utilise toujours le mode système.

Le mode système n'est pas transactionnel. Une opération échouée ou annulée peut laisser des paquets, l'état du dépôt ou des fichiers modifiés par des commandes précédentes.

## Service local et frontière de confiance

Le service `minios-store` s'exécute en tant que root car la construction de modules et l'installation directe de paquets nécessitent des opérations de montage, overlay, chroot, APT et dpkg. Par défaut, il écoute uniquement sur `ws://127.0.0.1:8765`. L'interface web hébergée envoie l'intégralité des données de recette, y compris les scripts et les URL de téléchargement, à ce service local.

Le démon valide la structure de la requête et la méthode d'installation prise en charge, mais n'authentifie ni ne signe indépendamment la charge utile de la recette. Une page pouvant atteindre l'endpoint WebSocket local peut demander des opérations d'installation privilégiées. Par conséquent :

- Gardez le démon lié à `127.0.0.1`. N'exposez pas le port `8765` sur un réseau local ou Internet.
- Ne définissez pas `MINIOS_STORE_HOST` sur une adresse autre que loopback sauf si une frontière de sécurité supplémentaire et vérifiée est en place.
- Utilisez le site officiel Store en HTTPS et inspectez les recettes avant installation.
- Arrêtez ou désactivez le service lorsque l'installation via le navigateur n'est pas nécessaire.

Gérez le service systemd avec :

```bash
sudo systemctl status minios-store
sudo systemctl start minios-store
sudo systemctl stop minios-store
sudo systemctl enable minios-store
sudo systemctl disable minios-store
```

Le gestionnaire d'URI est une voie distincte. Il lance l'installateur GTK via PolicyKit et ne nécessite pas le démon WebSocket. Les entrées URI actuelles sont interprétées comme des noms de paquets APT avec un niveau de module et un paramètre de compression demandés. L'installateur démarre après autorisation, donc vérifiez la requête du navigateur avant d'accepter la demande d'authentification.

## Annulation

Sélectionnez `Cancel` dans la boîte de dialogue de progression web ou `Cancel installation` dans l'installateur GTK. L'annulation marque le lot comme annulé et termine le processus enfant actuellement suivi. Les recettes restantes ne sont pas lancées.

L'annulation n'est pas un retour arrière. Les paquets ou modules finalisés précédemment restent présents, et une commande interrompue pendant APT, dpkg, un script, un téléchargement ou la construction d'un module peut laisser un état partiel ou un fichier de sortie incomplet. Après annulation :

1. Lisez le journal final d'installation.
2. Vérifiez le répertoire cible des modules pour tout fichier inattendu ou de taille nulle.
3. Pour le mode système, exécutez `sudo dpkg --audit` et réparez la configuration des paquets si nécessaire.
4. Ne supprimez que les éléments que vous avez identifiés comme appartenant à l'opération annulée.

## Dépannage

### Le Store est hors ligne

Vérifiez l'accès réseau à `https://store.minios.dev`. Un statut `Offline` signifie également que le navigateur n'est pas connecté au démon WebSocket local ; l'installation peut toutefois se poursuivre via le gestionnaire d'URI si `minios-store-gui` est installé.

### Le navigateur ne peut pas se connecter au démon

Vérifiez le service et ses journaux :

```bash
sudo systemctl status minios-store
sudo journalctl -u minios-store
```

L'endpoint normal est `ws://127.0.0.1:8765`. Un conflit de port, un service arrêté, l'absence de `python3-websockets` ou des restrictions du navigateur peuvent empêcher la connexion. Redémarrer le navigateur ne répare pas un démon arrêté.

### L'authentification échoue ou aucune invite n'apparaît

L'installateur URI nécessite PolicyKit, `pkexec` et un agent d'authentification de bureau actif. Lancez l'installateur depuis une session graphique active et vérifiez que `minios-store-gui` est installé. N'évitez pas l'invite en exposant le démon root sur le réseau.

### La construction du module échoue

Développez le journal d'installation et utilisez l'erreur de la dernière commande plutôt que le simple résumé. Les causes courantes incluent des paquets indisponibles, des échecs de dépôt ou DNS, un espace libre insuffisant, un outil de compression non pris en charge et un répertoire de modules en lecture seule. Le démon signale lorsqu'il est passé à `/var/lib/minios-store/modules`.

### L'application est absente après l'installation

Pour le mode module, redémarrez après avoir confirmé que le fichier `.sb` se trouve dans le répertoire `minios/modules` du support de démarrage. Un fichier laissé dans le répertoire de secours n'est pas chargé automatiquement. Pour le mode système en session live, vérifiez que la session est persistante si l'application a disparu après le redémarrage.

### Une installation système annulée a laissé dpkg inachevé

Inspectez l'état des paquets avant de réessayer :

```bash
sudo dpkg --audit
sudo dpkg --configure -a
sudo apt-get -f install
```

Examinez les modifications APT proposées avant de confirmer toute opération de réparation supplémentaire.

## Documentation associée

- [Créer des modules](/development/Creating-Modules.md)
- [Reconstruire l'ISO](/development/Rebuilding-ISO.md)
