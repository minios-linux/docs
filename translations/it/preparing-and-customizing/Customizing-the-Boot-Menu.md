---
updated: 2026-08-28
---

# Personalizzazione del menu di avvio

I menu di avvio MiniOS offrono voci pratiche per le modalità di avvio live più comuni. Questa guida spiega come selezionare e modificare tali voci.

## Panoramica

Le immagini MiniOS possono utilizzare GRUB o Syslinux a seconda del firmware, della struttura dell’immagine e della build. Le loro interfacce grafiche di menu, i tasti di modifica, la gestione della lingua e le voci disponibili non sono necessariamente identiche. Il bootloader passa infine la riga di comando del kernel allo stesso initrd; consulta [Modalità di avvio](/using-minios/Boot-Modes) per la provenienza risultante, la persistenza, il comportamento di copia RAM e la dipendenza dal supporto.

## Opzioni del menu di avvio

L’immagine fornita presenta comunemente queste scelte semantiche, anche se titoli, disponibilità, ordine e selezione predefinita possono variare a seconda dell’immagine:

| Scelta menu | Selettore initrd tipico | Scopo |
|---|---|---|
| Avvia MiniOS | `perchdir=resume` | Prova la sessione compatibile predefinita e consenti la creazione di una sostituzione nelle condizioni documentate. |
| Avvia una nuova sessione | `perchdir=new` | Crea una sessione persistente aggiuntiva numerata mantenendo inalterate le sessioni esistenti. |
| Scegli una sessione salvata | `perchdir=ask` | Seleziona interattivamente una sessione salvata esistente. Usa **Avvia una nuova sessione** se l’archiviazione è vuota. |
| Avvia senza salvare | nessun selettore di persistenza | Usa un layer temporaneo scrivibile in RAM. |
| Esegui da RAM | `toram` | Copia l’intero albero dati MiniOS su RAM e tenta di scollegare la sorgente. |

Questi sono selettori, non garanzie che l’archiviazione sia scrivibile, che una sessione sia compatibile, che la RAM sia sufficiente o che il supporto di origine sia stato scollegato. Consulta [Modalità di avvio](/using-minios/Boot-Modes) per comportamento e combinazioni, [Persistenza initrd](/reference/boot-process/Persistence-Internals) per casi limite dei selettori e [Ottimizzazione delle prestazioni](/maintenance-and-recovery/Performance) per RAM e compromessi tra prestazioni e I/O.

## Come utilizzare il menu di avvio

### Navigazione nel menu

- Usa le **frecce direzionali** per spostarti tra le opzioni
- Premi **Invio** per selezionare un'opzione
- Premi **Esc** per tornare al menu precedente (in GRUB)
- La selezione automatica e la durata del timeout dipendono dalla configurazione attiva del menu; alcuni menu possono attendere indefinitamente

### Selezione della lingua (GRUB)

Se la tua chiavetta USB MiniOS supporta più lingue:
1. La prima schermata mostrerà le opzioni di lingua
2. Seleziona la lingua preferita
3. Il menu di avvio apparirà nella lingua scelta
4. La selezione può anche trasmettere le impostazioni locali alla fase successiva di avvio, ma non garantisce che ogni messaggio di avvio o applicazione sia tradotto

**Importante:** Il menu multilingue sovrascrive qualsiasi impostazione locale specificata in `config.conf`. La lingua selezionata nel menu di avvio ha la precedenza sulle impostazioni locali preconfigurate. Consulta **[File di configurazione](/reference/configuration/config.conf)** e **[live-config](/reference/configuration/live-config)** per dettagli sui file di configurazione del sistema.

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

- `debug` - Mostra messaggi dettagliati di avvio (utile per la diagnostica)
- `toram=trim` - Copia il set di moduli filtrato e i dati essenziali in RAM
- `perchsize=2000` - Imposta la dimensione dello storage della sessione a 2GB (modificabile a piacere)
- `locales=ru_RU.UTF-8` - Richiedi una lingua/locale specifica

Per l'elenco completo dei parametri di avvio disponibili, consulta **[Parametri di avvio](/reference/Boot-Parameters)**.

## Percorsi dei file di configurazione

### Sulla tua chiavetta USB MiniOS

- **Configurazione GRUB:** `/minios/boot/grub/grub.cfg`
- **Configurazione SYSLINUX:** `/minios/boot/syslinux/syslinux.cfg`
- **Immagini di avvio:** `/minios/boot/bootlogo.png`
- **File lingua:** `/minios/boot/grub/locale/`

### Nel sistema in esecuzione

- **Parametri di avvio correnti:** `/proc/cmdline`
- **Directory dati MiniOS:** `/run/initramfs/memory/data/minios/`

### Modifica dei file di configurazione

**Attenzione:** Modifica i file di configurazione di avvio solo se sai cosa stai facendo. Cambiamenti errati possono rendere la tua chiavetta USB non avviabile.

**Per modificare la configurazione di GRUB:**
1. Monta la chiavetta USB MiniOS
2. Vai su `/minios/boot/grub/`
3. Modifica `grub.cfg` con un editor di testo
4. Salva ed espelli in sicurezza la chiavetta USB

**Modifiche comuni:**
- Modifica la direttiva di timeout utilizzata dal menu GRUB o Syslinux attivo
- Cambia `set default=0` per modificare l'opzione di menu predefinita
- Aggiungi voci personalizzate al menu
