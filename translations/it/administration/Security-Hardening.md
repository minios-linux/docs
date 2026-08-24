# Rafforzamento della sicurezza

MiniOS può essere eseguito come sistema di recupero live, sistema portatile persistente o installazione nativa. I controlli appropriati dipendono da come viene utilizzato il sistema. Proteggi la sessione in esecuzione, i dati persistenti, il supporto di avvio e qualsiasi configurazione applicata all'avvio.

## Inizia con supporti affidabili

Scarica MiniOS da una fonte ufficiale e verifica l'ISO prima di scriverlo. Segui [Verifica dei download](/installation/Verifying-Downloads.md) e confronta il risultato prima di avviare o installare. La verifica rileva un download danneggiato o sostituito; non garantisce che un dispositivo USB già modificato sia sicuro.

Tieni il dispositivo USB sotto controllo fisico. Le password del firmware e l'ordine di avvio limitato possono ridurre avvii non autorizzati occasionali, ma non cifrano i file sul dispositivo. Secure Boot può offrire una protezione aggiuntiva della catena di avvio su immagini e hardware che la supportano; verifica il comportamento effettivo della release e del firmware invece di presumere il supporto.

## Sostituisci le credenziali predefinite

Un'immagine live MiniOS non personalizzata utilizza le credenziali pubblicate `live` /
`evil` e `root` / `toor`, con accesso automatico e privilegi amministrativi senza password nella configurazione orientata alla praticità. Chiunque possa raggiungere il sistema potrebbe essere in grado di usare queste credenziali, soprattutto se SSH è attivo.

Prima di collegarsi a una rete non affidabile:

1. Imposta password uniche per utente e root tramite MiniOS Configurator.
2. Seleziona un profilo di sicurezza adeguato e verifica ogni controllo impostato.
3. Disabilita SSH e XRDP se l'accesso remoto non è necessario.
4. Riavvia in una nuova sessione quando cambi impostazioni di account o sicurezza "one-shot", quindi verifica il comportamento di login e privilegi risultante.

Il Configurator memorizza gli hash delle password cifrate invece delle password in chiaro. Se cambi un account persistente o nativo già creato, usa `passwd` per l'utente corrente e `sudo passwd root` per root.

## Utilizza i controlli di sicurezza del Configurator

MiniOS Configurator offre tre profili. Un profilo imposta configurazioni concrete; il nome del profilo stesso non viene salvato come chiave di configurazione runtime e ogni impostazione resta modificabile in modo indipendente.

| Profilo | Comportamento principale |
| --- | --- |
| `convenient` | Compatibile con autologin, sudo e PolicyKit senza password, root e SSH con password consentiti, XRDP/X11/schermata di blocco rilassati, suggerimenti password visibili. |
| `balanced` | Nessun autologin, sudo e PolicyKit richiedono password, login SSH come root negato ma SSH con password consentito, XRDP/X11/schermata di blocco rafforzati. |
| `strict` | Nessun autologin, sudo e PolicyKit richiedono password, login SSH come root e con password negati, XRDP disabilitato, X11/schermata di blocco rafforzati, suggerimenti password nascosti. |

Le impostazioni predefinite dell'installer variano in base alla modalità di installazione: le installazioni live privilegiano `convenient`, mentre quelle native privilegiano `balanced`. Si tratta di predefiniti, non di raccomandazioni valide per ogni modello di minaccia.

Le stesse impostazioni sono disponibili come chiavi di configurazione documentate, tra cui `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` e `LIVE_LOCKSCREEN_MODE`. Preferisci queste chiavi o il Configurator rispetto alla modifica diretta di file sudoers, PolicyKit, display-manager o SSH generati. Consulta [File di configurazione](/configuration/Configuration-File.md).
Per comportamento del salvataggio e applicabilità delle impostazioni, vedi [MiniOS Configurator](/configuration/MiniOS-Configurator.md).

La creazione degli account, le password, `LIVE_CONFIG_NOROOT` e la postura di sicurezza sono impostazioni "one-shot" utilizzate alla creazione di una nuova sessione. Il Configurator mostra l'applicabilità di ogni controllo. Le impostazioni riconfigurabili come i servizi vengono applicate dopo il riavvio.

## Proteggi l'accesso remoto

SSH può essere abilitato in un'immagine MiniOS per scopi di recupero. In una rete dove altri utenti non sono affidabili, considera che le credenziali predefinite pubblicate siano esposte finché non hai confermato il contrario.

- Se SSH non è necessario, aggiungi `ssh` a `DISABLE_SERVICES` in Configurator e rimuovilo da `ENABLE_SERVICES` se presente.
- Se SSH è richiesto, nega l'accesso root tramite `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Preferisci l'autenticazione tramite chiave. Conferma il login con chiave in una connessione separata prima di impostare `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limita l'accesso in ingresso tramite firewall di rete o router e non esporre direttamente a Internet un sistema di recupero portatile.
- Verifica XRDP separatamente. Il profilo "strict" lo disabilita; il profilo "balanced" lo rafforza ma non necessariamente ne disabilita il servizio.

I parametri di avvio possono sovrascrivere i valori del file di configurazione. Analizza comportamenti inattesi dei servizi consultando [Parametri di avvio](/configuration/Boot-Parameters.md).

## Cifra i dati persistenti

La persistenza non cifrata (nativa, DynFileFS e raw) può essere letta da chiunque ottenga il dispositivo. MiniOS Installer può configurare un contenitore LUKS cifrato per una sessione live quando l'initrd sorgente pubblicizza il supporto LUKS. L'initrd crea `changes.luks` al primo avvio e richiede la relativa passphrase; l'installer non riceve né memorizza tale passphrase.

La persistenza LUKS protegge i contenuti quando il contenitore è chiuso. Non protegge i dati dopo lo sblocco, i file di avvio non cifrati, i file copiati fuori dal contenitore o un filesystem root nativo. La persistenza LUKS della sessione non è cifratura del root nativo. Usa una passphrase robusta e conserva un backup testato.

Consulta [MiniOS Installer](/installation/MiniOS-Installer.md) e [Gestione sessione](/configuration/Session-Management.md).

## Applica gli aggiornamenti in modo consapevole

Aggiorna i metadati dei pacchetti e installa gli aggiornamenti di sicurezza Debian nelle sessioni live persistenti o nelle installazioni native utilizzando il normale flusso di lavoro APT. Le modifiche APT in una sessione live nuova vengono perse al riavvio. I moduli base SquashFS sono di sola lettura, quindi sostituire l'ISO o i moduli con una versione MiniOS più recente e affidabile è spesso il modo più pulito per aggiornare il sistema live di base.

Consulta [Aggiornamenti software](/administration/Software-Updates.md) per i flussi di lavoro separati di APT, moduli, immagini e kernel.

Prima di un aggiornamento importante:

- Effettua il backup dei file importanti e delle sessioni persistenti.
- Verifica che ci sia spazio libero sufficiente.
- Evita di interrompere le scritture o spegnere il dispositivo.
- Riavvia e verifica il sistema aggiornato prima di eliminare il supporto o la sessione precedentemente funzionanti.

## Considera hook e preseeding come esecuzione di codice

L'opzione di avvio `hooks` e gli hook live-config possono eseguire file dal filesystem root, dal supporto di avvio o da un URL. Hook remoti, hook su supporti modificati e preseeding non verificati possono essere eseguiti con privilegi di sistema. Usa solo file verificati provenienti da una fonte affidabile, preferisci la distribuzione autenticata ed evita hook remoti su reti non affidabili. Consulta [live-config](/configuration/live-config.md) per l'ordine di esecuzione e le posizioni supportate.

## Esegui backup e smaltisci i supporti in modo sicuro

La persistenza non è un backup. Conserva una copia separata dei file utente ed esporta o copia le sessioni quando sono integre. Testa il ripristino su supporti diversi. Spegni correttamente prima di rimuovere lo storage scrivibile e mantieni spazio libero per i metadati della sessione e il funzionamento del filesystem.

Prima di smaltire un dispositivo, cancellalo in modo sicuro in base alla tecnologia di storage e alla sensibilità dei dati. Eliminare i file o riformattare potrebbe non rendere i vecchi dati irrecuperabili.
