# Démarrage réseau

Cette page explique **comment charger MiniOS via le réseau** : PXE (kernel + initrd + données MiniOS) et ISO HTTP (`from=http://…`). C’est le seul objectif du réseau dans l’initramfs de MiniOS.

Il ne s’agit **pas** de :

- Configurer NetworkManager ou une IP statique persistante après le démarrage du système
- Wi‑Fi dans l’initrd
- [live-config](/configuration/live-config.md) (espace utilisateur tardif)

La connectivité réseau de session après le démarrage est indépendante. Pour une IP statique filaire durable, utilisez l’étape Réseau de l’installateur, NetworkManager ou ifupdown—pas le paramètre PXE `ip=`.

À lire également : [Paramètres de démarrage](/configuration/Boot-Parameters.md) (`ip`, `from`, `cache`).

## Vue d’ensemble

| Mode | Ce que vous démarrez | Comment les données MiniOS sont obtenues |
|------|---------------------|------------------------------------------|
| **PXE** | Kernel + initrd depuis un serveur de démarrage réseau | `ip=` non vide → l’initrd télécharge les fichiers MiniOS depuis le serveur de données PXE (HTTP préféré, TFTP en secours) |
| **HTTP ISO** | Kernel + initrd depuis un support local **ou** PXE | `from=http://…/minios.iso` → l’initrd active le réseau et monte l’ISO avec `httpfs2` |
| **Support local** | USB / ISO / disque | Pas de réseau dans l’initrd ; recherche locale uniquement |

Constructeurs d’initramfs : **LiveKit** (`livekit-mos`) ou **dracut** (`dracut-mos`). Les deux utilisent les mêmes utilitaires réseau LiveKit pour la récupération anticipée.

```text
find_data()
  ├─ from=http://…     → configure network → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

**Important :** tout `ip=` non vide sélectionne le **chemin de données PXE** et **ignore les supports locaux**. N’ajoutez pas `ip=` lors d’un démarrage USB/ISO classique juste pour “définir une adresse statique”.

## Prérequis

| Prérequis | Remarques |
|-----------|-----------|
| Ethernet filaire (ou virtio/vmxnet en VM) | La première interface utilisable non loopback est utilisée ; pas de sélection `BOOTIF` / `ethdevice` dans l’initrd |
| Initrd avec modules réseau | Construit pour les variantes de paquets non **minimum** (`--network`, souvent `--cloud`) |
| Pas de dépendance au Wi‑Fi | Le sans-fil n’est pas pris en charge dans le chemin de démarrage réseau |
| Privilégier les cartes sans firmware propriétaire | Les cartes nécessitant un firmware échouent souvent dans l’initrd |
| Privilégier les images **standard+** | **minimum** omet les modules NIC réseau → PXE / HTTP ISO effectivement non pris en charge |
| HTTP uniquement pour l’URL ISO | `from=http://…` fonctionne ; **`https://` n’est pas pris en charge** |

Outils dans l’initrd : busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` et `@mount.httpfs2`. Il n’y a pas de NetworkManager dans l’initrd.

## Démarrage PXE

### Déroulement

1. Le firmware / serveur PXE charge le **kernel** et l’**initrd** MiniOS (pxelinux, iPXE, etc.—en dehors de MiniOS).
2. La ligne de commande du kernel inclut un **`ip=`** non vide (et normalement `boot=live` pour un démarrage complet de MiniOS).
3. L’initrd configure une adresse statique à partir de `ip=`, contacte le **serveur** indiqué, télécharge la liste des fichiers puis les bundles/fichiers MiniOS.
4. Le système poursuit vers le root live comme d’habitude.

### Paramètre `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Champ | Rôle |
|-------|------|
| client-ip | Adresse assignée avec busybox `ifconfig` |
| server-ip | Hôte pour les données MiniOS en HTTP/TFTP ; aussi écrit comme serveur DNS dans l’initrd |
| gateway-ip | Route par défaut ; aussi écrit comme serveur DNS |
| netmask | Masque de sous-réseau IPv4 en notation pointée (pas de préfixe CIDR) |
| port | Port HTTP optionnel pour la liste et les fichiers (par défaut **7529**) |

Exemples :

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Comment les fichiers sont récupérés

1. **HTTP** (préféré) :  
   `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>`  
   puis chaque chemin listé dans ce fichier depuis le même hôte/port.
2. **TFTP** (secours si HTTP échoue) : busybox `tftp` pour `PXEFILELIST` et les fichiers listés.

Le port par défaut est **7529** si le cinquième champ est omis.

### Ce que `ip=` n’est pas

| Attendu | Réalité |
|---------|---------|
| Formes kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Non pris en charge** — interprété à tort comme une adresse client |
| IP statique pour toute la session live | **Non pris en charge** — après le démarrage, NetworkManager (ou équivalent) gère l’interface |
| IP statique lors du démarrage USB/ISO | **À ne pas utiliser** — force le téléchargement des données PXE |
| Liste DNS dédiée | Seuls la passerelle et le serveur sont utilisés comme serveurs DNS dans l’initrd |

## Démarrage HTTP ISO (`from=http://…`)

Charger les données MiniOS depuis une ISO distante sans liste de fichiers PXE complète :

```text
from=http://192.168.1.1/path/minios.iso
```

Comportement :

1. L’initrd active le réseau :
   - Si **`ip=`** est défini → configuration statique comme ci-dessus
   - Si **`ip=`** est omis → **DHCP** via busybox `udhcpc`
2. Monte l’ISO distante avec **`httpfs2`**
3. Continue la recherche du contenu MiniOS sur ce montage

L’option **`cache=`** (en mégaoctets) active un cache de téléchargement httpfs, par exemple `cache=512`.

Seul **`http://`** est accepté pour ce chemin ISO distant. **`https://` n’est pas pris en charge.**

## Après le démarrage du système live

| Élément | Après switch_root |
|---------|-------------------|
| IP/routes du kernel sur la carte réseau | Peuvent rester jusqu’à reconfiguration de l’interface par l’espace utilisateur |
| DNS de l’initrd (`resolv.conf`) | Politique de session non persistante |
| Réseau de session | Typiquement **NetworkManager** sur les images MiniOS par défaut |
| Signification de `ip=` | Récupération initiale uniquement — pas de profil statique mémorisé |

Si le root est toujours alimenté par **httpfs**, la reconfiguration de la carte réseau par NetworkManager peut perturber le root live. Prévoyez vos déploiements network-boot en conséquence (ex. : copie en RAM / éviter de perturber l’interface de récupération si possible).

L’espace utilisateur tardif **live-config** peut brièvement activer le réseau uniquement pour télécharger des hooks/preseeds distants (`Setup_network`). Cela n’a aucun lien avec l’adressage durable PXE/`ip=`.

## Erreurs courantes

1. Mettre `ip=` sur la ligne de commande USB/ISO “pour une IP statique” → le système tente un téléchargement PXE au lieu du support local.
2. Utiliser `ip=dhcp` ou une autre syntaxe `ip=` du kernel → mauvais analyseur, configuration d’adresse incorrecte.
3. Attendre du Wi‑Fi ou une sélection multi-NIC `BOOTIF` dans l’initrd → non implémenté.
4. Utiliser une image **minimum** pour PXE/HTTP ISO → modules réseau absents de l’initrd.
5. Servir l’ISO uniquement en HTTPS → `from=http://…` ne fonctionnera pas.
6. Confondre ceci avec la configuration statique de l’installateur/NetworkManager après connexion.

## Résumé de fiabilité

| Scénario | Évaluation |
|----------|------------|
| PXE + `ip=…` + liste HTTP sur :7529 (ou TFTP), filaire simple / virtio | Cible prise en charge |
| `from=http://…iso` + DHCP (ou `ip=`), même type de carte | Fonctionne généralement |
| Démarrage USB/ISO normal | Réseau de l’initrd non utilisé |
| Session statique via `ip=` | Non pris en charge |
| Multi-NIC / carte avec firmware / Wi‑Fi / `https://` / édition minimum | Faible ou non pris en charge |

## Référence d’implémentation

| Élément | Emplacement dans l’arborescence MiniOS |
|---------|-----------------------------------------|
| Entrée init | `linux-live/initramfs/livekit-mos/init` |
| Réseau + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Constructeur LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Module dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Quand `-n` est passé | `linux-live/build-initramfs` (non-minimum) |

## Voir aussi

- [Paramètres de démarrage](/configuration/Boot-Parameters.md) — tableau complet des paramètres (`ip`, `from`, `cache`, …)
- [live-config](/configuration/live-config.md) — configuration de l’espace utilisateur tardif (pas de démarrage réseau)
- [Architecture du système](/about/System-Architecture.md)
- [Construire MiniOS](/development/Building-MiniOS.md) — constructeur d’initramfs (`livekit` / `dracut`)
