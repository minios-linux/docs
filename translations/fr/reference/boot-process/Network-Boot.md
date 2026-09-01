---
updated: 2026-08-26
---

# Démarrage réseau

Cette page décrit **comment charger MiniOS via le réseau** : PXE (kernel + initrd + données MiniOS) et ISO HTTP (`from=http://…`). C’est le seul objectif du réseau dans l’initramfs de MiniOS.

Il ne s’agit **pas** de :

- Configurer NetworkManager ou une IP statique persistante après le démarrage du système
- Wi‑Fi dans l’initrd
- [live-config](/reference/configuration/live-config) (fin d’espace utilisateur)

Le réseau de session après le démarrage est distinct. Pour une IP statique filaire durable, utilisez l’étape Réseau de l’installateur, NetworkManager ou ifupdown — pas le paramètre PXE `ip=`.

Voir aussi : [Paramètres de démarrage](/reference/Boot-Parameters) (`ip`, `from`, `cache`).

## Vue d'ensemble

| Mode | Ce que vous démarrez | Comment les données MiniOS sont obtenues |
|------|---------------------|------------------------------------------|
| **PXE** | Kernel + initrd depuis un serveur de démarrage réseau | `ip=` non vide sans `from=http://…` → initrd télécharge les fichiers MiniOS depuis le serveur de données PXE |
| **HTTP ISO** | Kernel + initrd depuis un support local **ou** PXE | `from=http://…/minios.iso` → initrd active le réseau et monte l’ISO avec `httpfs2` |
| **Support local** | USB / ISO / disque | Pas de réseau initrd ; recherche locale uniquement |

Constructeurs d’initramfs : **LiveKit** (`livekit-mos`) ou **dracut** (`dracut-mos`). Les deux utilisent les mêmes assistants réseau LiveKit pour le téléchargement précoce.

```text
find_data()
  ├─ from=http://…     → configure network (ip= static, otherwise DHCP) → mount ISO (httpfs2)
  ├─ ip=… (non-empty)  → configure network → PXE download of MiniOS data
  └─ else              → search local disks/ISO only (no network)
```

`from=http://…` a la priorité sur `ip=`. Dans ce mode, `ip=` fournit une adresse statique pour la connexion HTTP ISO. Sinon, tout `ip=` non vide sélectionne le **chemin de données PXE** et ignore le support local. N’ajoutez pas `ip=` lors d’un démarrage USB/ISO classique juste pour "définir une adresse statique". Aucun des chemins réseau ne revient au support local si la découverte ou le téléchargement échoue.

## Prérequis

| Prérequis | Remarques |
|-----------|-----------|
| Ethernet filaire (ou virtio/vmxnet en VM) | La première interface détectée hors loopback est utilisée ; la liaison et l’accessibilité ne sont pas vérifiées, et il n’y a pas de sélection `BOOTIF` / `ethdevice` dans l’initrd |
| Initrd avec modules réseau | Généré pour les variantes de paquets autres que la valeur interne `minimum` (`--network`, souvent `--cloud`) |
| Pas de dépendance au Wi‑Fi | Le sans-fil n’est pas pris en charge dans le chemin de démarrage réseau |
| Privilégier les cartes réseau sans blobs firmware | Les cartes dépendantes du firmware échouent souvent dans l’initrd |
| Privilégier les images **Standard** ou plus grandes | L’édition **Flux** omet les modules NIC réseau, donc PXE / HTTP ISO n’est effectivement pas pris en charge |
| HTTP uniquement pour l’URL ISO | `from=http://…` fonctionne ; **`https://` n’est pas pris en charge** |

Outils dans l’initrd : busybox `ifconfig`, `route`, `udhcpc`, `wget`, `tftp` et `@mount.httpfs2`. Il n’y a pas de NetworkManager dans l’initrd.

## Démarrage PXE

### Processus

1. Le firmware / serveur PXE charge le **kernel** et l’**initrd** MiniOS (pxelinux, iPXE, etc. — en dehors de MiniOS lui-même).
2. La ligne de commande du kernel inclut un **`ip=`** non vide (et normalement `boot=live` pour un démarrage MiniOS complet).
3. L’initrd configure une adresse statique à partir de `ip=`, contacte le champ **server**, télécharge une liste de fichiers puis les bundles/fichiers MiniOS.
4. Le système poursuit le démarrage sur la racine live comme d’habitude.

### Paramètre `ip=`

```text
ip=<client-ip>:<server-ip>:<gateway-ip>:<netmask>[:<port>]
```

| Champ | Rôle |
|-------|------|
| client-ip | Adresse attribuée avec busybox `ifconfig` |
| server-ip | Hôte pour les données MiniOS HTTP/TFTP ; aussi écrit comme serveur DNS dans l’initrd |
| gateway-ip | Route par défaut ; aussi écrit comme serveur DNS |
| netmask | Masque IPv4 pointé (pas de préfixe CIDR) |
| port | Port HTTP optionnel pour la liste de fichiers et les fichiers (par défaut **7529**) |

Exemples :

```text
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0
ip=192.168.1.10:192.168.1.1:192.168.1.1:255.255.255.0:8080
```

### Comment les fichiers sont récupérés

1. **HTTP** (préféré) : `http://<server-ip>:<port>/PXEFILELIST?<kernel-release>:<machine>` puis chaque chemin listé dans ce fichier depuis le même hôte/port.
2. **TFTP** : busybox `tftp` n’est sélectionné que si la requête HTTP initiale pour `PXEFILELIST` échoue. Un échec ultérieur de téléchargement de fichier HTTP ne bascule pas le transfert vers TFTP.

Le port par défaut est **7529** lorsque le cinquième champ est omis.

### Ce que `ip=` n’est pas

| Attendu | Réalité |
|---------|---------|
| Formes kernel / dracut (`ip=dhcp`, `ip=:::::eth0:dhcp`, …) | **Non pris en charge** — mal interprété comme une adresse client |
| IP statique pour toute la session live | **Non pris en charge** — après le démarrage, NetworkManager (ou équivalent) prend la main sur l’interface |
| IP statique lors du chargement des données MiniOS depuis USB/ISO | **À ne pas utiliser** — sans `from=http://…`, cela force le téléchargement des données PXE |
| Liste DNS dédiée | Seuls gateway + server sont utilisés comme serveurs DNS dans l’initrd |

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
| IP/routes du kernel sur la carte réseau | Peuvent rester jusqu’à ce que l’espace utilisateur reconfigure l’interface |
| DNS de l’initrd (`resolv.conf`) | Politique de session non persistante |
| Réseau de session | Généralement **NetworkManager** sur les images MiniOS par défaut |
| Sens de `ip=` | Récupération anticipée uniquement — pas de profil statique mémorisé |

Si la racine est toujours alimentée par **httpfs**, la reconfiguration de la carte réseau par NetworkManager peut perturber la racine live. Prévoyez les déploiements en démarrage réseau en conséquence (ex. copie en RAM / éviter de perturber l’interface de récupération si possible).

Le late userspace **live-config** peut brièvement activer le réseau uniquement pour télécharger des hooks/preseeds distants (`Setup_network`). Cela n’a aucun lien avec l’adressage persistant PXE/`ip=`.

## Erreurs courantes

1. Mettre `ip=` sur la ligne de commande USB/ISO « pour IP statique » → le système tente un téléchargement PXE au lieu du média local sauf si `from=http://…` a d’abord sélectionné le démarrage HTTP ISO.
2. Utiliser `ip=dhcp` ou une autre syntaxe kernel `ip=` → mauvais analyseur, configuration d’adresse incorrecte.
3. Attendre une sélection Wi‑Fi ou multi-NIC `BOOTIF` dans l’initrd → non implémenté.
4. Utiliser une image **Flux** pour PXE/HTTP ISO → modules réseau absents de l’initrd.
5. Servir l’ISO uniquement en HTTPS → `from=http://…` ne correspondra pas.
6. Confondre ceci avec la configuration statique de l’installateur/NetworkManager après connexion.

## Résumé de fiabilité

| Scénario | Évaluation |
|----------|------------|
| PXE + `ip=…` + liste HTTP sur :7529 (ou TFTP après échec de la requête HTTP), simple filaire / virtio | Cible prise en charge |
| `from=http://…iso` + DHCP (ou `ip=`), même type de carte | Fonctionne généralement |
| Démarrage USB/ISO classique | Réseau initrd non utilisé |
| Session statique via `ip=` | Non pris en charge |
| Multi-NIC / carte réseau avec firmware / Wi‑Fi / `https://` / édition Flux | Faible ou non pris en charge |

## Référence d’implémentation

| Élément | Emplacement dans l’arborescence MiniOS |
|---------|-------------------------------|
| Point d’entrée init | `linux-live/initramfs/livekit-mos/init` |
| Réseau + PXE + HTTP ISO | `linux-live/initramfs/livekit-mos/lib/livekitlib` (`init_network_ip`, `download_data_pxe`, `mount_data_http`, `find_data`) |
| Générateur LiveKit (`--network`) | `linux-live/initramfs/livekit-mos/mkinitrfs` |
| Module Dracut MiniOS | `linux-live/initramfs/dracut-mos/90minios/` |
| Quand `-n` est passé | `linux-live/build-initramfs` (non-minimum) |

## Voir aussi

- [Paramètres de démarrage](/reference/Boot-Parameters) — tableau complet des paramètres (`ip`, `from`, `cache`, …)
- [Découverte système initrd](/reference/boot-process/System-Discovery) — priorité des sources, découverte locale et gestion des échecs
- [live-config](/reference/configuration/live-config) — configuration tardive de l’espace utilisateur (pas de démarrage réseau)
- [Architecture système](/reference/System-Architecture)
- [Construire MiniOS](/development/Building-MiniOS) — générateur d’initramfs (`livekit` / `dracut`)
