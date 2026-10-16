---
updated: 2026-08-31
---

# Réseau

MiniOS utilise **NetworkManager** pour gérer les connexions réseau filaires et Wi-Fi courantes. MiniOS ne remplace pas son modèle de connexion par un système de configuration réseau distinct.

Pour un usage courant, ouvrez l’icône réseau dans le panneau du bureau. Les outils NetworkManager standard sont également disponibles :

```bash
nmtui
nmcli
```

Utilisez ces outils pour vous connecter au Wi-Fi, changer de réseau, configurer DHCP ou des adresses statiques, le DNS, les connexions VPN et les autres paramètres réseau courants. Pour en connaître toutes les fonctionnalités, consultez la documentation et les pages de manuel de NetworkManager.

Dans une session MiniOS persistante, les profils de connexion NetworkManager sont enregistrés avec la session. Dans **Démarrer sans enregistrer**, les modifications sont perdues à l’arrêt.

## Préconfiguration réseau

Les paramètres réseau propres à MiniOS sont principalement une **préconfiguration**. Cette approche est utile lorsqu’une image, un programme d’installation ou un déploiement sans assistance doit démarrer avec une configuration filaire connue avant que l’utilisateur n’ouvre NetworkManager.

Le composant MiniOS `live-config`réseau prend en charge la préconfiguration IPv4 filaire. Il ne préconfigure pas le Wi-Fi.

Voici un exemple de configuration statique dans `config.conf` :

```bash
LIVE_NETWORK_METHOD="static"
LIVE_NETWORK_INTERFACE="enp1s0"
LIVE_NETWORK_ADDRESS="192.0.2.10"
LIVE_NETWORK_PREFIX="24"
LIVE_NETWORK_GATEWAY="192.0.2.1"
LIVE_NETWORK_DNS="1.1.1.1,9.9.9.9"
LIVE_NETWORK_BACKEND="auto"
```

`LIVE_NETWORK_METHOD` accepte `dhcp`, `static` ou `off`. Les valeurs non définies et `dhcp` conservent la configuration réseau existante de l’image au lieu de remplacer le comportement habituel de NetworkManager. `static` définit une configuration IPv4 statique filaire ; `off` prépare l’interface filaire sélectionnée pour qu’elle ne se connecte pas automatiquement. Avec `LIVE_NETWORK_BACKEND="auto"`, MiniOS privilégie NetworkManager et utilise ifupdown si nécessaire. Si aucune interface n’est spécifiée, la préconfiguration est appliquée uniquement s’il est possible d’identifier exactement une interface filaire admissible.

Consultez le [Fichier de configuration](/reference/configuration/config.conf) pour savoir où ces paramètres sont enregistrés, et [live-config](/reference/configuration/live-config) pour consulter la référence complète des variables et des composants.

## Quand la préconfiguration s’applique

Le composant réseau est une étape de `live-config`configuration exécutée une seule fois. Après son exécution réussie dans une session persistante, les modifications réseau courantes doivent être effectuées avec NetworkManager, et non en modifiant la préconfiguration à répétition.

Si vous devez intentionnellement appliquer une préconfiguration réseau MiniOS modifiée à la même session persistante, supprimez le fichier indiquant que l’opération est terminée, puis redémarrez :

```bash
sudo rm -f /var/lib/live/config/network
```

Ne le faites que si vous souhaitez réellement que `live-config`génère à nouveau la configuration réseau filaire. Il n’est pas nécessaire de le faire pour modifier les connexions Wi-Fi ou Ethernet habituelles.

## Préconfiguration par le programme d’installation

L’étape réseau du Programme d’installation MiniOS effectue également la préconfiguration du système cible. Elle prend en charge DHCP filaire ou une configuration IPv4 statique. Le Wi-Fi est pris en charge par NetworkManager après le démarrage du système installé.

## Le réseau au démarrage précoce fonctionne différemment

NetworkManager configure le système MiniOS en cours d’exécution. Le réseau utilisé par l’initramfs pour obtenir MiniOS lui-même repose sur un mécanisme distinct.

Le paramètre de démarrage `ip=` boot, les téléchargements PXE et `from=http://...` ne créent donc pas de profils NetworkManager et ne doivent pas être utilisés pour configurer le réseau du bureau habituel. Voir [Démarrage réseau](/reference/boot-process/Network-Boot).

## Dépannage

Pour un problème de connexion courant, commencez par vérifier NetworkManager :

```bash
nmcli device status
nmcli connection show --active
```

Utilisez l’éditeur de connexions du bureau, `nmtui`, ou consultez les journaux et la documentation standard de NetworkManager pour les problèmes courants de Wi-Fi, DHCP, DNS, VPN ou Ethernet.

Les diagnostics spécifiques à MiniOS sont utiles lorsque le problème concerne la préconfiguration du réseau ou le démarrage réseau. Le journal `live-config` est disponible `/var/log/live/config.log` ; les problèmes liés au démarrage précoce du réseau sont traités dans le guide [Démarrage réseau](/reference/boot-process/Network-Boot).

## Documentation associée

- [Fichier de configuration](/reference/configuration/config.conf)
- [live-config](/reference/configuration/live-config)
- [Démarrage réseau](/reference/boot-process/Network-Boot)
- [Gestion des sessions](/using-minios/Sessions-and-Persistence)
