---
updated: 2026-09-13
---

# Sicurezza

I controlli di sicurezza MiniOS sono progettati attorno al sistema live: sessioni temporanee, sessioni persistenti, supporti portatili e configurazione all'avvio. L'Installatore MiniOS può anche eseguire una conversione nativa. Il sistema risultante mantiene l'ambiente desktop selezionato e l'identità visiva MiniOS, ma il software specifico per il live MiniOS viene rimosso, così puoi proteggerlo e mantenerlo con i normali strumenti Debian invece di trattarlo come un'altra modalità live.
Proteggi la sessione in esecuzione, i dati persistenti, il supporto di avvio e qualsiasi configurazione applicata all'avvio.

## Inizia con supporti affidabili

Scarica MiniOS da una fonte ufficiale e verifica l'ISO prima di scriverlo.
Segui [Verifica dei download](/installing-minios/Verifying-Downloads) e confronta il risultato prima di avviare o installare. La verifica rileva un download danneggiato o sostituito; non garantisce che una chiavetta USB già modificata sia sicura.

Tieni il dispositivo USB sotto controllo fisico. Le password del firmware e l'ordine di avvio limitato possono ridurre avvii non autorizzati occasionali, ma non cifrano i file sul dispositivo. Secure Boot può offrire una protezione aggiuntiva della catena di avvio su immagini e hardware compatibili; verifica sempre il comportamento reale della versione e del firmware invece di presumere il supporto.

## Sostituisci le credenziali predefinite

Un'immagine live MiniOS non personalizzata utilizza le credenziali pubblicate `live` / `evil` e `root` / `toor`, con accesso automatico e privilegi amministrativi senza password nella configurazione orientata alla comodità. Chiunque possa accedere al sistema potrebbe utilizzare queste credenziali, soprattutto se SSH è attivo.

Prima di collegarsi a una rete non affidabile:

1. Imposta password uniche per utente e root nel Configuratore MiniOS.
2. Seleziona un profilo di sicurezza appropriato e verifica ogni controllo compilato.
3. Disabilita SSH e XRDP a meno che l'accesso remoto non sia necessario.
4. Riavvia in una nuova sessione dopo aver modificato impostazioni di account temporanei o di sicurezza, quindi verifica il comportamento risultante di login e privilegi.

Il Configuratore memorizza gli hash delle password criptati invece delle password in chiaro. Se devi modificare un account persistente già creato, usa `passwd` per l'utente corrente e `sudo passwd root` per root. Dopo la conversione nativa, utilizza i normali strumenti di gestione account di Debian.

## Utilizza i controlli di sicurezza del Configuratore

Configuratore MiniOS offre tre profili. Un profilo imposta configurazioni specifiche; il nome del profilo non viene salvato come chiave di configurazione runtime, e ogni impostazione resta modificabile in modo indipendente.

| Profilo | Comportamento principale |
| --- | --- |
| `convenient` | Compatibile con autologin, sudo e PolicyKit senza password, accesso root e SSH con password consentiti, XRDP/X11/schermata di blocco meno restrittivi, suggerimenti password visibili. |
| `balanced` | Nessun autologin, sudo e PolicyKit richiedono password, accesso SSH come root negato ma SSH con password consentito, XRDP/X11/schermata di blocco rafforzati. |
| `strict` | Nessun autologin, sudo e PolicyKit richiedono password, accesso SSH come root e con password negato, XRDP disabilitato, X11/schermata di blocco rafforzati, suggerimenti password nascosti. |

Le impostazioni predefinite dell’installer variano in base alla modalità di distribuzione: le installazioni live privilegiano `convenient`, mentre la conversione nativa parte da `balanced`. L’impostazione nativa viene applicata durante la conversione; dopo l’installazione, utilizzare la normale configurazione di sicurezza Debian. Questi sono valori predefiniti, non raccomandazioni per ogni modello di minaccia.

Le stesse impostazioni sono disponibili come chiavi di configurazione documentate, tra cui `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS`, e `LIVE_LOCKSCREEN_MODE`. È preferibile utilizzare queste chiavi o il Configuratore invece di modificare direttamente i file sudoers, PolicyKit, display-manager o SSH generati. Vedi [File di configurazione](/reference/configuration/config.conf).
Per il comportamento del salvataggio e la validità delle impostazioni, consulta [Configuratore MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Creazione account, password, `LIVE_CONFIG_NOROOT`, e il livello di sicurezza sono impostazioni una tantum applicate quando viene creata una nuova sessione. Il Configuratore mostra la validità di ogni controllo. Impostazioni riconfigurabili come i servizi vengono applicate dopo il riavvio.

## Accesso remoto sicuro

SSH può essere abilitato in un'immagine MiniOS per scopi di recupero. In una rete dove gli altri utenti non sono considerati affidabili, presumi che le credenziali predefinite pubblicate siano esposte finché non hai confermato il contrario.

- Se SSH non è necessario, aggiungi `ssh` a `DISABLE_SERVICES` in Configurator e rimuovilo da `ENABLE_SERVICES` se presente.
- Se SSH è richiesto, nega l'accesso root con `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Preferisci l'autenticazione tramite chiave. Verifica l'accesso con chiave in una connessione separata prima di impostare `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limita l'accesso in ingresso tramite firewall di rete o router e non esporre direttamente a Internet un sistema portatile di recupero.
- Verifica XRDP separatamente. Il profilo "strict" lo disabilita; il profilo "balanced" lo rafforza ma non necessariamente disabilita il servizio.

I parametri di avvio possono sovrascrivere i valori dei file di configurazione. Controlla comportamenti inattesi del servizio rispetto a [Parametri di avvio](/reference/Boot-Parameters).

## Crittografa i dati persistenti

La persistenza non crittografata di tipo native, DynFileFS, dynblk, raw e SquashFS può essere letta da chiunque ottenga il dispositivo. Dynblk è un backend kernel block leggero, non uno strato di crittografia; `volumeNNN.db`i file di backing contengono normali dati di sessione non crittografati a meno che lo storage sottostante non sia protetto separatamente. Installatore MiniOS può configurare un contenitore LUKS crittografato per una sessione live quando l'initrd di origine supporta LUKS. L'initrd crea `changes.luks`al primo avvio e richiede la passphrase; l'installatore non riceve né memorizza quella passphrase.

La persistenza LUKS protegge i contenuti quando il contenitore è chiuso. Non protegge i dati dopo lo sblocco, i file di avvio non crittografati, i file copiati fuori dal contenitore o un filesystem root nativo. La persistenza di sessione LUKS non è una crittografia root nativa. Usa una passphrase robusta e conserva un backup testato.

Vedi [Installatore MiniOS](/installing-minios/MiniOS-Installer) e [Gestione sessione](/using-minios/Sessions-and-Persistence).

## Applica gli aggiornamenti in modo consapevole

Aggiorna i metadati dei pacchetti e installa gli aggiornamenti di sicurezza Debian nelle sessioni live persistenti utilizzando il normale flusso di lavoro APT, quando opportuno. Le modifiche apportate con APT in una nuova sessione live vengono perse al riavvio. I moduli di base SquashFS sono in sola lettura, quindi sostituire l’ISO o i moduli con una nuova versione attendibile di MiniOS è spesso il modo più pulito per aggiornare il sistema live di base. Dopo la conversione nativa, la manutenzione della sicurezza dei pacchetti segue semplicemente il normale flusso di lavoro APT di Debian per il sistema installato.

Vedi [Aggiornamenti software](/maintenance-and-recovery/Updating-MiniOS) per i flussi di lavoro separati di APT, moduli, immagini e kernel.

Prima di un aggiornamento importante:

- Esegui il backup dei file importanti e delle sessioni persistenti.
- Verifica che sia disponibile spazio libero sufficiente.
- Evita di interrompere le scritture o spegnere il dispositivo.
- Riavvia e verifica il sistema aggiornato prima di eliminare il supporto o la sessione precedenti che funzionavano correttamente.

## Tratta hook e preseeding come esecuzione di codice

L'opzione di avvio `hooks` e gli hook di live-config possono eseguire file dal filesystem root, dal supporto di avvio o da un URL. Gli hook remoti, quelli su supporti modificati e i preseeding non revisionati possono essere eseguiti con privilegi di sistema. Utilizza solo file revisionati e provenienti da fonti affidabili, preferisci la distribuzione autenticata ed evita hook remoti su reti non attendibili. Consulta [live-config](/reference/configuration/live-config) per l'ordine di esecuzione e le posizioni supportate.

## Esegui il backup e dismetti i supporti in modo sicuro

La persistenza non è un backup. Conserva una copia separata dei file utente ed esporta o copia le sessioni quando sono integre. Verifica il ripristino su supporti diversi.
Spegni correttamente prima di rimuovere l’unità scrivibile e lascia spazio libero sufficiente per i metadati delle sessioni e il funzionamento del filesystem.

Prima di smaltire un dispositivo, cancellalo in modo sicuro in base alla tecnologia di archiviazione e alla sensibilità dei dati. Eliminare i file o riformattare il dispositivo potrebbe non rendere i vecchi dati irrecuperabili.
