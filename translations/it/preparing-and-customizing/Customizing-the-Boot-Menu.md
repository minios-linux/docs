---
updated: 2026-10-15
---

# Personalizzare il menu di avvio

I menu di avvio MiniOS offrono comode voci per le modalità di avvio live più comuni. Questa guida spiega come selezionare e modificare queste voci.

## Panoramica

Le immagini MiniOS possono usare GRUB o Syslinux a seconda del firmware, della struttura dell’immagine e della build. I menu, i tasti di modifica, la gestione delle lingue e le voci disponibili potrebbero non essere identici. Il bootloader passa infine una riga di comando del kernel allo stesso initrd; consulta [Modalità di avvio](/using-minios/Boot-Modes) per informazioni sul comportamento risultante in termini di sorgente, persistenza, copia RAM e dipendenza dal supporto.

## Opzioni del menu di avvio

L'immagine fornita presenta in genere queste opzioni, sebbene i titoli, la disponibilità, l'ordine e la selezione predefinita possano variare in base all'immagine:

| Opzione del menu | Selettore tipico dell'initrd | Scopo |
|---|---|---|
| Avviare MiniOS | `perchdir=resume` | Provare la sessione compatibile predefinita e consentire la creazione di una sostituzione alle condizioni documentate. |
| Avviare una nuova sessione | `perchdir=setup` | Aprire la scelta del backend di persistenza, quindi creare una sessione numerata aggiuntiva senza modificare quelle esistenti. |
| Scegliere una sessione salvata | `perchdir=ask` | Selezionare interattivamente una sessione salvata esistente; se lo spazio di archiviazione è vuoto, MiniOS avvia la stessa procedura di configurazione, così da poter creare la prima sessione. |
| Avviare senza salvare | nessun selettore di persistenza | Usare un livello scrivibile temporaneo in RAM. |
| Eseguire dalla RAM | `toram` | Copiare i dati di sistema di MiniOS in RAM; con la persistenza, l'opzione predefinita `perchtoram=trim` copia separatamente la sessione supportata selezionata. |

Questi sono selettori, non garanzie che lo spazio di archiviazione sia scrivibile, che una sessione sia compatibile, che RAM sia sufficiente o che il supporto sorgente sia stato scollegato. Per informazioni sul comportamento e sulle combinazioni, consulta [Modalità di avvio](/using-minios/Boot-Modes); per i casi limite dei selettori, consulta [Persistenza dell'initrd](/reference/boot-process/Persistence-Internals); per i compromessi in termini di prestazioni e I/O, consulta [Ottimizzazione delle prestazioni](/maintenance-and-recovery/Performance) per RAM e i compromessi relativi all'I/O.

## Come usare il menu di avvio

### Navigare nel menu

- Usa **i tasti freccia** per spostarti tra le opzioni
- Premi **Invio** per selezionare un'opzione
- Premi **Esc** per tornare al menu precedente (in GRUB)
- La selezione automatica e la durata del timeout dipendono dalla configurazione del menu attivo; alcuni menu potrebbero attendere a tempo indeterminato

### Guida e selezione della lingua

Gli attuali menu multilingue di GRUB e i menu nativi di SYSLINUX si avviano mostrando le modalità di avvio, non una schermata di selezione della lingua. **F1** apre la guida all'avvio e **F2** apre la selezione della lingua. Scegliendo una lingua si torna al menu delle modalità tradotto. I supporti con una sola lingua includono la guida, ma non offrono la navigazione tra lingue non disponibili.

Il menu multilingue iniziale mantiene attive le impostazioni locali configurate per il sistema. Solo la selezione esplicita di una lingua aggiunge impostazioni locali che sostituiscono `config.conf` per quell'avvio. Ciò non garantisce che tutti i messaggi di avvio o delle applicazioni siano tradotti. Vedi [File di configurazione](/reference/configuration/config.conf) e [live-config](/reference/configuration/live-config).

## Personalizzare le opzioni di avvio

### Modificare temporaneamente i parametri di avvio

Puoi modificare le opzioni di avvio per una singola sessione:

**In GRUB:**
1. Seleziona la voce di menu da modificare
2. Premi **'e'** per modificarla
3. Vai alla riga che inizia con `linux`
4. Aggiungi o modifica i parametri alla fine della riga
5. Premi **Ctrl+X** o **F10** per avviare con le modifiche

**In SYSLINUX:**
1. Seleziona la voce di menu desiderata
2. Premi **Tab** prima di premere Invio
3. Aggiungi i parametri alla riga di comando visualizzata
4. Premi **Invio** per avviare

### Modifiche comuni ai parametri di avvio

- `debug` - Mostra messaggi di avvio dettagliati (utili per la risoluzione dei problemi)
- `toram=trim` - Copia il set di moduli filtrato e i dati necessari limitati in RAM
- `perchsize=2000` - Richiede 2000 MiB per un container supportato nuovo o in espansione; non determina le dimensioni delle sessioni native o SquashFS
- `locales=ru_RU.UTF-8` - Richiede una lingua/locale specifica

Per l'elenco completo dei parametri di avvio disponibili, consulta **[Parametri di avvio](/reference/Boot-Parameters)**.

## Posizioni dei file di configurazione

### Sull'unità USB MiniOS

- **Configurazione di GRUB:** `/minios/boot/grub/grub.cfg`
- **Menu delle modalità e delle lingue di GRUB:** `/minios/boot/grub/main.cfg` e `/minios/boot/grub/languages.cfg`; le build localizzate possono selezionare altri file generati
- **Configurazione di SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Grafica di avvio:** esamina l'impostazione SYSLINUX attiva `MENU BACKGROUND` o il tema di GRUB; i percorsi dipendono dal bootloader selezionato
- **File delle lingue:** `/minios/boot/grub/locale/`

### Nel sistema in esecuzione

- **Parametri di avvio correnti:** `/proc/cmdline`
- **Directory dei dati di MiniOS:** `/run/initramfs/memory/data/minios/`

### Modifica dei file di configurazione

**Attenzione:** Modifica i file di configurazione dell’avvio solo se sai cosa stai facendo. Modifiche errate possono impedire l’avvio dall’unità USB.

**Per modificare la configurazione di GRUB:**
1. Monta l’unità USB MiniOS
2. Vai a `/minios/boot/grub/`
3. Modifica `grub.cfg` con un editor di testo
4. Salva ed espelli in sicurezza l’unità USB

**Modifiche comuni:**
- Modifica la direttiva di timeout usata dal menu GRUB o Syslinux attivo
- Modifica `set default=0` per cambiare l’opzione predefinita del menu
- Aggiungi voci personalizzate al menu
