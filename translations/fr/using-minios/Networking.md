---
updated: 2026-08-31
---

# Réseau

MiniOS utilise **NetworkManager** pour la gestion réseau filaire et Wi-Fi standard. MiniOS ne remplace pas son modèle de connexion par un autre système de configuration réseau.

Pour une utilisation courante, ouvrez l’icône réseau dans le panneau du bureau. Les outils standards de NetworkManager sont également disponibles :

```bash
nmtui
nmcli
```

Utilisez ces outils pour vous connecter au Wi-Fi, changer de réseau, configurer DHCP ou des adresses statiques, DNS, VPN, et autres paramètres réseau habituels en cours d’utilisation. Pour plus de détails sur leur fonctionnement, consultez la documentation et les pages de manuel de NetworkManager.

Dans une session persistante MiniOS, les profils de connexion NetworkManager sont enregistrés dans la session. En choisissant **Démarrer sans enregistrer**, les modifications disparaissent à l’arrêt.

## Préconfiguration réseau

Les paramètres réseau spécifiques à MiniOS sont principalement des **préconfigurations**. Ils sont utiles lorsqu’une image, un installateur ou un déploiement automatisé doit démarrer avec une configuration filaire connue avant que l’utilisateur n’ouvre NetworkManager.

Le composant réseau MiniOS `live-config` prend en charge la préconfiguration filaire IPv4. Il ne préconfigure pas le Wi-Fi.

Un exemple statique dans `config.conf` :

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` accepte `dhcp`, `static` ou `off`. Les valeurs non définies et `dhcp` conservent la configuration réseau existante de l’image au lieu de remplacer le comportement normal de NetworkManager. `static` écrit une configuration filaire IPv4 statique ; `off` prépare l’interface filaire sélectionnée pour qu’elle ne se connecte pas automatiquement. Avec `LIVE_NETWORK_BACKEND="auto"`, MiniOS privilégie NetworkManager et bascule sur ifupdown si nécessaire. Si aucune interface n’est spécifiée, la préconfiguration s’applique uniquement lorsqu’une seule interface filaire éligible peut être identifiée.

Voir [Fichier de configuration](/reference/configuration/config.conf) pour l’emplacement de ces paramètres et [live-config](/reference/configuration/live-config) pour la référence complète des variables et composants.

## Quand la préconfiguration s’applique

Le composant réseau est une étape de configuration `live-config` effectuée une seule fois. Après une exécution réussie dans une session persistante, les modifications réseau habituelles doivent être réalisées avec NetworkManager plutôt qu’en modifiant à chaque fois la préconfiguration.

Si vous devez volontairement appliquer une nouvelle préconfiguration réseau MiniOS à la même session persistante, supprimez son marqueur de complétion et redémarrez :

```bash
sudo rm -f /var/lib/live/config/network
```

Ne faites cela que si vous souhaitez réellement que `live-config` génère à nouveau la politique réseau filaire. Modifier les connexions Wi-Fi ou Ethernet normales ne le nécessite pas.

## Préconfiguration de l’installation

L’étape réseau du Programme d’installation MiniOS effectue également la préconfiguration du système cible. Elle prend en charge le DHCP filaire ou des paramètres IPv4 statiques. Le Wi-Fi est laissé à NetworkManager après le démarrage du système installé.

## Le réseau au démarrage initial est différent

NetworkManager configure le système MiniOS en cours d’exécution. Le réseau utilisé par l’initramfs pour obtenir MiniOS lui-même repose sur un mécanisme distinct.

Le paramètre de démarrage `ip=`, les téléchargements PXE et `from=http://...` ne créent donc pas de profils NetworkManager et ne doivent pas être utilisés pour configurer le réseau du bureau classique. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

## Dépannage

Pour un problème de connexion classique, commencez par NetworkManager lui-même :

```bash
nmcli device status
nmcli connection show --active
```

Utilisez l’éditeur de connexion du bureau, `nmtui`, ou les journaux et la documentation standards de NetworkManager pour les problèmes courants de Wi-Fi, DHCP, DNS, VPN ou Ethernet.

Les diagnostics spécifiques à MiniOS sont pertinents lorsqu’un problème concerne la préconfiguration réseau ou le démarrage réseau. Le journal `live-config` est `/var/log/live/config.log` ; les problèmes de démarrage réseau sont traités dans le guide [Démarrage réseau](/reference/boot-process/Network-Boot).

## Documentation associée

- [Fichier de configuration](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Démarrage réseau](/reference/boot-process/Network-Boot)
- [Gestion des sessions](/using-minios/Sessions-and-Persistence)
