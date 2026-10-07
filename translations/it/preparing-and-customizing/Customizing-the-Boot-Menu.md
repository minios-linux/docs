---
updated: 2026-10-06
---

# Personalizzazione del menu di avvio

I menu di avvio MiniOS offrono voci pratiche per le modalità di avvio live più comuni. Questa guida spiega come selezionare e modificare tali voci.

## Panoramica

Le immagini MiniOS possono utilizzare GRUB o Syslinux a seconda del firmware, della struttura dell'immagine e della build. I loro menu, i tasti di modifica, la gestione della lingua e le voci disponibili possono differire. Il bootloader alla fine passa una riga di comando del kernel allo stesso initrd; consulta [Modalità di avvio](/using-minios/Boot-Modes) per informazioni su sorgente risultante, persistenza, comportamento di copia RAM e dipendenza dai supporti.

## Opzioni del menu di avvio

L'immagine fornita presenta solitamente queste scelte semantiche, anche se titoli, disponibilità, ordine e selezione predefinita possono variare a seconda dell'immagine:

| Scelta del menu | Selettore initrd tipico | Scopo |
|---|---|---|
| Avviare MiniOS | `perchdir=resume` | Prova la sessione compatibile predefinita e consenti la creazione di una nuova sessione secondo le condizioni documentate. |
| Avviare una nuova sessione | `perchdir=setup` | Apri il selettore del backend di persistenza, quindi crea una sessione aggiuntiva numerata mantenendo inalterate le sessioni esistenti. |
| Scegliere una sessione salvata | `perchdir=ask` | Seleziona interattivamente una sessione salvata esistente; se l'archiviazione è vuota, MiniOS avvia lo stesso flusso di configurazione per consentire la creazione della prima sessione. |
| Avviare senza salvare | nessun selettore di persistenza | Utilizza un layer scrivibile temporaneo in RAM. |
| Eseguire dalla RAM | `toram` | Copia i dati di sistema MiniOS su RAM; con la persistenza, il comando predefinito `perchtoram=trim` copia separatamente la sessione supportata selezionata. |

Questi sono selettori, non garanzie che l'archiviazione sia scrivibile, che la sessione sia compatibile, che RAM sia sufficiente o che il supporto di origine sia stato rimosso. Consulta [Modalità di avvio](/using-minios/Boot-Modes) per il comportamento e le combinazioni, [Persistenza initrd](/reference/boot-process/Persistence-Internals) per i casi limite dei selettori e [Ottimizzazione delle prestazioni](/maintenance-and-recovery/Performance) per RAM e compromessi I/O.

## Come utilizzare il menu di avvio

### Navigazione nel menu

- Usa **i tasti freccia** per spostarti tra le opzioni
- Premi **Invio** per selezionare un'opzione
- Premi **Esc** per tornare al menu precedente (in GRUB)
- La selezione automatica e la durata del timeout dipendono dalla configurazione attiva del menu; alcuni menu potrebbero attendere indefinitamente

### Selezione lingua (GRUB)

Se la tua chiavetta USB MiniOS supporta più lingue:
1. La prima schermata mostrerà le opzioni di lingua
2. Seleziona la lingua preferita
3. Il menu di avvio verrà visualizzato nella lingua selezionata
4. La selezione può anche trasmettere le impostazioni locali alle fasi successive dell'avvio, ma non garantisce che ogni messaggio di sistema o applicazione sia tradotto

**Importante:** Il menu multilingue sovrascrive qualsiasi impostazione locale specificata in `config.conf`. La lingua scelta nel menu di avvio ha la precedenza sulle impostazioni locali preconfigurate. Consulta **[File di configurazione](/reference/configuration/config.conf)** e **[live-config](/reference/configuration/live-config)** per dettagli sui file di configurazione di sistema.

## Personalizzazione delle opzioni di avvio

### Modifica temporanea dei parametri di avvio

Puoi modificare le opzioni di avvio per una singola sessione:

**In GRUB:**
1. Seleziona la voce di menu che vuoi modificare
2. Premi **'e'** per modificare
3. Vai alla riga che inizia con `linux`
4. Aggiungi o modifica i parametri alla fine della riga
5. Premi **Ctrl+X** o **F10** per avviare con le modifiche

**In SYSLINUX:**
1. Seleziona la voce di menu desiderata
2. Premi **Tab** prima di premere Invio
3. Aggiungi i parametri alla riga di comando che appare
4. Premi **Invio** per avviare

### Modifiche comuni ai parametri di avvio

- `debug` - Mostra messaggi dettagliati di avvio (utile per la risoluzione dei problemi)
- `toram=trim` - Copia il set di moduli filtrato e i dati minimi necessari su RAM
- `perchsize=2000` - Imposta la dimensione dello storage di sessione a 2GB (modificabile secondo necessità)
- `locales=ru_RU.UTF-8` - Richiedi una lingua/locale specifica

Per l'elenco completo dei parametri di avvio disponibili, consulta **[Parametri di avvio](/reference/Boot-Parameters)**.

## Posizioni dei file di configurazione

### Sulla tua chiavetta USB MiniOS

- **Configurazione GRUB:** `/minios/boot/grub/grub.cfg`
- **Configurazione SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Immagini di avvio:** `/minios/boot/bootlogo.png`
- **File lingua:** `/minios/boot/grub/locale/`

### Nel sistema in esecuzione

- **Parametri di avvio attuali:** `/proc/cmdline`
- **Directory dati MiniOS:** `/run/initramfs/memory/data/minios/`

### Modifica dei file di configurazione

**Attenzione:** Modifica i file di configurazione di avvio solo se sai cosa stai facendo. Cambiamenti errati possono rendere la chiavetta USB non avviabile.

**Per modificare la configurazione di GRUB:**
1. Monta la chiavetta USB MiniOS
2. Vai su `/minios/boot/grub/`
3. Modifica `grub.cfg` con un editor di testo
4. Salva ed espelli in modo sicuro la chiavetta USB

**Modifiche comuni:**
- Modifica la direttiva di timeout utilizzata dal menu GRUB o Syslinux attivo
- Cambia `set default=0` per modificare l'opzione di menu predefinita
- Aggiungi voci personalizzate al menu
