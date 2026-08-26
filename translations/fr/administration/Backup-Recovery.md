---
updated: 2026-08-26
---

# Sauvegarde et restauration

Aucune sauvegarde unique ne protège chaque composant d’un système MiniOS. Les fichiers personnels, la configuration, les sessions persistantes, les modules et le périphérique de stockage nécessitent chacun des procédures de restauration différentes. Conservez plusieurs copies, gardez au moins une copie sur un autre appareil et testez la restauration avant d’en avoir réellement besoin.

## Adoptez une stratégie de sauvegarde en couches

Un jeu de sauvegardes efficace comprend les couches suivantes :

1. Sauvegardez fréquemment les fichiers personnels irremplaçables, indépendamment de la session MiniOS.
2. Notez la configuration et les modules choisis à chaque modification.
3. Exportez chaque session saine et arrêtée dans un mode pris en charge.
4. Conservez une copie hors ligne des données que le Gestionnaire de sessions ne peut pas exporter.
5. Créez occasionnellement une image complète du support après avoir arrêté la source et interrompu toute écriture.

Utilisez des destinations versionnées plutôt que d’écraser la dernière sauvegarde valide. Conservez un enregistrement de la version MiniOS, de l’édition, de l’architecture, de la date de sauvegarde, du mode de session et de l’état de chiffrement avec chaque sauvegarde. Une image complète du support constitue un filet de sécurité utile, mais ne doit jamais être la seule copie des fichiers personnels.

## Sauvegardez d’abord les données personnelles

Sauvegardez l’intégralité du répertoire personnel lorsque c’est possible, y compris les paramètres cachés des applications. Au minimum, incluez le travail stocké dans Bureau, Documents, Téléchargements, Musique, Images, Public, Modèles et Vidéos, ainsi que tout dossier de projet ou de données créé en dehors de ces emplacements standards.

Le support utilisateur de MiniOS peut lier ou monter les répertoires utilisateurs standards vers un emplacement séparé sur le support MiniOS inscriptible. Le chemin configuré par défaut est `/minios/userdata`, mais `LIVE_USER_DIRS_PATH` permet de choisir un autre chemin sécurisé. Les données à cet emplacement sont en dehors de la couche de session normale et doivent être sauvegardées séparément. Vérifiez les cibles réelles des liens ou des montages au lieu de supposer qu’exporter une session les inclut. Sauvegardez également les fichiers stockés volontairement sur d’autres volumes montés.

Fermez les applications qui écrivent des bases de données, des boîtes mail, des profils de navigateur ou des images de machines virtuelles avant de copier leurs données. Pour les données importantes, privilégiez une méthode de sauvegarde qui préserve la propriété, les permissions, les liens, les attributs étendus et les horodatages lorsque la destination le permet.

## Sauvegardez la configuration

Préservez la configuration qui contrôle les futurs démarrages, pas seulement les fichiers visibles dans le système de fichiers racine actuel. Les emplacements concernés peuvent inclure :

- `minios/config.conf` et `minios/config.conf.d/` sur un support MiniOS inscriptible.
- `/etc/live/config.conf` et `/etc/live/config.conf.d/` sur un système persistant ou natif.
- Les hooks, preseeds, modifications du menu de démarrage examinés, ainsi qu’une note des paramètres de démarrage personnalisés.
- La configuration utilisateur dans le répertoire personnel et la configuration système sélectionnée sous `/etc` pour une installation native.

La configuration peut contenir des empreintes de mots de passe, des identifiants réseau, des clés et des paramètres de service. Protégez la sauvegarde en conséquence. Ne stockez jamais de mots de passe en clair à côté d’une sauvegarde de session chiffrée. Voir [Renforcement de la sécurité](/administration/Security-Hardening.md) pour des conseils sur le chiffrement et la gestion des supports.

## Sauvegardez les modules

Sauvegardez les fichiers `.sb` personnalisés depuis le stockage durable des modules et consignez leur ordre, leur source, la version MiniOS et leur usage. Ne déduisez pas le prochain démarrage à partir de ce qui est visible dans le système de fichiers racine actuel :

- **En cours d’exécution** correspond à l’ensemble de modules composant le système live actuel.
- **Prochain démarrage** correspond à l’ensemble de modules sélectionné par les règles de démarrage actuelles.

Un module activé uniquement pour la session en cours peut ne pas être présent dans le stockage durable. Un module ajouté pour le prochain démarrage peut ne pas être actif actuellement. Examinez et consignez les deux vues avant la sauvegarde. Les filtres de démarrage comme `load`, `noload` et `bext` peuvent également modifier l’ensemble effectif du prochain démarrage. Voir [Gestionnaire de modules](/administration/Module-Manager.md).

## Exporter les sessions persistantes

Utilisez la [Gestion des sessions](/configuration/Session-Management.md) pour identifier la session En cours d’exécution et celle sélectionnée pour le prochain démarrage. Activer une session différente ne modifie que le prochain démarrage ; cela ne rend pas la session actuelle sûre à exporter. Redémarrez sur une autre session, ou démarrez sans persistance, avant de sauvegarder l’ancienne session en cours.

Le Gestionnaire de sessions peut exporter une session `native`, `dynfilefs`, `raw` ou `luks` non active sous forme d’archive `.tar.zst`. L’exportation est une sauvegarde logique des fichiers de la session, pas nécessairement une copie bit à bit de son conteneur de stockage. Conservez l’archive sur un autre appareil. L’importation crée une nouvelle session numérotée ; examinez-la et activez-la explicitement uniquement après validation.

Une exportation LUKS contient les données logiques de session déchiffrées, et non le conteneur `changes.luks` chiffré. Chiffrez la destination de sauvegarde ou l’archive par une méthode distincte et vérifiée si les données exportées doivent rester confidentielles. L’importation dans LUKS crée un nouveau conteneur chiffré et nécessite une nouvelle phrase secrète cible.

Ne copiez pas manuellement un répertoire de session monté. La session peut être en cours de modification, et un système de fichiers sur conteneur peut ne pas être représenté par un ensemble cohérent de fichiers tant qu’il est actif.

## Gérer les sessions SquashFS hors ligne

Avant de sauvegarder une session SquashFS en cours d’exécution, utilisez **Sauvegarder maintenant** et attendez la fin de la sauvegarde et de la validation. La sauvegarde reconstruit `changes.sb` et remplace de façon atomique l’instantané précédent ; elle ne conserve pas de génération de retour arrière. Arrêtez ensuite proprement.

L’implémentation actuelle du Gestionnaire de sessions refuse l’exportation et la copie de SquashFS. Après la sauvegarde, démarrez sans persistance ou utilisez un autre système Linux et copiez la session SquashFS depuis le magasin de sessions inactif. Préservez ensemble le répertoire complet de la session numérotée et les métadonnées du magasin de sessions. Ne remplacez ni ne renumérotez d’entrées dans un magasin `minios/changes` actif. Consultez [Récupération au démarrage](/administration/Boot-Recovery.md) avant toute modification de la structure de démarrage ou de disque lors d’une restauration.

## Préservez chaque segment DynFileFS

Une session DynFileFS est un conteneur logique réparti sur un ensemble complet de fichiers de support. Une copie hors ligne doit inclure `changes.dat` ainsi que chaque segment numéroté comme `changes.dat.0`, `changes.dat.1` et les segments suivants. Copier uniquement le premier fichier ne donne pas une sauvegarde exploitable. Ne créez pas de segment manquant et ne réparez pas l’unique copie.

L’exportation normale via le Gestionnaire de sessions évite ce problème au niveau du conteneur en exportant les fichiers logiques de la session. Pour les copies interrompues, segments manquants, supports pleins et réparations de système de fichiers, consultez [Récupération DynFileFS et dynblk](/configuration/DynFileFS-Recovery.md).

## Créer une image complète du support

[L’Utilitaire de disque](/installation/tools/Drive-Utility.md) permet d’utiliser **Créer une image** pour lire l’intégralité d’un périphérique dans une image brute, avec compression optionnelle. Cela capture la table de partitions, les fichiers de démarrage, les modules, la configuration, le magasin de sessions, les données utilisateur et les blocs inutilisés tels qu’ils existent sur le périphérique source. Le fichier image nécessite donc un espace de destination adapté et peut contenir des données supprimées récupérables et des secrets.

Créez l’image hors ligne. Arrêtez MiniOS et connectez le support source à un autre système en fonctionnement, ou démarrez depuis un autre appareil. Assurez-vous qu’aucune partition source n’est montée et qu’aucune persistance, swap, base de données ou service en arrière-plan n’écrit dessus. L’Utilitaire de disque masque normalement les périphériques montés, mais afficher un périphérique dans l’interface ne garantit pas la cohérence d’une image brute en direct.

Vérifiez la source par modèle, taille et nom de périphérique. Enregistrez l’image sur un autre support physique, jamais sur un système de fichiers du support source. Pour la restauration, **Écrire l’image** effectue une écriture brute sur le périphérique cible sélectionné. Vérifiez la cible avec la même attention ; toutes les données existantes sur la cible seront perdues. Utilisez une cible au moins aussi grande que la source d’origine, sauf si l’image a été préparée explicitement pour un périphérique plus petit.

## Sauvegarder les installations natives

Une installation native n’utilise pas une session persistante live comme système de fichiers racine, donc l’exportation via le Gestionnaire de sessions ne constitue pas une sauvegarde complète du système natif. Sauvegardez les répertoires personnels des utilisateurs, la configuration système sélectionnée, les données applicatives, les fichiers locaux et les identifiants de récupération à l’aide d’une méthode de sauvegarde compatible avec le système de fichiers. Notez la version MiniOS, la disposition des partitions, la sélection des paquets installés, le mode de démarrage et tout module ou noyau personnalisé.

Pour une restauration bare-metal, créez une image complète du disque hors ligne ou utilisez un produit de sauvegarde éprouvé prenant en charge les systèmes de fichiers et la disposition des partitions natifs. Conservez une sauvegarde au niveau des fichiers pour pouvoir restaurer des fichiers individuels sans écraser tout le disque. Voir [Récupération au démarrage](/administration/Boot-Recovery.md) pour le diagnostic des fichiers de démarrage et du bootloader.

## Valider les sauvegardes et tester les restaurations

Une copie terminée n’est pas encore une sauvegarde éprouvée. À chaque cycle de sauvegarde :

1. Vérifiez que la sauvegarde est sur un autre appareil et possède la date et la taille attendues.
2. Notez puis comparez une somme de contrôle cryptographique pour les archives et images disque.
3. Ouvrez un échantillon de fichiers personnels, dont au moins un gros fichier et un fichier de chaque jeu de données applicatif important.
4. Importez une archive de session comme nouvelle session inactive et inspectez ses fichiers. Testez le démarrage uniquement après avoir préservé la sélection de session connue comme valide.
5. Vérifiez qu’une copie hors ligne DynFileFS contient bien toute la séquence de segments.
6. Restaurez une image complète du support uniquement sur un appareil jetable ou de rechange de taille adéquate, puis testez le démarrage et l’accès aux données importantes.
7. Testez la restauration de fichiers natifs vers un emplacement séparé et vérifiez les permissions, la propriété, les liens et la lisibilité par les applications.

Effectuez des tests de restauration après tout changement de mode de persistance, de chiffrement, de partitionnement, de version MiniOS ou de logiciel de sauvegarde. Conservez la dernière sauvegarde validée jusqu’à ce que la suivante ait passé son test de restauration. Pour un diagnostic plus large, voir [Récupération au démarrage](/administration/Boot-Recovery.md), [Récupération DynFileFS et dynblk](/configuration/DynFileFS-Recovery.md) et [Renforcement de la sécurité](/administration/Security-Hardening.md).
