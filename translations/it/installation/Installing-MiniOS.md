---
updated: 2026-08-26
---

# Installazione di MiniOS

Ci sono due operazioni distinte che spesso vengono chiamate installazione:

- Scrivere l’ISO su un supporto rimovibile crea il supporto avviabile utilizzato per avviare una sessione live di MiniOS. Gli strumenti di scrittura immagini sovrascrivono il dispositivo selezionato con la struttura dell’ISO.
- Eseguire il [MiniOS Installer](/installation/MiniOS-Installer.md) da una sessione live distribuisce MiniOS su un altro disco. Può creare sia un’installazione live modulare sia una classica installazione Linux nativa.

## Scarica e verifica l’ISO

Scarica un file ISO dal [sito ufficiale](https://minios.dev) oppure dalla pagina ufficiale delle [GitHub Releases](https://github.com/minios-linux/minios-live/releases). Verifica il file prima di scriverlo su un dispositivo; consulta [Verifica dei download](/installation/Verifying-Downloads.md).

## Scrivi un supporto avviabile

Scegli un metodo in base al tuo sistema operativo:

- [Rufus](/installation/tools/Rufus.md) su Windows
- [Ventoy](/installation/tools/Ventoy.md) su Windows o Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) su Windows, Linux o macOS
- [`dd`](/installation/tools/dd.md) su Linux o macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) su Linux
- [UNetbootin](/installation/tools/UNetbootin.md) su Windows, Linux o macOS
- [Installazione USB basata su file](/installation/tools/File-Based-USB-Installation.md) per una preparazione manuale della struttura MiniOS

La scrittura di un’immagine con Rufus, Etcher, `dd` o Drive Utility è distruttiva. Verifica attentamente percorso del dispositivo, modello e capacità prima di iniziare. Una scrittura raw dell’immagine riproduce la struttura dell’immagine; non configura automaticamente la persistenza né esegue un deployment live o nativo con MiniOS Installer.

Ventoy funziona diversamente: installa Ventoy sul dispositivo, poi copia il file ISO nella sua partizione dati. In questo modo viene mantenuta la struttura multiboot di Ventoy.

## Avvia la sessione live

1. Riavvia il computer e apri il menu di avvio del firmware.
2. Seleziona il dispositivo USB o un altro supporto avviabile.
3. Avvia MiniOS e verifica che lo storage, la rete e i dispositivi di input funzionino come previsto.

Le impostazioni del firmware variano a seconda del computer. Un'immagine MiniOS può avviarsi tramite BIOS o UEFI; la destinazione di una successiva installazione con MiniOS Installer non è limitata a MBR.

Utilizza [Modalità di avvio](/configuration/Boot-Modes.md) come guida di riferimento per il comportamento dell'avvio live. Se durante l'avvio iniziale non viene trovata l'immagine o i suoi moduli, consulta [Rilevamento sistema Initrd](/configuration/Initrd-System-Discovery.md).

## Scegli un layout di installazione

Dalla sessione live, avvia [MiniOS Installer](/installation/MiniOS-Installer.md) quando vuoi installare MiniOS su un altro drive USB, SSD o hard disk.

- La modalità live mantiene lo stack di moduli compressi e il layout di avvio live. Supporta la persistenza opzionale della sessione ed è adatta a installazioni portatili.
- La modalità nativa espande i moduli selezionati in un file system root Linux convenzionale, genera l'initramfs e installa un bootloader supportato. La modalità nativa è disponibile solo quando l'immagine avviata fornisce i metadati necessari all'installer.

La persistenza live viene preparata durante l'avvio iniziale; il comportamento dettagliato è descritto in [Persistenza Initrd](/configuration/Initrd-Persistence.md). Non si applica al file system root convenzionale utilizzato dalla modalità nativa.

L'installer supporta layout automatici BIOS/MBR, UEFI/MBR e UEFI/GPT. BIOS su GPT non è supportato dall'attuale installer. Consulta [Utilizzo di MiniOS Installer](/installation/MiniOS-Installer.md) per limiti su posizionamento, file system, persistenza e partizionamento.
