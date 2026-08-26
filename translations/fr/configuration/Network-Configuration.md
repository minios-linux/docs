---
updated: 2026-08-26
---

# Configuration réseau

Après le démarrage de MiniOS, NetworkManager gère normalement les connexions filaires et Wi-Fi. Ceci est distinct du réseau de l'initramfs utilisé pour télécharger un système PXE ou HTTP-ISO. En particulier, le paramètre PXE `ip=` ne crée pas de profil NetworkManager et ne définit pas d'adresse de session persistante. Consultez [Démarrage réseau](/installation/Network-Boot.md) pour la configuration réseau au démarrage.

## Configuration du bureau

Utilisez l’icône réseau dans le panneau du bureau pour sélectionner un réseau Wi-Fi, déconnecter ou reconnecter un périphérique, ou ouvrir l’éditeur de connexion. Pour une adresse filaire statique, modifiez la connexion filaire et définissez la méthode IPv4 sur Manuel, puis saisissez l’adresse, le préfixe, la passerelle et les serveurs DNS. Définissez la méthode sur Automatique (DHCP) pour utiliser DHCP.

L’interface en mode texte propose les mêmes opérations courantes :

```bash
nmtui
```

Choisissez **Modifier une connexion** pour changer un profil et **Activer une connexion** pour l’établir.

## Ligne de commande NetworkManager

Afficher les périphériques et les profils enregistrés :

```bash
nmcli device status
nmcli connection show
```

Rechercher les réseaux Wi-Fi et se connecter :

```bash
nmcli radio wifi on
nmcli device wifi list
nmcli device wifi connect "NETWORK_NAME" --ask
```

La dernière commande demande le mot de passe sans l’afficher dans la ligne de commande. N’inscrivez jamais un mot de passe Wi-Fi directement dans une commande, car il pourrait rester dans l’historique du shell et être visible par d’autres processus.

Pour modifier un profil filaire existant en DHCP :

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
nmcli connection up "Wired connection 1"
```

Pour attribuer une adresse IPv4 statique :

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.method manual ipv4.addresses 192.0.2.10/24 \
  ipv4.gateway 192.0.2.1 ipv4.dns "1.1.1.1 9.9.9.9"
nmcli connection up "Wired connection 1"
```

Remplacez le nom du profil et les adresses par les valeurs de votre réseau local. Une connexion distante peut être interrompue dès que son profil actif est modifié.

## Persistance

NetworkManager enregistre les profils système dans
`/etc/NetworkManager/system-connections/`. Lors d’un démarrage live sans persistance,
les modifications effectuées via le bureau, `nmcli` ou `nmtui` sont perdues à l’arrêt. En session persistante, elles sont conservées d’un redémarrage à l’autre. Consultez [Gestion des sessions](/configuration/Session-Management.md) pour la sélection et l’enregistrement des sessions.

Les profils ne sont pas partagés automatiquement entre différentes sessions persistantes. Les profils Wi-Fi peuvent contenir des identifiants : protégez donc le support de session et supprimez les identifiants avant de partager une archive de session ou un rapport de diagnostic.

## Préconfiguration d’une connexion filaire

Le composant réseau live-config de MiniOS peut créer une politique IPv4 statique filaire avant le démarrage des services réseau. Il est destiné aux systèmes non surveillés ou installés. Il ne configure pas le Wi-Fi.

Ajoutez des affectations de style shell dans `minios/config.conf` sur le support MiniOS ou dans `/etc/live/config.conf` sur le système live :

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

Citez les valeurs comme des chaînes shell et n’ajoutez pas d’espaces autour de `=`. Consultez [Fichier de configuration](/configuration/Configuration-File.md) pour les emplacements et priorités des fichiers, et [live-config](/configuration/live-config.md) pour l’activation du composant et les options générales.

Les options de démarrage équivalentes sont :

```text
network-method=static network-interface=enp1s0 \
network-address=192.0.2.10 network-prefix=24 \
network-gateway=192.0.2.1 network-dns=1.1.1.1,9.9.9.9 \
network-backend=auto
```

Les formes longues `live-config.network-*` sont également acceptées. Ce sont des options live-config en espace utilisateur tardif, et non la syntaxe PXE `ip=`.

### Méthodes

| Méthode | Comportement |
|---------|-------------|
| Non défini ou `dhcp` | Ne modifie rien et conserve la configuration réseau existante de l’image. Cela ne crée pas de configuration DHCP et ne supprime pas un ancien profil statique MiniOS. |
| `static` | Écrit un profil IPv4 statique filaire. Le préfixe est par défaut `24`; la passerelle et le DNS sont optionnels. |
| `off` | Écrit un profil NetworkManager non auto-connecté avec IPv4 désactivé, ou une section ifupdown `manual`. Ce n’est pas un interrupteur radio Wi-Fi. |

Seuls `static` et `off` sélectionnent une interface et écrivent la configuration. Si `LIVE_NETWORK_INTERFACE` est omis, live-config ne continue que si une seule interface filaire non loopback est disponible. Les interfaces sans fil sont exclues. Utilisez `ip link` ou `nmcli device status` pour obtenir le nom réel de l’interface sur un système multi-interface.

### Moteurs et validation

`LIVE_NETWORK_BACKEND` accepte :

| Moteur | Comportement |
|--------|-------------|
| `auto` ou non défini | Privilégie NetworkManager et bascule sur ifupdown si nécessaire. |
| `nm` | Nécessite NetworkManager et écrit `/etc/NetworkManager/system-connections/minios-static.nmconnection`. |
| `ifupdown` | Nécessite ifupdown et écrit `/etc/network/interfaces.d/minios-static`. Si NetworkManager est installé, il marque aussi l’interface sélectionnée comme non gérée dans `/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. |

Les noms d’interface ne peuvent contenir que des lettres, chiffres, `_`, `.`, `:` et `-`.
Les adresses statiques et passerelles doivent être des adresses IPv4 valides. Le préfixe doit être un entier de `0` à `32`. Le DNS est une liste d’adresses IPv4 ou IPv6 séparées par des virgules. Les valeurs invalides, la sélection d’interface ambiguë et les moteurs indisponibles sont signalés et aucun tampon de succès n’est écrit.

## Modification de la politique live-config persistante

Dans un système live persistant, le composant réseau s’applique normalement une seule fois et enregistre le succès dans `/var/lib/live/config/network`. Pour appliquer des modifications statiques ou désactiver les réglages :

1. Modifiez le fichier `/etc/live/config.conf` persistant effectif.
2. Supprimez le tampon avec `sudo rm /var/lib/live/config/network`.
3. Redémarrez.

Modifier uniquement la configuration sur le support amovible n’écrase pas un `/etc/live/config.conf` persistant existant.

Définir `LIVE_NETWORK_METHOD="dhcp"` n’est pas une réinitialisation de profil. Pour revenir d’un profil statique géré par MiniOS à un DHCP NetworkManager classique, supprimez la politique statique `LIVE_NETWORK_*` de la configuration effective, supprimez le profil géré et le tampon, puis redémarrez :

```bash
sudo rm -f /etc/NetworkManager/system-connections/minios-static.nmconnection
sudo rm -f /var/lib/live/config/network
```

Pour le moteur ifupdown, supprimez plutôt
`/etc/network/interfaces.d/minios-static` et
`/etc/NetworkManager/conf.d/99-minios-unmanaged.conf`. Ensuite, créez ou activez un profil DHCP via l’éditeur du bureau, `nmtui` ou `nmcli` si NetworkManager n’en crée pas automatiquement.

## Comportement de l’installateur

L’étape Réseau de l’installateur s’applique uniquement au réseau filaire. Une configuration IPv4 statique sélectionnée est écrite pour le système installé. Le choix de DHCP conserve les paramètres par défaut et n’écrit pas de réinitialisation de profil. Les profils Wi-Fi existants et les paramètres Wi-Fi ne sont pas modifiés.

## Diagnostics

Commencez par vérifier le périphérique, l’adresse, la route et l’état de NetworkManager :

```bash
ip link
ip address
ip route
nmcli general status
nmcli device status
nmcli connection show --active
systemctl status NetworkManager --no-pager
```

Vérifiez le journal de démarrage actuel pour les erreurs de périphérique, de microprogramme, de DHCP et de live-config :

```bash
journalctl -b -u NetworkManager
journalctl -b | grep 'live-config: network'
dmesg
```

Pour une politique live-config, vérifiez également les paramètres effectifs, le fichier généré et le tampon. Le principal journal live-config est `/var/log/live/config.log`.

Testez les échecs dans l’ordre suivant : état du lien, adresse sur l’interface, route et passerelle par défaut, adresse IP externe, puis nom DNS. Cela permet de distinguer les problèmes de périphérique ou de microprogramme des soucis de DHCP, de routage ou de DNS. Consultez [Dépannage](/administration/Troubleshooting.md) pour des vérifications plus larges et la collecte de journaux.

## Voir aussi

- [Démarrage réseau](/installation/Network-Boot.md)
- [Fichier de configuration](/configuration/Configuration-File.md)
- [live-config](/configuration/live-config.md)
- [Dépannage](/administration/Troubleshooting.md)
- [Gestion des sessions](/configuration/Session-Management.md)
