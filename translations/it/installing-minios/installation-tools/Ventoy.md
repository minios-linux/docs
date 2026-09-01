---
updated: 2026-08-26
---

# Ventoy

Ventoy è uno strumento molto diffuso per la creazione di unità USB avviabili che consente di memorizzare più file ISO su un unico dispositivo e avviare il sistema da uno qualsiasi di essi.

## Importante

**Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre attentamente l'unità selezionata ed esegui il backup dei dati importanti.

**Requisito modalità di avvio:** Per far funzionare correttamente MiniOS con Ventoy, DEVI selezionare la modalità **GRUB2** durante l'avvio, oppure rinominare il file ISO aggiungendo il suffisso `VTGRUB2` (ad esempio, `minios-standard-amd64_VTGRUB2.iso`) per forzare automaticamente la modalità GRUB2.

## Requisiti dell'unità

### Dimensione dell'unità

Consulta la [Guida alla compatibilità hardware](/getting-started/Hardware-Compatibility) per i requisiti di sistema dettagliati e le dimensioni delle unità.

## Installazione di Ventoy

### Metodo 1: Installazione standard

1. **Scarica Ventoy** dal [sito ufficiale](https://www.ventoy.net/)
2. **Esegui il programma di installazione di Ventoy** e seleziona la tua unità USB
3. **Installa Ventoy** sull’unità (tutti i dati verranno eliminati)
4. **Copia il file ISO di MiniOS** nella cartella principale dell’unità USB

Questo crea un supporto multiboot con file ISO: Ventoy mantiene l’ISO come file sulla propria partizione dati e lo presenta all’avvio. Non si tratta di una scrittura raw dell’immagine MiniOS né di un deployment tramite Installatore MiniOS.

### Metodo 2: Installazione con partizione dati separata (Consigliato)

1. **Scarica Ventoy** dal [sito ufficiale](https://www.ventoy.net/)
2. **Esegui l'installer di Ventoy** e seleziona la tua unità USB
3. **Abilita l'opzione "Riserva spazio"** durante l'installazione per creare una partizione aggiuntiva
4. **Installa Ventoy** sull'unità
5. **Copia il file ISO di MiniOS** nella cartella principale dell'unità USB
6. **Crea una partizione ext4** nello spazio riservato con l'etichetta `persistence`

Questo fornisce una possibile posizione per la persistenza, ma la sola creazione della partizione non abilita la persistenza né crea una sessione.

## Integrazione con MiniOS

MiniOS include il supporto per il rilevamento di un file ISO presentato da Ventoy. Il rilevamento della sorgente e la selezione della persistenza sono separati; Ventoy non abilita direttamente la persistenza di MiniOS.

### Persistenza

La persistenza viene abilitata solo quando una voce di avvio o una riga di comando del kernel la richiede. L'attivazione dipende poi dalla presenza di una posizione scrivibile compatibile e da una sessione utilizzabile; un'installazione standard di Ventoy non garantisce che nessuna delle due venga creata automaticamente. Consulta [Modalità di avvio](/using-minios/Boot-Modes) e [Persistenza Initrd](/reference/boot-process/Persistence-Internals) prima di fare affidamento sul salvataggio delle modifiche.

## Utilizzo di MiniOS con Ventoy

### Avvio

Dopo aver installato Ventoy e copiato il file ISO di MiniOS sull'unità:

1. **Avvia dal drive USB** - selezionalo nel BIOS/UEFI
2. **Seleziona MiniOS** dall'elenco dei file ISO disponibili nel menu di Ventoy
3. **IMPORTANTE: seleziona la modalità GRUB2** quando richiesto da Ventoy
4. **Attendi il caricamento di MiniOS**

### **Requisiti modalità di avvio Ventoy**

**Per il corretto funzionamento di MiniOS:**
- **Modalità GRUB2** - Necessaria per il funzionamento corretto di MiniOS

**Soluzione alternativa:**
- Aggiungi il suffisso `VTGRUB2` al nome del file ISO (ad esempio, `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- In questo modo Ventoy utilizzerà automaticamente la modalità GRUB2 senza richiedere conferma
