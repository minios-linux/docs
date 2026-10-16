---
updated: 2026-10-15
---

# Sicurezza

I controlli di sicurezza MiniOS sono progettati per il sistema live: sessioni temporanee, sessioni persistenti, supporti rimovibili e configurazione all'avvio. L'Installatore MiniOS può anche eseguire una conversione nativa. Il sistema risultante mantiene l'ambiente desktop selezionato e l'identità visiva MiniOS, ma rimuove il software MiniOS specifico del sistema live. Per proteggerlo e mantenerlo, usa quindi i normali strumenti Debian invece di considerarlo un'altra modalità live.
Proteggi la sessione in esecuzione, i dati persistenti, il supporto di avvio e qualsiasi configurazione applicata all'avvio.

## Parti da un supporto attendibile

Scarica MiniOS da una fonte ufficiale e verifica l'immagine ISO prima di scriverla.
Segui le istruzioni per [Verificare i download](/installing-minios/Verifying-Downloads) e confronta il risultato prima di avviare o installare il sistema. La verifica rileva download danneggiati o sostituiti, ma non garantisce la sicurezza di una chiavetta USB già manomessa.

Tieni il dispositivo USB sotto controllo fisico. Le password del firmware e le restrizioni sull'ordine di avvio possono ridurre gli avvii non autorizzati occasionali, ma non cifrano i file sul dispositivo. Secure Boot può offrire un'ulteriore protezione della catena di avvio sulle immagini e sull'hardware che lo supportano; verifica il comportamento effettivo della versione e del firmware, senza dare per scontato che sia supportato.

## Sostituisci le credenziali predefinite

Un'immagine live MiniOS non personalizzata usa le credenziali pubblicate `live` / `evil` e `root` / `toor`, con accesso automatico e accesso amministrativo senza password nella configurazione pensata per la praticità. Chiunque possa raggiungere il sistema potrebbe usare queste credenziali, soprattutto se SSH è attivo.

Prima di connetterti a una rete non attendibile:

1. Imposta password univoche per l'utente e root nel Configuratore MiniOS.
2. Seleziona un profilo di sicurezza adeguato e controlla ogni impostazione compilata.
3. Disabilita SSH e XRDP, a meno che non sia necessario l'accesso remoto.
4. Quando modifichi le impostazioni temporanee dell'account o di sicurezza, riavvia il sistema per avviare una nuova sessione, quindi verifica il comportamento risultante per l'accesso e i privilegi.

Il Configuratore memorizza hash delle password cifrati, non password in testo normale. Se modifichi un account persistente già creato, usa `passwd` per l'utente corrente e `sudo passwd root` per root. Dopo la conversione nativa, usa i normali strumenti Debian per la gestione degli account.

## Usa i controlli di sicurezza del Configuratore

Il Configuratore MiniOS offre tre profili. Un profilo imposta valori concreti; il nome del profilo non viene salvato come chiave di configurazione di runtime e ogni impostazione può essere modificata separatamente.

| Profilo | Comportamento principale |
| --- | --- |
| `convenient` | Compatibile con l'accesso automatico, sudo e PolicyKit senza password, accesso SSH consentito a root e tramite password, impostazioni meno restrittive per XRDP, X11 e schermata di blocco, suggerimenti sulle password visualizzati. |
| `balanced` | Nessun accesso automatico, sudo e PolicyKit con richiesta di password, accesso SSH di root negato ma accesso tramite password consentito, impostazioni rafforzate per XRDP, X11 e schermata di blocco. |
| `strict` | Nessun accesso automatico, sudo e PolicyKit con richiesta di password, accesso SSH di root e tramite password negato, XRDP disabilitato, impostazioni rafforzate per X11 e schermata di blocco, suggerimenti sulle password nascosti. |

Le impostazioni predefinite dell'installatore variano in base alla modalità di distribuzione: le installazioni live privilegiano `convenient`, mentre la conversione nativa parte da `balanced`. L'impostazione nativa viene applicata durante la conversione; dopo l'installazione, usa la normale configurazione di sicurezza Debian. Sono valori predefiniti, non raccomandazioni valide per ogni modello di minaccia.

Le stesse impostazioni sono disponibili come chiavi di configurazione documentate, tra cui `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` e `LIVE_LOCKSCREEN_MODE`. Preferisci queste chiavi o il Configuratore alla modifica dei file generati per sudoers, PolicyKit, display manager o SSH. Consulta [File di configurazione](/reference/configuration/config.conf).
Per informazioni su come vengono salvate le impostazioni e sulla loro applicabilità, consulta [Configuratore MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

La creazione dell'account, le password, `LIVE_CONFIG_NOROOT` e il livello di sicurezza sono impostazioni temporanee, usate quando viene creata una nuova sessione. Il Configuratore mostra l'applicabilità di ogni controllo. Le impostazioni riconfigurabili, come i servizi, vengono applicate dopo il riavvio.

## Accesso remoto sicuro

SSH potrebbe essere abilitato in un’immagine MiniOS per il ripristino. Se la rete include utenti di cui non ti fidi, considera esposte le credenziali predefinite pubblicate finché non ne avrai verificato il contrario.

- Se SSH non è necessario, aggiungi `ssh` a `DISABLE_SERVICES` in Configurator e rimuovilo da `ENABLE_SERVICES` se presente.
- Se SSH è necessario, impedisci l’accesso root con `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Preferisci l’autenticazione con chiave. Verifica l’accesso con la chiave in una connessione separata prima di impostare `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limita l’accesso in entrata con il firewall di rete o del router e non esporre direttamente a Internet un sistema di ripristino portatile.
- Esamina XRDP separatamente. Il profilo rigoroso lo disabilita; quello bilanciato lo rende più sicuro, ma non necessariamente disabilita il servizio.

I parametri di avvio possono sovrascrivere i valori dei file di configurazione. Se un servizio si comporta in modo imprevisto, verifica [Parametri di avvio](/reference/Boot-Parameters).

## Crittografare i dati persistenti

La persistenza nativa non crittografata, DynFileFS, DynBlk, VMDK, raw e SquashFS può essere letta da chi entra in possesso del dispositivo. MiniOS può aggiungere LUKS2 sopra Raw, DynFileFS, DynBlk o VMDK. LUKS2 è un livello di crittografia, non una modalità di sessione separata. Per crearlo all’avvio, selezionalo con `perchencrypt=luks`; le sessioni esistenti ricavano lo stato di crittografia dai metadati della sessione, non da una successiva opzione della riga di comando.

Il confine della crittografia varia in base al backend. Raw crittografa l’immagine a blocchi logica all’interno di `changes.img`; DynFileFS crittografa il `virtual.dat` esposto; DynBlk e VMDK crittografano il dispositivo a blocchi esposto dal driver DynBlk. I metadati della sessione, i file di avvio, i metadati del backend e i descrittori VMDK esterni al dispositivo a blocchi crittografato, nonché gli altri file sul supporto, rimangono visibili. La compressione del backend DynBlk viene disabilitata quando si seleziona LUKS2; VMDK non supporta la compressione del backend.

La creazione all’avvio richiede due volte la passphrase nell’initrd. Quando Installer crea in anticipo una sessione crittografata sulla destinazione, la procedura guidata raccoglie e conferma la passphrase e la passa a `minios-session` tramite lo standard input. La passphrase non viene salvata nella configurazione, nei log o negli argomenti del processo. Le sessioni crittografate esistenti richiedono la passphrase all’avvio; tre tentativi di sblocco non riusciti interrompono l’avvio, senza passare a testo in chiaro, a un altro backend o a una sostituzione in memoria con la stessa richiesta di persistenza.

Il livello di persistenza LUKS2 MiniOS protegge i contenuti del filesystem quando il mapper è chiuso. Non protegge i dati dopo lo sblocco, i file di avvio non crittografati, i file copiati al di fuori del backend crittografato o un filesystem root nativo. La crittografia della persistenza a livelli non equivale alla crittografia della root nativa. Le esportazioni logiche contengono file di sessione decrittografati: proteggi separatamente gli archivi di backup. Usa una passphrase robusta e conserva un backup verificato.

L’archiviazione temporanea di cache o journal riduce le scritture, ma non offre crittografia. Con la persistenza durevole, MiniOS conserva `minios-boot` e `live-config` diagnostici nell’archivio della sessione, anche quando `LIVE_LOG_STORAGE=volatile`. Con SquashFS durevole, questi file si trovano all’esterno di `changes.sb`, nella directory `boot-logs/` della sessione. Con `perchtoram`, la sessione e i relativi dati diagnostici risiedono in memoria; la persistenza richiede che il salvataggio su disco vada a buon fine. Un dispositivo di archiviazione non crittografato espone i log insieme agli altri file. `LIVE_CONFIG_DEBUG=true` abilita inoltre tracce dettagliate e copie dei dati di input usati per l’unione degli account utente; lascia il debug disabilitato nell’uso quotidiano e controlla i log prima di condividerli. Vedi [Prestazioni](/maintenance-and-recovery/Performance#reduce-cache-and-log-writes-with-perch).

Vedi [Installatore MiniOS](/installing-minios/MiniOS-Installer) e [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Applicare gli aggiornamenti con attenzione

Nelle sessioni live persistenti, aggiorna i metadati dei pacchetti e installa gli aggiornamenti di sicurezza Debian con il normale flusso di lavoro APT, quando opportuno. Le modifiche APT apportate in una nuova sessione live scompaiono al riavvio. I moduli di base SquashFS sono di sola lettura; per aggiornare il sistema live di base, spesso la soluzione più pulita è sostituire l’ISO o i moduli con una versione più recente e affidabile di MiniOS. Dopo la conversione nativa, la manutenzione di sicurezza dei pacchetti segue semplicemente il normale flusso di lavoro APT di Debian per il sistema installato.

Vedi [Aggiornamenti software](/maintenance-and-recovery/Updating-MiniOS) per i flussi di lavoro distinti relativi ad APT, moduli, immagini e kernel.

Prima di un aggiornamento importante:

- Esegui il backup dei file importanti e delle sessioni persistenti.
- Verifica che lo spazio libero sia sufficiente.
- Evita di interrompere le scritture o spegnere il dispositivo.
- Riavvia e verifica il sistema aggiornato prima di eliminare il supporto o la sessione precedente di cui hai verificato il corretto funzionamento.

## Considera l’esecuzione di hook e preseed come esecuzione di codice

L’opzione di avvio `hooks` e gli hook di live-config possono eseguire file dal filesystem root, dal supporto di avvio o da un URL. Gli hook remoti, gli hook dei supporti modificati e i preseed non verificati possono essere eseguiti con privilegi di sistema. Usa solo file verificati provenienti da una fonte affidabile, preferisci la distribuzione autenticata ed evita gli hook remoti su reti non attendibili. Vedi [live-config](/reference/configuration/live-config) per l’ordine di esecuzione e i percorsi supportati.

## Esegui il backup e dismetti i supporti in sicurezza

La persistenza non è un backup. Conserva una copia separata dei file degli utenti ed esporta o copia le sessioni quando sono ancora integre. Verifica il ripristino su un supporto diverso.
Arresta il sistema correttamente prima di rimuovere un supporto scrivibile e lascia spazio libero per i metadati delle sessioni e il funzionamento del filesystem.

Prima di smaltire un dispositivo, cancellane i dati in modo sicuro, tenendo conto della tecnologia di archiviazione e della sensibilità dei dati. Eliminare i file o riformattare il dispositivo potrebbe non bastare a rendere irrecuperabili i vecchi dati.
