---
updated: 2026-08-31
---

# Metodi di installazione

MiniOS è un sistema operativo orientato all’utilizzo live. Installare MiniOS normalmente significa posizionare il suo sistema live modulare su un supporto rimovibile o su un altro disco; quindi scrivere o copiare MiniOS su una chiavetta USB rappresenta già un metodo di installazione, non solo una preparazione per una successiva installazione.

Esistono due grandi famiglie di installazione:

- **Installazione live** mantiene lo stack di moduli MiniOS, la configurazione al boot, la persistenza della sessione e i flussi di lavoro di gestione MiniOS. La scrittura dell’immagine raw, l’installazione basata su file, Ventoy e la modalità Live dell’Installatore MiniOS producono tutte modalità per eseguire il sistema live di MiniOS.
- **Installazione nativa** è una conversione opzionale eseguita da [Installatore MiniOS](/installing-minios/MiniOS-Installer). Crea un desktop Debian convenzionale dall’immagine MiniOS selezionata, mantenendo l’ambiente desktop, l’identità visiva e le applicazioni ordinarie, rimuovendo però il software specifico di MiniOS che esiste per l’architettura live.

## Scarica e verifica l’ISO

Scarica un file ISO dal [sito ufficiale](https://minios.dev), dalla pagina ufficiale [GitHub Releases](https://github.com/minios-linux/minios-live/releases) o da [SourceForge](https://sourceforge.net/projects/minios-linux/). Verificalo prima di scriverlo su un dispositivo; vedi [Verifica dei download](/installing-minios/Verifying-Downloads).

## Installa MiniOS su supporti rimovibili

Scegli il metodo in base alla struttura che desideri sul dispositivo di destinazione:

| Risultato | Metodo | Cosa ottieni |
|---|---|---|
| Filesystem scrivibile normale che avvia anche MiniOS | [Rufus](/installing-minios/installation-tools/Rufus) in modalità ISO o [installazione manuale basata su file](/installing-minios/Manual-File-Based-Installation) | File MiniOS e bootloader su un filesystem normale; lo spazio rimanente resta utilizzabile per file comuni |
| Dispositivo multiboot con supporto persistenza MiniOS | [Ventoy](/installing-minios/installation-tools/Ventoy) | Partizione dati Ventoy per file ISO più supporto sessione persistente MiniOS |
| Installazione modulare gestita MiniOS | [Installatore MiniOS](/installing-minios/MiniOS-Installer) in modalità **Live** | Struttura modulare MiniOS con storage persistente opzionale configurato dall’installatore |
| Copia esatta, settore per settore, della ISO pubblicata | [Rufus](/installing-minios/installation-tools/Rufus) in modalità DD, [Balena Etcher](/installing-minios/installation-tools/Balena-Etcher), [Utilità disco](/installing-minios/installation-tools/Drive-Utility) o [`dd`](/installing-minios/installation-tools/dd) | Esattamente la struttura a blocchi della ISO; semplice e prevedibile, ma il dispositivo non si comporta più come una normale chiavetta USB multiuso |

::: danger La scrittura dell’immagine raw sovrascrive la struttura del dispositivo di destinazione
La modalità DD di Rufus, Etcher, la scrittura immagine di Utilità disco e `dd` sostituiscono la struttura a blocchi esistente del dispositivo. Verifica modello e capacità del dispositivo e salva tutto ciò che è importante prima di procedere. Questo avviso non riguarda la modalità ISO di Rufus, Ventoy o un’installazione basata su file.
:::

## Avvia la sessione live

1. Riavvia il computer e apri il menu di avvio del firmware.
2. Seleziona il dispositivo USB o un altro supporto avviabile.
3. Avvia MiniOS e verifica che storage, rete e dispositivi di input funzionino come previsto.

Le impostazioni del firmware variano a seconda del computer. Un’immagine MiniOS può avviarsi tramite BIOS o UEFI; la destinazione di una successiva installazione con Installatore MiniOS non è limitata a MBR.

Utilizza [Modalità di avvio](/using-minios/Boot-Modes) come guida di riferimento per il comportamento dell’avvio live. Se nella fase iniziale l’avvio non trova l’immagine o i suoi moduli, consulta [Rilevamento del sistema Initrd](/reference/boot-process/System-Discovery).

## Scegli una struttura installata

Dalla sessione live, avvia [Installatore MiniOS](/installing-minios/MiniOS-Installer) quando vuoi installare il sistema su un’altra chiavetta USB, SSD o disco fisso.

- La **modalità Live** mantiene lo stack di moduli compressi, la struttura di avvio MiniOS, gli strumenti di gestione MiniOS e la persistenza opzionale della sessione. Scegli questa modalità se vuoi MiniOS direttamente sul disco di destinazione.
- La **modalità Nativa** espande l’immagine selezionata in un desktop Debian scrivibile convenzionale. Il disco mantiene l’ambiente desktop, l’identità visiva e le applicazioni ordinarie dell’edizione selezionata, mentre il runtime live MiniOS e il software di gestione specifico per il live vengono rimossi. Il sistema installato utilizza un initramfs, bootloader, pacchetti kernel e workflow di gestione pacchetti Debian standard.

::: warning L’installazione nativa utilizza un modello di sistema differente
L’architettura caratteristica di MiniOS è il sistema live modulare descritto in [Informazioni su MiniOS](/getting-started/About-MiniOS). La modalità nativa mantiene l’esperienza desktop familiare di MiniOS, inclusi identità visiva, ambiente desktop e applicazioni ordinarie, ma converte il sistema in una installazione Debian convenzionale. Gli strumenti specifici di MiniOS per sessioni, moduli, kernel modulari e altri flussi di lavoro live vengono rimossi, poiché tali funzionalità non si applicano più. Scegli una installazione live se vuoi tutte le funzionalità di MiniOS.
:::

La persistenza live viene preparata durante le prime fasi di avvio; il comportamento dettagliato è descritto in [Persistenza Initrd](/reference/boot-process/Persistence-Internals). Non si applica dopo la conversione nativa.

L’installatore supporta layout automatici BIOS/MBR, UEFI/MBR e UEFI/GPT. BIOS su GPT non è supportato dall’attuale installatore. Consulta [Utilizzo di Installatore MiniOS](/installing-minios/MiniOS-Installer) per limiti su posizionamento, filesystem, persistenza e partizionamento.
