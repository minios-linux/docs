---
updated: 2026-10-15
---

# Metodi di installazione

MiniOS è un sistema operativo live-first. Installare MiniOS significa normalmente copiare il suo sistema live modulare su un supporto rimovibile o su un altro disco: scrivere o copiare MiniOS su un'unità USB è quindi di per sé un metodo di installazione, non una semplice preparazione a un'installazione successiva.

Esistono due grandi famiglie di installazione:

- **Installazione live** mantiene lo stack di moduli MiniOS, la configurazione all'avvio, la persistenza della sessione e i flussi di gestione di MiniOS. La scrittura di un'immagine raw, l'installazione basata su file, Ventoy e la modalità Live dell'Installatore MiniOS consentono tutte di avviare il sistema live MiniOS.
- **Installazione nativa** è una conversione facoltativa eseguita da [Installatore MiniOS](/installing-minios/MiniOS-Installer). Crea un desktop Debian tradizionale a partire dall'immagine MiniOS selezionata, mantenendone l'ambiente desktop, l'identità visiva e le applicazioni comuni, ma rimuovendo il software specifico di MiniOS necessario all'architettura live.

## Scaricare e verificare l'ISO

Scarica un'ISO dal [sito ufficiale](https://minios.dev), dalla pagina ufficiale [GitHub Releases](https://github.com/minios-linux/minios-live/releases) o da [SourceForge](https://sourceforge.net/projects/minios-linux/). Verificala prima di scriverla su un dispositivo; consulta [Verifica dei download](/installing-minios/Verifying-Downloads).

## Installare MiniOS su un supporto rimovibile

Scegli il metodo in base alla struttura che vuoi ottenere sul dispositivo di destinazione:

| Risultato | Metodo | Cosa ottieni |
|---|---|---|
| Un normale file system scrivibile che può anche avviare MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) in modalità ISO o [installazione manuale basata su file](/installing-minios/Manual-File-Based-Installation) | File MiniOS e bootloader su un normale file system; lo spazio restante rimane disponibile per i file comuni |
| Dispositivo multiboot con supporto alla persistenza MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | Partizione dati Ventoy per i file ISO e supporto alle sessioni persistenti MiniOS |
| Installazione modulare MiniOS gestita | [Installatore MiniOS](/installing-minios/MiniOS-Installer) in modalità **Live** mode | Struttura modulare MiniOS con archiviazione persistente facoltativa configurata dall'installatore |
| Copia esatta, blocco per blocco, dell'ISO pubblicata | [Rufus](/installing-minios/installation-tools/Rufus) in modalità DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilità disco](/installing-minios/installation-tools/Drive-Utility), oppure [`dd`](/installing-minios/installation-tools/dd) | La struttura a blocchi dell'ISO rimane identica; semplice e prevedibile, ma il dispositivo di destinazione non si comporta più come una normale unità flash multiuso |

::: danger La scrittura dell'immagine raw sovrascrive la struttura del dispositivo di destinazione
La modalità DD di Rufus, Etcher, la scrittura di immagini con Utilità disco e `dd`sostituiscono la struttura a blocchi esistente del dispositivo. Prima di iniziare, verifica modello e capacità del dispositivo di destinazione ed esegui il backup di tutto ciò che è importante. Questo avviso non riguarda la modalità ISO Rufus, Ventoy né l'installazione basata su file.
:::

## Avviare la sessione live

1. Riavvia il computer e apri il menu di avvio del firmware.
2. Seleziona il dispositivo USB o un altro supporto avviabile.
3. Avvia MiniOS e verifica che archiviazione, rete e dispositivi di input funzionino come previsto.

Le impostazioni del firmware variano da computer a computer. Un'immagine MiniOS può avviarsi tramite BIOS o UEFI; la destinazione di una successiva installazione con l'Installatore MiniOS non è limitata a MBR.

Consulta [Modalità di avvio](/using-minios/Boot-Modes) come guida di riferimento per il comportamento di avvio live. Se nelle prime fasi dell'avvio non viene trovata l'immagine o uno dei suoi moduli, consulta [Individuazione del sistema da parte di Initrd](/reference/boot-process/System-Discovery).

## Scegli un layout installato

Dalla sessione live, avvia [Installatore MiniOS](/installing-minios/MiniOS-Installer) quando vuoi installare il sistema su un'altra unità USB, SSD o disco rigido.

- **Modalità live** mantiene lo stack di moduli compressi, il layout di avvio MiniOS, gli strumenti di gestione MiniOS e la persistenza opzionale della sessione. Sceglila se vuoi installare MiniOS sul disco di destinazione.
- **Modalità nativa**trasforma l'immagine selezionata in un tradizionale desktop Debian scrivibile. Il sistema di destinazione mantiene l'ambiente desktop, l'identità visiva e le applicazioni standard dell'edizione selezionata, mentre il runtime live MiniOS e il software di gestione specifico per l'ambiente live vengono rimossi. Il sistema installato utilizza un initramfs, un bootloader, pacchetti del kernel e un flusso di gestione dei pacchetti Debian tradizionali.

::: warning L'installazione nativa utilizza un modello di sistema diverso
L'architettura MiniOS distintiva è il sistema live modulare descritto in [Informazioni su MiniOS](/getting-started/About-MiniOS). La modalità nativa mantiene la familiare esperienza desktop MiniOS, inclusi identità visiva, ambiente desktop e applicazioni standard, ma converte il sistema in un'installazione Debian tradizionale. Gli strumenti MiniOS specifici per sessioni, moduli, kernel modulari e altri flussi di lavoro live vengono rimossi, perché queste funzionalità non sono più applicabili. Scegli un'installazione live se vuoi l'intero set di funzionalità di MiniOS.
:::

La persistenza live può essere preconfigurata sul dispositivo di destinazione dall'Installatore MiniOS oppure predisposta durante le prime fasi di avvio. Per i dettagli, consulta [Persistenza initrd](/reference/boot-process/Persistence-Internals). Non è disponibile dopo la conversione nativa.

L'installatore supporta i layout BIOS/MBR, UEFI/MBR e UEFI/GPT. L'installazione live automatica sull'intero disco usa MBR con supporto all'avvio BIOS e UEFI; per i dischi da 2 TiB in su è necessario selezionare esplicitamente UEFI/GPT. BIOS su GPT non è supportato. I flussi di lavoro nativi e quelli con tabella delle partizioni esistente seguono criteri distinti. Consulta [Uso dell'Installatore MiniOS](/installing-minios/MiniOS-Installer) per informazioni sui limiti relativi a destinazione, filesystem, persistenza e partizionamento.
