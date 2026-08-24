# Mises à jour logicielles

MiniOS combine des modules d’image SquashFS en lecture seule avec une superposition d’exécution en écriture. La méthode de mise à jour doit correspondre à la couche modifiée. Mettre à jour les paquets au sein d’une session en cours n’est pas équivalent à remplacer les modules sur le support MiniOS.

## Mettre à jour les paquets avec APT

APT écrit sur la superposition d’exécution. Activez et utilisez une session persistante avant de procéder à la mise à jour si les modifications doivent être conservées après un redémarrage :

```bash
sudo apt update
sudo apt upgrade
```

Sans persistance, les modifications des paquets disparaissent à l’arrêt. Avec la persistance, les fichiers mis à jour et l’état d’APT restent dans cette session, mais les modules d’image `.sb` sous-jacents ne sont pas modifiés. Une nouvelle session utilise toujours les versions des paquets présentes dans l’image.

APT convient pour maintenir une seule installation persistante. Vérifiez d’abord l’espace disponible, car les fichiers mis à jour s’ajoutent aux modules de base compressés. Ne considérez pas une mise à niveau Debian sur place comme une mise à jour d’image MiniOS ; utilisez plutôt une image construite pour la version cible.

## Mettre à jour les logiciels avec des modules

Un module `.sb` est un logiciel en lecture seule chargé au démarrage. Les modules sont durables lorsqu’ils sont stockés dans le répertoire `modules/` de MiniOS ou dans une source de module de persistance durable. Ils ne nécessitent pas que les modifications des paquets soient enregistrées dans la session.

Examinez l’ensemble des modules prévus au prochain démarrage avant et après l’ajout d’un module :

```bash
sb next-boot
sudo sb next-boot add 50-example.sb
```

`sb next-boot add` valide et publie un nouveau module de façon atomique, mais il ne remplace pas un module existant portant le même nom. Supprimez d’abord un module utilisateur remplaçable lorsqu’une mise à jour conserve intentionnellement le même nom de base :

```bash
sudo sb next-boot remove 50-example.sb
sudo sb next-boot add 50-example.sb
```

Les modules de base et ceux présents sur des supports en lecture seule ne peuvent pas être supprimés avec cette commande. Construisez ou obtenez des modules mis à jour pour la même architecture, la même version de distribution et une pile de modules inférieure. Les modules avec un numéro plus élevé prennent le dessus sur les couches inférieures, ainsi un ancien module additionnel peut aussi remplacer des fichiers fournis par une image de base plus récente.

Pour les logiciels empaquetés localement, `apt2sb upgrade` peut créer un module de mise à jour. Consultez [Créer des modules](/development/Creating-Modules.md) pour plus de détails sur la construction de modules et la gestion des dépendances.

## Remplacer les modules d’image

Les mises à jour officielles d’image remplacent les fichiers sur le support MiniOS ; `apt upgrade` ne les met pas à jour. Il est préférable de remplacer l’ensemble complet des modules de base et les fichiers de démarrage correspondants issus d’une même version de MiniOS, ou de réinstaller à partir de la nouvelle image. N’associez pas les fichiers principaux, de bureau, d’application, de microprogramme ou de démarrage provenant de différentes versions, sauf si leur compatibilité est documentée.

Avant le remplacement :

1. Sauvegardez la configuration MiniOS, les données de persistance, les modules utilisateur et les modules de base actuels.
2. Notez les listes de modules actifs et prévus au prochain démarrage avec `sb list` et `sb next-boot`.
3. Effectuez le remplacement depuis un autre système ou depuis un démarrage chargé en RAM afin que les fichiers sources ne soient pas utilisés.
4. Conservez les fichiers précédents jusqu’à ce que la nouvelle image démarre et que le matériel et les applications nécessaires aient été testés.

Préservez les noms de base des modules et leur ordre lorsqu’une version demande un remplacement direct. Une source ultérieure portant le même nom de base remplace une source antérieure dans la sélection du prochain démarrage ; des copies portant des noms différents peuvent toutes deux être chargées et entraîner un ordre de couches inattendu.

## Mettre à jour le noyau

Le noyau est un ensemble coordonné : le module de pilote `01-kernel.sb`, l’image du noyau, l’initramfs et la configuration du chargeur d’amorçage doivent être cohérents. Utilisez le gestionnaire de noyau MiniOS ou la commande `minios-kernel` au lieu de mettre à jour uniquement un paquet `linux-image` avec APT.

Listez et empaquetez un noyau du dépôt, puis activez-le pour le prochain démarrage :

```bash
sudo minios-kernel list
sudo minios-kernel package --repo <linux-image-package> -o /tmp/kernel-output
sudo minios-kernel activate <kernel-version>
```

L’activation met à jour la configuration de démarrage de MiniOS. Redémarrez pour exécuter le noyau sélectionné, puis vérifiez-le avec `uname -r`. Conservez au moins un noyau fonctionnel connu et ses fichiers de démarrage jusqu’à ce que le matériel, le stockage, le réseau et les pilotes hors arbre aient été testés. Le module noyau standard de MiniOS peut inclure des pilotes supplémentaires absents du noyau du dépôt de la distribution.

Consultez [Gestion du noyau](/administration/Kernel-Management.md) pour le flux graphique, les options de commande et la procédure de récupération.

## Compatibilité et récupération

Sauvegardez la persistance avant de modifier l’image de base ou le noyau. Les fichiers de paquets persistants et leurs métadonnées peuvent remplacer un nouveau module de base ou décrire des versions de paquets qui ne correspondent plus. Testez une nouvelle image avec une session vierge d’abord, puis testez une copie de la session existante. Conservez l’image d’origine, les modules et la sauvegarde de session tant qu’un retour arrière reste nécessaire.

Après toute mise à jour, vérifiez les modules sélectionnés, démarrez une fois, puis contrôlez les applications et le matériel concernés. Si une nouvelle image de base entre en conflit avec d’anciens modules utilisateur ou la persistance, désactivez ces couches et réintroduisez-les une par une.
