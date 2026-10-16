---
updated: 2026-08-26
---

# Démarrage réseau

Cette page décrit **comment charger MiniOS via le réseau** : PXE (noyau + initrd + données MiniOS) et ISO HTTP (`from=http://…`). C’est le seul rôle du réseau dans l’initramfs MiniOS.

Ce n’est **pas** le sujet :

- Configurer NetworkManager ou une adresse IP statique permanente une fois le système démarré
- Le Wi-Fi dans l’initrd
- [live-config](/reference/configuration/live-config) (espace utilisateur tardif)

Le réseau de session après le démarrage est distinct. Pour une adresse IP statique filaire persistante, utilisez l’étape Réseau de l’installateur, NetworkManager ou ifupdown — pas le paramètre PXE`ip=` paramètre.

À lire aussi : [Paramètres de démarrage](/reference/Boot-Parameters) (`ip`, `from`, `cache`).

## Vue d’ensemble

| Mode | Éléments démarrés | Méthode d’obtention des données MiniOS |
|------|----------------|-----------------------------|
| **PXE** | Noyau + initrd depuis un serveur de démarrage réseau | Valeur non vide de `ip=` sans `from=http://…` → l’initrd télécharge les fichiers MiniOS depuis le serveur de données PXE |
| **ISO HTTP** | Noyau + initrd depuis un support local **ou** PXE | `from=http://…/minios.iso` → l’initrd active le réseau et monte l’ISO avec `httpfs2` |
| **Support local** | USB / ISO / disque | Pas de réseau dans l’initrd ; recherche locale uniquement |

Générateurs d’initramfs : **LiveKit** (`livekit-mos`) ou **dracut** (`dracut-mos`). Tous deux utilisent les mêmes outils réseau LiveKit pour le téléchargement précoce.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` a priorité sur `ip=`. Dans ce mode, `ip=` fournit l’adressage statique pour la connexion à l’ISO HTTP. Sinon, toute valeur non vide de `ip=` sélectionne le chemin des données **PXE** et ignore le support local. N’ajoutez pas `ip=` à un démarrage normal depuis USB/ISO dans le seul but de « définir une adresse statique ». Aucun des deux chemins réseau ne bascule sur le support local en cas d’échec de la découverte ou du téléchargement.

## Prérequis

| Prérequis | Remarques |
|-------------|--------|
| Ethernet filaire (ou virtio/vmxnet dans les VM) | La première interface détectée autre que loopback est utilisée ; l’état du lien et la connectivité ne sont pas vérifiés, et il n’y a pas de sélection `BOOTIF` / `ethdevice` dans l’initrd |
| Initrd avec modules réseau | Conçu pour les variantes de paquets autres que la valeur interne `minimum` (`--network`, souvent `--cloud`) |
| Aucune dépendance au Wi-Fi | Le sans-fil n’est pas pris en charge pour le démarrage réseau |
| Privilégiez les cartes réseau sans blobs de firmware | Les cartes nécessitant un firmware échouent souvent dans l’initrd |
| Privilégiez les images **Standard** ou supérieures | L’édition **Flux** n’inclut pas les modules de cartes réseau ; PXE / ISO HTTP ne sont donc pas pris en charge en pratique |
| HTTP uniquement pour l’URL de l’ISO | `from=http://…` fonctionne ; **`https://` n’est pas pris en charge** |

Outils dans l’initrd : busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp`, et `@mount.httpfs2`. NetworkManager n’est pas présent dans l’initrd.

## Démarrage PXE

### Flux

1. Le firmware / serveur PXE charge le MiniOS **noyau** et **initrd** (pxelinux, iPXE, etc., en dehors de MiniOS lui-même).
2. La ligne de commande du noyau comprend un paramètre non vide **`ip=`** (et normalement `boot=live` pour un démarrage MiniOS complet).
3. L’initrd configure une adresse statique à partir de `ip=`, contacte le **serveur**, télécharge une liste de fichiers, puis MiniOS les bundles/fichiers.
4. Le système poursuit normalement son démarrage dans le système de fichiers racine live.

### Paramètre `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Champ | Rôle |
|-------|------|
| client-ip | Adresse attribuée avec busybox `ifconfig` |
| server-ip | Hôte des données HTTP/TFTP MiniOS ; également défini comme serveur DNS dans l’initrd |
| gateway-ip | Route par défaut ; également défini comme serveur DNS |
| netmask | Masque de sous-réseau IPv4 au format décimal pointé (et non en longueur de préfixe CIDR) |
| port | Port HTTP facultatif pour la liste de fichiers et les fichiers (par défaut **7529**) |

Exemples :

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Récupération des fichiers

1. **HTTP** (recommandé) : `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>` puis chaque chemin indiqué dans ce fichier, depuis le même hôte/port.
2. **TFTP** : busybox `tftp` n’est utilisé que si la requête HTTP initiale pour `PXEFILELIST` échoue. L’échec du téléchargement d’un fichier ultérieur via HTTP ne déclenche pas le basculement vers TFTP.

Le port par défaut est **7529** lorsque le cinquième champ est omis.

### Ce que `ip=` ne fait pas

| Attente | Réalité |
|-------------|---------|
| Formats du noyau / de dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Non pris en charge** — interprété à tort comme une adresse client |
| Adresse IP statique pour toute la session live | **Non pris en charge** — après le démarrage, NetworkManager (ou un équivalent) gère l’interface |
| Adresse IP statique pendant le chargement des données MiniOS depuis une clé USB/un ISO | **À ne pas utiliser** — sans `from=http://…`, le téléchargement des données PXE est forcé |
| Liste DNS dédiée | Seules les adresses de la passerelle et du serveur sont utilisées comme serveurs DNS dans l’initrd |

## Démarrage HTTP ISO (`from=http://…`)

Charger les données MiniOS depuis une ISO distante sans liste complète de fichiers PXE :

```text
from=http://192.168.1.1/path/minios.iso
```

Comportement :

1. L’initrd active le réseau :
   - Si **`ip=`** est défini → configuration statique comme ci-dessus
   - Si **`ip=`** est omis → **DHCP** via busybox `udhcpc`
2. Monte l’ISO distante avec **`httpfs2`**
3. Continue à rechercher le contenu MiniOS sur ce point de montage

La **`cache=`** (en mégaoctets) active un cache de téléchargement httpfs, par exemple `cache=512`.

Seul **`http://`** est accepté pour ce démarrage depuis une ISO distante. **`https://` n’est pas pris en charge.**

## Après le démarrage du système live

| Élément | Après switch\_root |
|------|-------------------|
| Adresses IP et routes du noyau sur la carte réseau | Peuvent rester en place jusqu’à ce que l’espace utilisateur reconfigure l’interface |
| DNS de l’initrd (`resolv.conf`) | Ne constitue pas une configuration réseau persistante pour la session |
| Réseau de la session | En général, **NetworkManager** sur les images MiniOS par défaut |
| Signification de `ip=` | Utilisé uniquement pour le téléchargement initial — ne correspond pas à un profil statique mémorisé |

Si la racine est toujours alimentée par **httpfs**, la reconfiguration de la carte réseau par NetworkManager peut perturber le système racine en cours d’exécution. Tenez-en compte lors de la planification des déploiements par démarrage réseau (par exemple, copiez vers RAM / évitez si possible de modifier l’interface utilisée pour le téléchargement).

L’espace utilisateur peut lancer tardivement **live-config** pour activer brièvement le réseau et télécharger des hooks ou des fichiers preseed distants (`Setup_network`). Cela n’a aucun rapport avec l’adressage persistant PXE/`ip=`.

## Erreurs fréquentes

1. Ajouter `ip=` à la ligne de commande d’une clé USB/d’une ISO « pour définir une IP statique » → le système tente un téléchargement PXE au lieu d’utiliser le média local, à moins que `from=http://…` n’ait sélectionné au préalable le démarrage HTTP ISO.
2. Utiliser `ip=dhcp` ou une autre syntaxe de `ip=` noyau → analyseur incorrect, configuration d’adresse défaillante.
3. S’attendre à pouvoir sélectionner le Wi-Fi ou une carte réseau parmi plusieurs dans l’`BOOTIF`initrd → fonctionnalité non implémentée.
4. Utiliser une image **Flux** pour PXE/HTTP ISO → modules réseau absents de l’initrd.
5. Héberger l’ISO uniquement en HTTPS → `from=http://…` ne correspondra pas.
6. Confondre cette configuration avec la configuration statique du réseau de l’installateur ou de NetworkManager après la connexion.

## Résumé de fiabilité

| Scénario | Évaluation |
|----------|------------|
| PXE + `ip=…` + liste HTTP sur le port 7529 (ou TFTP si la requête de liste HTTP échoue), réseau filaire simple / virtio | Configuration cible prise en charge |
| `from=http://…iso` + DHCP (ou `ip=`), même catégorie de carte réseau | Fonctionne généralement |
| Démarrage USB/ISO standard | Réseau de l’initrd non utilisé |
| Configuration statique de la session via `ip=` | Non pris en charge |
| Plusieurs cartes réseau / carte réseau du firmware / Wi‑Fi / `https://` / édition Flux | Fiabilité limitée ou non pris en charge |

## Référence d’implémentation

| Élément | Emplacement dans l’arborescence MiniOS |
|-------|-----------------------------|
| Entrée init | `linux-live/initramfs/livekit-mos/init` |
| Réseau + PXE + ISO HTTP | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Outil de création LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Module Dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Lorsque `-n` est transmis | `linux-live/build-initramfs` (non minimal) |

## Voir aussi

- [Paramètres de démarrage](/reference/Boot-Parameters) — table complète des paramètres (`ip`, `from`, `cache`, …)
- [Découverte du système initrd](/reference/boot-process/System-Discovery) — ordre de priorité des sources, découverte locale et comportement en cas d’échec
- [live-config](/reference/configuration/live-config) — configuration tardive de l’espace utilisateur (pas le démarrage réseau)
- [Architecture système](/reference/System-Architecture)
- [Compilation de MiniOS](/development/Building-MiniOS) — outil de création d’initramfs (`livekit` / `dracut`)
