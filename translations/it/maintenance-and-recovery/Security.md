---
updated: 2026-08-31
---

# Sicurezza

I controlli di sicurezza di MiniOS sono progettati attorno al sistema live: sessioni temporanee, sessioni persistenti, supporti portatili e configurazione all'avvio. L'Installatore MiniOS può anche eseguire una conversione nativa. Il sistema risultante mantiene l'ambiente desktop selezionato e l'identità visiva di MiniOS, ma il software specifico per MiniOS viene rimosso, così da poterlo gestire e mantenere in sicurezza con i normali strumenti Debian, invece di trattarlo come un'altra modalità live.
Proteggi la sessione in esecuzione, i dati persistenti, il supporto di avvio e qualsiasi configurazione applicata all'avvio.

## Inizia da supporti affidabili

Scarica MiniOS da una fonte ufficiale e verifica l'ISO prima di scriverlo.
Segui la guida [Verifica dei download](/installing-minios/Verifying-Downloads) e confronta il risultato prima di avviare o installare. La verifica rileva un download danneggiato o sostituito; non garantisce che un dispositivo USB già modificato sia sicuro.

Tieni il dispositivo USB sotto controllo fisico. Le password del firmware e l'ordine di avvio limitato possono ridurre l'avvio non autorizzato occasionale, ma non cifrano i file presenti sul dispositivo. Secure Boot può offrire una protezione aggiuntiva della catena di avvio su immagini e hardware che la supportano; verifica il comportamento effettivo della release e del firmware invece di presumere il supporto.

## Sostituire le credenziali predefinite

Un'immagine live MiniOS non personalizzata utilizza le credenziali pubblicate `live` / `evil` e `root` / `toor`, con accesso automatico e privilegi amministrativi senza password nella sua configurazione orientata alla praticità. Chiunque possa accedere al sistema potrebbe usare queste credenziali, soprattutto se SSH è attivo.

Prima di collegarsi a una rete non affidabile:

1. Imposta password uniche per utente e root nel Configuratore MiniOS.
2. Seleziona un profilo di sicurezza appropriato e verifica ogni controllo popolato.
3. Disattiva SSH e XRDP a meno che l'accesso remoto non sia necessario.
4. Riavvia in una nuova sessione quando modifichi impostazioni di account o sicurezza "one-shot", quindi verifica il comportamento di accesso e privilegi risultante.

Il Configuratore salva gli hash delle password crittografati invece delle password in chiaro. Se stai cambiando un account persistente già creato, usa `passwd` per l'utente corrente e `sudo passwd root` per root. Dopo la conversione nativa, utilizza i normali strumenti di gestione account di Debian.

## Utilizzare i controlli di sicurezza del Configuratore

Il Configuratore MiniOS offre tre profili. Un profilo imposta configurazioni concrete; il nome del profilo stesso non viene salvato come chiave di configurazione runtime, e ogni impostazione resta modificabile in modo indipendente.

| Profilo | Comportamento principale |
| --- | --- |
| `convenient` | Compatibile con autologin, sudo e PolicyKit senza password, SSH root e password consentiti, XRDP/X11/schermata di blocco rilassati, suggerimenti password visibili. |
| `balanced` | Nessun autologin, sudo e PolicyKit con password obbligatoria, accesso SSH root negato ma SSH con password consentito, XRDP/X11/schermata di blocco rafforzati. |
| `strict` | Nessun autologin, sudo e PolicyKit con password obbligatoria, accesso SSH root e con password negato, XRDP disabilitato, X11/schermata di blocco rafforzati, suggerimenti password nascosti. |

Le impostazioni predefinite dell'installatore variano in base alla modalità di distribuzione: le installazioni live privilegiano `convenient`, mentre la conversione nativa parte da `balanced`. L'impostazione nativa viene applicata durante la conversione; dopo l'installazione, usa la normale configurazione di sicurezza Debian. Questi sono valori predefiniti, non raccomandazioni per ogni modello di minaccia.

Le stesse impostazioni sono disponibili come chiavi di configurazione documentate, inclusi `LIVE_SUDO_MODE`, `LIVE_POLKIT_MODE`, `LIVE_SSH_PERMIT_ROOT_LOGIN`, `LIVE_SSH_PASSWORD_AUTHENTICATION`, `LIVE_XRDP_MODE`, `LIVE_X11_MODE`, `LIVE_ISSUE_PASSWORD_HINTS` e `LIVE_LOCKSCREEN_MODE`. Preferisci queste chiavi o il Configuratore rispetto alla modifica diretta dei file sudoers, PolicyKit, display-manager o SSH generati. Consulta [File di configurazione](/reference/configuration/config.conf).
Per il comportamento del salvataggio e l'applicabilità delle impostazioni, vedi [Configuratore MiniOS](/preparing-and-customizing/Preconfiguring-MiniOS).

Creazione account, password, `LIVE_CONFIG_NOROOT` e il profilo di sicurezza sono impostazioni "one-shot" usate quando viene creata una nuova sessione. Il Configuratore mostra l'applicabilità di ogni controllo. Le impostazioni riconfigurabili, come i servizi, vengono applicate dopo il riavvio.

## Proteggi l'accesso remoto

SSH può essere abilitato in un'immagine MiniOS per scopi di recupero. In una rete dove altri utenti non sono affidabili, considera che le credenziali predefinite pubblicate siano esposte finché non hai confermato il contrario.

- Se SSH non è necessario, aggiungi `ssh` a `DISABLE_SERVICES` nel Configuratore e rimuovilo da `ENABLE_SERVICES` se presente.
- Se SSH è richiesto, nega l'accesso root con `LIVE_SSH_PERMIT_ROOT_LOGIN=false`.
- Preferisci l'autenticazione tramite chiave. Conferma l'accesso tramite chiave in una connessione separata prima di impostare `LIVE_SSH_PASSWORD_AUTHENTICATION=false`.
- Limita l'accesso in ingresso tramite firewall di rete o router e non esporre direttamente a Internet un sistema di recupero portatile.
- Valuta XRDP separatamente. Il profilo restrittivo lo disabilita; quello bilanciato lo rafforza ma non necessariamente ne disabilita il servizio.

I parametri di avvio possono sovrascrivere i valori del file di configurazione. Analizza comportamenti inattesi dei servizi confrontandoli con [Parametri di avvio](/reference/Boot-Parameters).

## Crittografare i dati persistenti

La persistenza nativa, DynFileFS e raw non crittografate possono essere lette da chiunque ottenga il dispositivo. L'Installatore MiniOS può configurare un contenitore LUKS crittografato per una sessione live quando l'initrd sorgente supporta LUKS. L'initrd crea `changes.luks` al primo avvio e richiede la relativa passphrase; l'installatore non riceve né memorizza tale passphrase.

La persistenza LUKS protegge i contenuti mentre il contenitore è chiuso. Non protegge i dati dopo lo sblocco, i file di avvio non crittografati, i file copiati fuori dal contenitore o un filesystem root nativo. La persistenza della sessione LUKS non è la crittografia del root nativo. Utilizzare una passphrase robusta e conservare un backup testato.

Vedi [Installatore MiniOS](/installing-minios/MiniOS-Installer) e [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Applicare gli aggiornamenti in modo deliberato

Aggiorna i metadati dei pacchetti e installa gli aggiornamenti di sicurezza Debian nelle sessioni live persistenti utilizzando il normale flusso di lavoro APT, quando opportuno. Le modifiche APT in una nuova sessione live vengono perse al riavvio. I moduli base SquashFS sono in sola lettura, quindi sostituire l'ISO o i moduli con una nuova release MiniOS affidabile è spesso il modo più pulito per aggiornare il sistema live di base. Dopo la conversione nativa, la manutenzione della sicurezza dei pacchetti segue semplicemente il normale flusso di lavoro APT di Debian per quel sistema installato.

Consulta [Aggiornamenti software](/maintenance-and-recovery/Updating-MiniOS) per i diversi flussi di lavoro di APT, moduli, immagini e kernel.

Prima di un aggiornamento importante:

- Esegui il backup dei file importanti e delle sessioni persistenti.
- Verifica che ci sia spazio libero sufficiente.
- Evita di interrompere le scritture o spegnere il dispositivo.
- Riavvia e verifica il sistema aggiornato prima di eliminare i supporti o le sessioni precedenti considerate affidabili.

## Considera hook e preseeding come esecuzione di codice

L'opzione di avvio `hooks` e gli hook di live-config possono eseguire file dal filesystem root, dal supporto di avvio o da un URL. Hook remoti, hook su supporti modificati e preseeding non verificati possono essere eseguiti con privilegi di sistema. Usa solo file verificati provenienti da fonti affidabili, preferisci la distribuzione autenticata ed evita hook remoti su reti non affidabili. Consulta [live-config](/reference/configuration/live-config) per l'ordine di esecuzione e le posizioni supportate.

## Esegui backup e smaltisci i supporti in sicurezza

La persistenza non è un backup. Conserva una copia separata dei file utente ed esporta o copia le sessioni mentre sono integre. Verifica il ripristino su supporti diversi.
Spegni correttamente prima di rimuovere supporti scrivibili e mantieni spazio libero per i metadati di sessione e il funzionamento del filesystem.

Prima di smaltire un dispositivo, cancellalo in modo sicuro in base alla tecnologia di archiviazione e alla sensibilità dei dati. Eliminare i file o riformattare potrebbe non rendere i vecchi dati irrecuperabili.
