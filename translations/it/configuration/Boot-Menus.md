---
updated: 2026-08-26
---

# Guida ai menu di avvio di MiniOS

I menu di avvio di MiniOS offrono voci pratiche per le modalità di avvio live più comuni. Questa guida spiega come selezionare ed eventualmente modificare tali voci.

## Panoramica

Le immagini MiniOS possono utilizzare GRUB o Syslinux a seconda del firmware, della struttura dell’immagine e della build. I grafici dei menu, i tasti di modifica, la gestione delle lingue e le voci disponibili possono non essere identici. Il bootloader infine passa una riga di comando del kernel allo stesso initrd; consulta [Modalità di avvio](/configuration/Boot-Modes.md) per il comportamento relativo a origine, persistenza, copia in RAM e dipendenza dal supporto.

## Opzioni del menu di avvio

L’immagine fornita presenta comunemente queste scelte semantiche, anche se titoli, disponibilità, ordine e selezione predefinita possono variare a seconda dell’immagine:

| Scelta menu | Selettore initrd tipico | Scopo |
|---|---|---|
| Riprendi sessione precedente | `perchdir=resume` | Prova la sessione compatibile predefinita e consenti la creazione di una nuova sessione secondo le condizioni documentate. |
| Avvia una nuova sessione | `perchdir=new` | Alloca una nuova sessione persistente numerata. |
| Scegli sessione all’avvio | `perchdir=ask` | Seleziona una sessione esistente o richiedine una nuova in modo interattivo. |
| Avvio pulito | nessun selettore di persistenza | Usa un layer temporaneo scrivibile. |
| Copia in RAM | `toram` | Richiede il percorso completo di copia in RAM. |

Questi sono selettori, non garanzie che lo storage sia scrivibile, che la sessione sia compatibile, che la RAM sia sufficiente o che il supporto di origine sia stato rimosso. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) per comportamento e combinazioni, [Persistenza initrd](/configuration/Initrd-Persistence.md) per casi limite dei selettori e [Ottimizzazione delle prestazioni](/administration/Performance-Optimization.md) per compromessi tra RAM e I/O.

## Come utilizzare il menu di avvio

### Navigazione del menu

- Usa i **tasti freccia** per spostarti tra le opzioni
- Premi **Invio** per selezionare un’opzione
- Premi **Esc** per tornare al menu precedente (in GRUB)
- La selezione automatica e la durata del timeout dipendono dalla configurazione attiva del menu; alcuni menu possono attendere indefinitamente

### Selezione della lingua (GRUB)

Se la tua chiavetta USB MiniOS supporta più lingue:
1. La prima schermata mostrerà le opzioni di lingua
2. Seleziona la lingua preferita
3. Il menu di avvio apparirà nella lingua selezionata
4. La selezione può anche trasmettere le impostazioni locali alle fasi successive dell'avvio, ma non garantisce che ogni messaggio di avvio o applicazione sia tradotto

**Importante:** Il menu multilingue sovrascrive qualsiasi impostazione locale specificata in `config.conf`. La lingua selezionata nel menu di avvio ha la precedenza sulle impostazioni locali preconfigurate. Consulta **[File di configurazione](/configuration/Configuration-File.md)** e **[live-config](/configuration/live-config.md)** per dettagli sui file di configurazione di sistema.

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
2. Premi **Tab** prima di Invio
3. Aggiungi i parametri alla riga di comando che appare
4. Premi **Invio** per avviare

### Modifiche comuni ai parametri di avvio

- `debug` - Mostra messaggi di avvio dettagliati (utile per la diagnostica)
- `toram=trim` - Copia il set di moduli filtrati e i dati necessari limitati in RAM
- `perchsize=2000` - Imposta la dimensione dello storage della sessione a 2GB (modificabile)
- `locales=ru_RU.UTF-8` - Richiede una lingua/locale specifico

Per l’elenco completo dei parametri di avvio disponibili, consulta **[Parametri di avvio](/configuration/Boot-Parameters.md)**.

## Posizioni dei file di configurazione

### Sulla tua chiavetta USB MiniOS

- **Configurazione GRUB:** `/minios/boot/grub/grub.cfg`
- **Configurazione SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Immagini di avvio:** `/minios/boot/bootlogo.png`
- **File di lingua:** `/minios/boot/grub/locale/`

### Nel sistema in esecuzione

- **Parametri di avvio correnti:** `/proc/cmdline`
- **Directory dati MiniOS:** `/run/initramfs/memory/data/minios/`

### Modifica dei file di configurazione

**Attenzione:** Modifica i file di configurazione dell'avvio solo se sai cosa stai facendo. Modifiche errate possono rendere la tua chiavetta USB inutilizzabile all'avvio.

**Per modificare la configurazione di GRUB:**
1. Monta la tua chiavetta USB MiniOS
2. Vai a `/minios/boot/grub/`
3. Modifica `grub.cfg` con un editor di testo
4. Salva ed espelli la chiavetta USB in modo sicuro

**Modifiche comuni:**
- Modificare la direttiva di timeout utilizzata dal menu GRUB o Syslinux attivo
- Cambiare `set default=0` per modificare l'opzione di menu predefinita
- Aggiungere voci personalizzate al menu
