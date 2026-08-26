# Modes de démarrage MiniOS

Les modes de démarrage décrivent l’origine du système live, si sa couche inscriptible est temporaire ou persistante, et si MiniOS copie sa source en RAM. Ils ne définissent pas un firmware ou un protocole de bootloader différent. GRUB, Syslinux, Ventoy ou un chargeur PXE lancent tous le même pipeline MiniOS en espace utilisateur initial, en chargeant un noyau et un initramfs avec une ligne de commande du noyau.

Utilisez cette page pour choisir un mode et comprendre les dépendances qui en résultent. Pour les options individuelles de la ligne de commande, consultez [Paramètres de démarrage](/configuration/Boot-Parameters.md). Pour les entrées fournies par une image, voir [Menus de démarrage](/configuration/Boot-Menus.md).

## Firmware, bootloader et early userspace

Le firmware et le bootloader s’exécutent avant que MiniOS puisse inspecter les modules live ou les sessions. Le BIOS ou l’UEFI lance un bootloader local, ou un firmware réseau démarre un chargeur PXE. Ce chargeur choisit et charge le noyau MiniOS et l’initramfs, puis transmet leur ligne de commande. Ventoy fait également partie de cette couche : il présente une image ISO via son propre environnement de démarrage avant que l’espace utilisateur initial de MiniOS ne la découvre.

Le noyau lance ensuite l’initramfs MiniOS. Cet early userspace découvre la source live, prépare les copies optionnelles en RAM et la persistance, monte les modules et construit le système de fichiers racine. Un libellé de menu tel que Fresh Start ou Resume Previous Session correspond donc principalement à un choix pratique de paramètres d’initramfs, et non à une implémentation distincte de bootloader.

Les installations natives sont différentes. Elles démarrent sur une racine Linux classique déployée, avec le GRUB et l’initramfs du système installé. Elles n’utilisent pas le pipeline live modulaire décrit ci-dessous.

## Séquence de démarrage live

Le pipeline live s’exécute dans cet ordre :

1. **Charger le noyau et l’initramfs.** Le bootloader choisi par le firmware charge les deux fichiers et fournit la ligne de commande du noyau. À ce stade, aucune racine SquashFS MiniOS n’a été assemblée.
2. **Découvrir la source.** L’initramfs recherche les périphériques de stockage locaux, suit un emplacement `from=` explicite, monte en boucle une ISO locale, monte une ISO HTTP ou télécharge l’ensemble de données PXE. La découverte de la source et celle de la persistance sont liées mais distinctes.
3. **Copier en RAM sur demande.** Les options `toram` et `toram=full` effectuent la copie complète de l’arborescence de données MiniOS, selon la gestion de la persistance. `toram=trim` copie uniquement les modules sélectionnés et la configuration requise. L’initramfs tente alors de détacher la source d’origine. Une copie réussie ne garantit pas que le détachement a abouti.
4. **Sélectionner la persistance.** Si la persistance est demandée, l’initramfs identifie l’emplacement et la session de persistance, les vérifie et prépare la couche inscriptible. Les modes reprise, nouveau et sélection interactive diffèrent uniquement dans la façon dont la session est choisie ou créée. Sans demande de persistance, la couche inscriptible est en mémoire (RAM).
5. **Rapprocher l’ensemble de noyaux en cours d’exécution.** Le noyau est déjà lancé et ne peut plus être modifié à ce stade. MiniOS vérifie que l’arborescence de données active contient le module `01-kernel`, l’image du noyau et l’initramfs correspondant au noyau en cours. Si l’ensemble complet correspondant existe dans le dépôt de noyaux inactifs, MiniOS tente de l’activer et déplace les autres ensembles actifs dans le dépôt. Il s’agit d’un rapprochement de fichiers, pas d’un fallback ou d’un échange de noyau en place.
6. **Monter les modules.** Les fichiers `.sb` sélectionnés depuis l’arborescence de données MiniOS et tout magasin de modules inscriptibles applicable sont triés, filtrés par `load=` et `noload=`, puis montés en lecture seule via loop.
7. **Construire AUFS ou OverlayFS.** MiniOS combine les modules montés avec une couche inscriptible. AUFS ajoute les montages de modules ordonnés comme branches en lecture seule. OverlayFS reçoit la liste complète et ordonnée des répertoires inférieurs, plus ses répertoires upper et work lors du montage de la racine. L’union résultante forme le système de fichiers racine live.
8. **Appliquer `rootcopy` et exécuter `minios-boot`.** Les fichiers du répertoire source `rootcopy/` sont copiés dans la racine assemblée. L’initramfs exécute ensuite `minios-boot` dans un chroot pour synchroniser la configuration MiniOS et appliquer les réglages précoces de l’espace utilisateur. Il prépare aussi `fstab` et lance éventuellement un hook `rootcopy/run/preinit.sh` avant la passation.
9. **Passation à l’espace utilisateur normal.** LiveKit utilise `pivot_root` pour sa passation finale, tandis que dracut prépare la même racine assemblée et effectue la `switch_root` finale. Le système d’initialisation installé lance alors les services normaux et la session bureau ou console. Les paramètres réseau précoces ne constituent pas une configuration réseau durable de l’espace utilisateur.

Les contrats détaillés de découverte, de modules et de persistance sont documentés dans [Découverte système Initrd](/configuration/Initrd-System-Discovery.md), [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md) et [Persistance Initrd](/configuration/Initrd-Persistence.md).

## Matrice des modes

| Mode | Source live | Couche inscriptible | Dépendance à la source après démarrage |
|------|-------------|---------------------|----------------------------------------|
| Fresh local | Arborescence `minios/` locale ou ISO locale | RAM temporaire | Reste présente sauf si une copie `toram` non persistante demandée a été détachée avec succès. |
| Persistent resume | Stockage de persistance local ou explicitement sélectionné | Session compatible existante si disponible | La source et le stockage de persistance restent normalement utilisés. La reprise ne garantit pas la récupération de chaque session manquante ou endommagée. |
| Persistent new | Stockage de persistance inscriptible | Nouvelle session numérotée allouée | La source et le stockage de persistance restent utilisés. La création nécessite un stockage inscriptible compatible et suffisamment d’espace. |
| Persistent choose | Choix interactif de l’emplacement et de la session de persistance | Session sélectionnée ou nouvellement créée | Dépend de la source et du stockage de persistance choisis. La sélection ne rend pas une session incompatible sûre. |
| Bare ou full `toram` | Toute source live détectable | RAM temporaire sauf si la persistance est aussi demandée | Bare `toram` signifie `toram=full`. Le support est retirable uniquement après un détachement non persistant réussi de la source. |
| Trim `toram` | Toute source live détectable | RAM temporaire sauf si la persistance est aussi demandée | Copie uniquement l’ensemble filtré de modules et les données requises. La même condition de détachement s’applique. |
| ISO locale ou Ventoy | ISO montée en boucle ou ISO présentée par Ventoy | RAM temporaire ou session sélectionnée séparément | L’ISO et les mappages sous-jacents restent nécessaires sauf si `toram` non persistant les détache avec succès. |
| HTTP ISO | ISO montée via `httpfs2` sur HTTP | RAM temporaire ou session sélectionnée séparément | Le chemin de récupération et le réseau restent nécessaires tant que la racine repose sur httpfs ; `toram` ne peut supprimer cette dépendance qu’en cas de détachement réussi. |
| PXE | Noyau et initramfs depuis le chargeur, données MiniOS téléchargées par l’initramfs | RAM temporaire ou session sélectionnée séparément | Le réseau précoce sert au chargement des données, pas à la politique réseau de session. Les dépendances exactes dépendent de ce qui a été téléchargé et monté. |
| Installation native | Racine installée déployée, pas de modules live `.sb` | Systèmes de fichiers installés normaux | N’utilise pas la découverte live, les sessions live, `toram`, l’assemblage d’union de modules, ni ce pipeline de passation live. |

## Combinaisons et limites

Les choix de source, de persistance et de copie en RAM sont des axes indépendants. Un répertoire local, une ISO locale, une ISO HTTP ou une source de données PXE peuvent fournir des modules live. La persistance peut ensuite être omise, reprise, créée ou sélectionnée si prise en charge. `toram=full` ou `toram=trim` peuvent être demandés avec une source live compatible.

La persistance et `toram` peuvent être combinées, mais ce n’est pas le même contrat qu’une opération persistante classique. MiniOS copie les données de session demandées dans l’arborescence RAM avant la configuration de la persistance. N’assumez pas que les écritures ultérieures seront sauvegardées sur le support d’origine, et ne retirez pas ce support sur la seule base de l’option `toram`. La limite de retrait des supports est plus stricte : le retrait n’est sûr qu’après que MiniOS a détaché avec succès une copie **non persistante** en RAM de la source d’origine. Si le détachement échoue, la source reste montée. Pour Ventoy, MiniOS libère ses mappages uniquement après ce détachement non persistant réussi ; le nettoyage des mappages est fait au mieux.

`toram=trim` respecte les filtres de sélection de modules, donc un module exclu n’est pas disponible simplement parce que le support d’origine existe encore. Le mode full `toram` nécessite suffisamment de RAM pour les données copiées, tandis que le mode trim requiert assez de RAM pour l’ensemble sélectionné et la charge inscriptible. Aucun mode ne garantit qu’une machine sous-dimensionnée démarrera sans problème.

L’ISO HTTP et le réseau PXE relèvent de l’initramfs. Un `from=http://...` explicite est prioritaire et peut utiliser `ip=` pour l’adressage statique précoce. Sans cette source ISO HTTP, un `ip=` non vide sélectionne le chemin de données PXE et ignore la découverte des médias locaux. Ce n’est pas une adresse statique pour le bureau en cours d’exécution. L’ISO HTTP prend en charge `http://`, pas `https://`. Si une racine HTTP n’a pas été détachée en RAM, une reconfiguration réseau ultérieure peut interrompre sa source. Consultez [Démarrage réseau](/installation/Network-Boot.md) avant de combiner le chargement réseau et les modifications réseau en espace utilisateur.

La persistance nécessite une cible inscriptible et un mode adaptés. Un support en lecture seule ne peut pas héberger une nouvelle session, la persistance chiffrée ne devient pas déchiffrée si l’activation échoue, et l’acceptation interactive ne supprime pas les risques d’incompatibilité de session. Consultez [Gestion des sessions](/configuration/Session-Management.md) pour les modes de stockage, la compatibilité et les règles de récupération.

## Guide de décision

| Objectif | Commencer avec | Vérifier avant de s’y fier |
|----------|---------------|----------------------------|
| Tester MiniOS sans conserver les modifications | Fresh local | Les sessions existantes ne sont pas sélectionnées ; le support source reste utilisé normalement. |
| Continuer le travail habituel | Persistent resume | La cible de persistance est inscriptible et la session est compatible. |
| Conserver une ancienne session et démarrer proprement | Persistent new | Il y a suffisamment d’espace et le système de fichiers prend en charge le mode de persistance choisi. |
| Choisir parmi plusieurs espaces de travail | Persistent choose | Vous pouvez identifier le périphérique et la session souhaités ; vérifiez les avertissements de compatibilité. |
| Retirer le support de démarrage local après le démarrage | `toram` ou `toram=trim` non persistants | Attendez la confirmation du détachement de la source. Ne déduisez pas le succès à partir du libellé du menu. |
| Réduire l’utilisation de la RAM lors de la copie en RAM | `toram=trim` | Le résultat `load=` et `noload=` contient tous les modules nécessaires au système. |
| Démarrer une ISO stockée sur un disque local ou un périphérique Ventoy | Découverte ISO locale | Gardez le système de fichiers hôte et les mappages disponibles sauf si le détachement est confirmé. |
| Charger une ISO depuis un serveur web | HTTP ISO | Réseau filaire pour l’initramfs, disponibilité HTTP simple et accès continu à la source. |
| Charger les données MiniOS depuis l’infrastructure de déploiement | PXE | Syntaxe `ip=` MiniOS correcte et interface filaire prise en charge ; ne le considérez pas comme une configuration réseau en espace utilisateur. |
| Exécuter MiniOS comme un système installé classique | Installation native | Suivez la documentation d’installation native et de récupération, pas les procédures de session live ou `toram`. |

En cas d’échec du démarrage avant l’assemblage de la racine live, identifiez d’abord si la panne concerne le firmware/bootloader, la découverte de la source, la persistance, le montage des modules ou la construction de la racine. Évitez les commandes de réparation tant que la structure du stockage n’est pas connue. Voir [Récupération du démarrage](/administration/Boot-Recovery.md).

## Documentation associée

- [Découverte système Initrd](/configuration/Initrd-System-Discovery.md)
- [Chargement des modules Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistance Initrd](/configuration/Initrd-Persistence.md)
- [Paramètres de démarrage](/configuration/Boot-Parameters.md)
- [Menus de démarrage](/configuration/Boot-Menus.md)
- [Démarrage réseau](/installation/Network-Boot.md)
- [Gestion des sessions](/configuration/Session-Management.md)
- [Architecture du système](/about/System-Architecture.md)
- [Récupération du démarrage](/administration/Boot-Recovery.md)
