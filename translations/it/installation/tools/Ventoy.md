---
updated: 2026-08-26
---

# Utilizzo di Ventoy

Ventoy è uno strumento molto diffuso per creare unità USB avviabili che permette di memorizzare più file ISO su un unico dispositivo e avviare qualsiasi di essi.

## Importante

**Attenzione:** La selezione errata del dispositivo comporterà la perdita dei dati! Controlla sempre con attenzione l’unità selezionata ed esegui il backup dei dati importanti.

**Requisito modalità di avvio:** Per far funzionare correttamente MiniOS con Ventoy, DEVI selezionare la **modalità GRUB2** durante l’avvio, oppure rinominare il file ISO aggiungendo il suffisso `VTGRUB2` (ad es. `minios-standard-amd64_VTGRUB2.iso`) per forzare automaticamente la modalità GRUB2.

## Requisiti dell’unità

### Dimensione dell’unità

Consulta la [Guida alla compatibilità hardware](/installation/Hardware-Compatibility.md) per i requisiti di sistema dettagliati e le dimensioni delle unità.

## Installazione di Ventoy

### Metodo 1: Installazione standard

1. **Scarica Ventoy** dal [sito ufficiale](https://www.ventoy.net/)
2. **Esegui l’installer di Ventoy** e seleziona la tua unità USB
3. **Installa Ventoy** sull’unità (tutti i dati verranno eliminati)
4. **Copia il file ISO di MiniOS** nella cartella principale dell’unità USB

Questo crea un supporto multiboot basato su file ISO: Ventoy mantiene l’ISO come file sulla sua partizione dati e lo presenta all’avvio. Non si tratta di una scrittura raw dell’immagine MiniOS né di un deployment tramite MiniOS Installer.

### Metodo 2: Installazione con Partizione Dati Separata (Consigliato)

1. **Scarica Ventoy** dal [sito ufficiale](https://www.ventoy.net/)
2. **Esegui l’installer di Ventoy** e seleziona la tua unità USB
3. **Abilita l’opzione "Riserva spazio"** durante l’installazione per creare una partizione aggiuntiva
4. **Installa Ventoy** sull’unità
5. **Copia il file ISO di MiniOS** nella cartella principale dell’unità USB
6. **Crea una partizione ext4** nello spazio riservato con l’etichetta `persistence`

Questo fornisce una possibile posizione per la persistenza, ma la sola creazione della partizione non abilita la persistenza né crea una sessione.

## Integrazione con MiniOS

MiniOS include il supporto per rilevare un file ISO presentato da Ventoy. Il rilevamento della sorgente e la selezione della persistenza sono separati; Ventoy non abilita direttamente la persistenza di MiniOS.

### Persistenza

La persistenza viene abilitata solo quando una voce di avvio o una riga di comando del kernel la richiede. L’attivazione dipende quindi dalla presenza di una posizione scrivibile compatibile e di una sessione utilizzabile; un’installazione standard di Ventoy non garantisce che nessuna delle due venga creata automaticamente. Consulta [Modalità di avvio](/configuration/Boot-Modes.md) e [Persistenza Initrd](/configuration/Initrd-Persistence.md) prima di fare affidamento sul salvataggio delle modifiche.

## Utilizzo di MiniOS con Ventoy

### Avvio

Dopo aver installato Ventoy e copiato il file ISO di MiniOS sull’unità:

1. **Avvia dal drive USB** - selezionalo nel BIOS/UEFI
2. **Seleziona MiniOS** dall’elenco dei file ISO disponibili nel menu di Ventoy
3. **IMPORTANTE: seleziona la modalità GRUB2** quando richiesto da Ventoy
4. **Attendi il caricamento di MiniOS**

### **Requisiti modalità di avvio Ventoy**

**Affinché MiniOS funzioni correttamente:**
- **Modalità GRUB2** - Necessaria per il corretto funzionamento di MiniOS

**Soluzione alternativa:**
- Aggiungi il suffisso `VTGRUB2` al nome del file ISO (es. `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- In questo modo Ventoy utilizzerà automaticamente la modalità GRUB2 senza richiedere conferma
