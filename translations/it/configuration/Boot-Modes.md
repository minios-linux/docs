# Modalità di avvio di MiniOS

Le modalità di avvio descrivono da dove proviene il sistema live, se il suo layer scrivibile è temporaneo o persistente e se MiniOS copia la sua sorgente in RAM. Non descrivono un firmware o un protocollo di bootloader diverso. GRUB, Syslinux, Ventoy o un loader PXE avviano la stessa pipeline di early-userspace di MiniOS caricando un kernel e un initramfs con una riga di comando del kernel.

Usa questa pagina per scegliere una modalità e comprendere le dipendenze risultanti. Per le singole opzioni della riga di comando, vedi [Parametri di avvio](/configuration/Boot-Parameters.md). Per le voci fornite da un'immagine, consulta [Menu di avvio](/configuration/Boot-Menus.md).

## Firmware, bootloader ed early userspace

Firmware e bootloader vengono eseguiti prima che MiniOS possa ispezionare i moduli live o le sessioni. BIOS o UEFI avviano un bootloader locale, oppure il firmware di rete avvia un loader PXE. Quel loader sceglie e carica il kernel e l'initramfs di MiniOS e passa la loro riga di comando. Anche Ventoy appartiene a questo livello: presenta una ISO tramite il proprio ambiente di avvio prima che l'early userspace di MiniOS la rilevi.

Il kernel avvia quindi l'initramfs di MiniOS. Questo early userspace rileva la sorgente live, prepara eventuali copie in RAM e la persistenza, monta i moduli e costruisce il filesystem root. Un'etichetta di menu come Fresh Start o Resume Previous Session è quindi principalmente una scelta comoda di parametri per l'initramfs, non una diversa implementazione di bootloader.

Le installazioni native sono differenti. Avviano una root Linux convenzionale espansa con il GRUB e l'initramfs del sistema installato. Non utilizzano la pipeline live modulare descritta di seguito.

## Sequenza di avvio live

La pipeline live viene eseguita in questo ordine:

1. **Carica kernel e initramfs.** Il bootloader selezionato dal firmware carica entrambi i file e fornisce la riga di comando del kernel. A questo punto non è stato ancora assemblato alcun root SquashFS di MiniOS.
2. **Rileva la sorgente.** L'initramfs cerca dispositivi a blocchi locali, segue una posizione `from=` esplicita, monta in loop una ISO locale, monta una ISO HTTP o scarica il set di dati PXE. Il rilevamento della sorgente e quello della persistenza sono operazioni correlate ma distinte.
3. **Copia in RAM se richiesto.** Le opzioni `toram` e `toram=full` copiano l'intero albero dati di MiniOS, in base alla gestione della persistenza. `toram=trim` copia invece solo i moduli selezionati e la configurazione richiesta. L'initramfs tenta quindi di scollegare la sorgente originale. Il completamento della copia non garantisce che il distacco sia riuscito.
4. **Seleziona la persistenza.** Se richiesta, l'initramfs individua la posizione e la sessione di persistenza, le verifica e prepara il layer scrivibile. Resume, new e la selezione interattiva differiscono solo per il modo in cui la sessione viene scelta o creata. Senza richiesta di persistenza, il layer scrivibile è su memoria RAM.
5. **Riconcilia il set di kernel in esecuzione.** Il kernel è già in esecuzione e non può essere cambiato a questo punto. MiniOS verifica che l'albero dati attivo abbia il modulo `01-kernel`, l'immagine del kernel e l'initramfs corrispondenti al kernel in esecuzione. Se il set completo e corrispondente esiste nel repository dei kernel inattivi, MiniOS tenta di attivarlo e sposta gli altri set di kernel attivi nel repository. Si tratta di una riconciliazione di file, non di un fallback del kernel o di uno switch in-place.
6. **Monta i moduli.** I file `.sb` selezionati dall'albero dati di MiniOS e da eventuali store di moduli scrivibili vengono ordinati, filtrati tramite `load=` e `noload=`, e montati in loop in sola lettura.
7. **Costruisci AUFS o OverlayFS.** MiniOS combina i moduli montati con un layer scrivibile. AUFS aggiunge i mount dei moduli ordinati come rami in sola lettura. OverlayFS riceve l'elenco completo e ordinato delle directory inferiori più le sue directory upper e work quando viene montata la root. L'unione risultante è il filesystem root live.
8. **Applica `rootcopy` ed esegue `minios-boot`.** I file presenti nella directory `rootcopy/` della sorgente vengono copiati nella root assemblata. L'initramfs esegue quindi `minios-boot` in chroot per sincronizzare la configurazione di MiniOS e applicare le impostazioni utenti di early boot. Prepara anche `fstab` ed esegue un eventuale hook `rootcopy/run/preinit.sh` prima del passaggio finale.
9. **Passaggio all'userspace normale.** LiveKit usa `pivot_root` per il passaggio finale, mentre dracut prepara la stessa root assemblata ed esegue il `switch_root` finale. Il sistema di init installato avvia quindi i servizi normali e la sessione desktop o console. Le impostazioni di rete recuperate in early boot non sono la configurazione di rete persistente dell'userspace.

I dettagli sui contratti di rilevamento, moduli e persistenza sono documentati in [Rilevamento sistema Initrd](/configuration/Initrd-System-Discovery.md), [Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md).

## Matrice delle modalità

| Modalità | Sorgente live | Layer scrivibile | Dipendenza dalla sorgente dopo l'avvio |
|------|-------------|----------------|------------------------------|
| Fresh local | Albero locale `minios/` o ISO locale | RAM temporanea | Rimane a meno che una copia `toram` non persistente richiesta non la scolleghi con successo. |
| Persistent resume | Store di persistenza locale o selezionato esplicitamente | Sessione compatibile esistente se disponibile | Sorgente e storage di persistenza rimangono normalmente in uso. Resume non garantisce il recupero di ogni sessione mancante o danneggiata. |
| Persistent new | Store di persistenza scrivibile | Sessione numerata appena allocata | Sorgente e storage di persistenza rimangono in uso. La creazione richiede storage scrivibile compatibile e spazio sufficiente. |
| Persistent choose | Scelta interattiva di posizione e sessione di persistenza | Sessione selezionata o appena creata | Dipende dalla sorgente e dallo store di persistenza selezionati. La selezione non rende sicura una sessione incompatibile. |
| Bare o full `toram` | Qualsiasi sorgente live rilevabile | RAM temporanea a meno che non sia richiesta anche la persistenza | Bare `toram` significa `toram=full`. Il supporto è rimovibile solo dopo il distacco riuscito della sorgente non persistente. |
| Trim `toram` | Qualsiasi sorgente live rilevabile | RAM temporanea a meno che non sia richiesta anche la persistenza | Copia solo il set di moduli filtrato e i dati necessari. Si applica la stessa condizione di distacco. |
| ISO locale o Ventoy | ISO montata in loop o ISO presentata da Ventoy | RAM temporanea o sessione selezionata separatamente | La ISO e i mapping sottostanti rimangono necessari a meno che una `toram` non persistente li scolleghi con successo. |
| HTTP ISO | ISO montata tramite `httpfs2` via HTTP | RAM temporanea o sessione selezionata separatamente | Il percorso di fetch e la rete restano rilevanti finché la root è supportata da httpfs; `toram` può rimuovere questa dipendenza solo se il distacco riesce. |
| PXE | Kernel e initramfs dal loader, dati MiniOS scaricati dall'initramfs | RAM temporanea o sessione selezionata separatamente | Il networking iniziale serve per caricare i dati, non per la policy di rete della sessione. Le dipendenze esatte dipendono da ciò che è stato scaricato e montato. |
| Installazione nativa | Root installata espansa, non moduli live `.sb` | Filesystem normali installati | Non usa rilevamento live, sessioni live, `toram`, unione di moduli o questa pipeline di handoff live. |

## Combinazioni e limiti

Le scelte di sorgente, persistenza e copia in RAM sono assi separati. Una directory locale, una ISO locale, una ISO HTTP o una sorgente dati PXE possono fornire moduli live. La persistenza può poi essere omessa, ripresa, creata o selezionata dove supportato. `toram=full` o `toram=trim` possono essere richiesti con una sorgente live supportata.

Persistenza e `toram` possono essere presenti insieme, ma non è lo stesso contratto dell'operazione persistente ordinaria. MiniOS copia i dati della sessione richiesta nell'albero dati RAM prima dell'impostazione della persistenza. Non dare per scontato che le scritture successive vengano salvate nello store originale, e non rimuovere il supporto sulla sola base dell'opzione `toram`. Il limite per i supporti rimovibili è più stretto: la rimozione è sicura solo dopo che MiniOS ha scollegato con successo una copia RAM **non persistente** dalla sorgente originale. Se il distacco fallisce, la sorgente rimane montata. Per Ventoy, MiniOS rilascia i suoi mapping solo dopo quel distacco non persistente riuscito; la pulizia dei mapping è best-effort.

`toram=trim` rispetta i filtri di selezione dei moduli, quindi un modulo escluso non è disponibile solo perché il supporto originale esiste ancora. La modalità full `toram` richiede RAM sufficiente per i dati copiati, mentre la modalità trim necessita comunque di RAM sufficiente per il set selezionato e il carico scrivibile. Nessuna delle due modalità garantisce che una macchina sottodimensionata si avvii correttamente.

HTTP ISO e PXE networking appartengono all'initramfs. Un `from=http://...` letterale ha la precedenza e può usare `ip=` per un indirizzamento statico iniziale. Senza quella sorgente HTTP ISO, una `ip=` non vuota seleziona il percorso dati PXE e salta il rilevamento dei media locali. Non è un indirizzo statico per il desktop in esecuzione. HTTP ISO supporta `http://`, non `https://`. Se una root HTTP non è stata scollegata in RAM, una successiva riconfigurazione di rete può interrompere la sua sorgente. Consulta [Avvio da rete](/installation/Network-Boot.md) prima di combinare il caricamento da rete con modifiche di rete in userspace.

La persistenza richiede un target scrivibile e una modalità adeguati. I supporti in sola lettura non possono ospitare una nuova sessione, la persistenza cifrata non diventa automaticamente non cifrata se l'attivazione fallisce e l'accettazione interattiva non elimina i rischi di compatibilità della sessione. Consulta [Gestione sessioni](/configuration/Session-Management.md) per modalità di storage, compatibilità e regole di recupero.

## Guida alle decisioni

| Obiettivo | Inizia con | Controlla prima di affidarti |
|------|------------|----------------------------|
| Testare MiniOS senza salvare le modifiche | Fresh local | Le sessioni esistenti non vengono selezionate; il supporto di origine rimane in uso. |
| Continuare il lavoro normale | Persistent resume | Il target di persistenza è scrivibile e la sessione è compatibile. |
| Mantenere una vecchia sessione e partire da zero | Persistent new | C'è spazio sufficiente e il filesystem supporta la modalità di persistenza scelta. |
| Selezionare tra diversi workspace | Persistent choose | Puoi identificare il dispositivo e la sessione desiderati; verifica gli avvisi di compatibilità. |
| Rimuovere il supporto locale dopo l'avvio | `toram` o `toram=trim` non persistente | Attendi il distacco riuscito della sorgente. Non dedurre il successo dall'etichetta del menu. |
| Ridurre l'uso di RAM durante la copia in RAM | `toram=trim` | Il risultato `load=` e `noload=` contiene tutti i moduli necessari al sistema. |
| Avviare una ISO memorizzata su disco locale o dispositivo Ventoy | Scoperta ISO locale | Mantieni disponibile il filesystem host e i mapping a meno che il distacco non sia confermato. |
| Caricare una ISO da un server web | HTTP ISO | Networking cablato nell'initramfs, disponibilità HTTP semplice e accesso continuo alla sorgente. |
| Caricare dati MiniOS da infrastruttura di distribuzione | PXE | Sintassi `ip=` MiniOS corretta e interfaccia cablata supportata; non trattarlo come configurazione di rete in userspace. |
| Eseguire MiniOS come sistema installato convenzionale | Installazione nativa | Segui la documentazione di installazione e recupero nativa, non le procedure di sessione live o `toram`. |

Quando un avvio fallisce prima che la root live sia assemblata, identifica innanzitutto se il problema è nello startup di firmware/bootloader, nel rilevamento della sorgente, nella persistenza, nel montaggio dei moduli o nella costruzione della root. Evita comandi di riparazione finché la struttura dello storage non è nota. Consulta [Recupero avvio](/administration/Boot-Recovery.md).

## Documentazione correlata

- [Rilevamento sistema Initrd](/configuration/Initrd-System-Discovery.md)
- [Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistenza Initrd](/configuration/Initrd-Persistence.md)
- [Parametri di avvio](/configuration/Boot-Parameters.md)
- [Menu di avvio](/configuration/Boot-Menus.md)
- [Avvio da rete](/installation/Network-Boot.md)
- [Gestione sessioni](/configuration/Session-Management.md)
- [Architettura di sistema](/about/System-Architecture.md)
- [Recupero avvio](/administration/Boot-Recovery.md)
