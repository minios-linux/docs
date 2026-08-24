# Installazione di MiniOS

Ci sono due operazioni distinte che spesso vengono chiamate installazione:

- Scrivere l’ISO su un supporto rimovibile crea il supporto avviabile utilizzato per avviare una sessione live di MiniOS. Gli strumenti di scrittura immagini sovrascrivono il dispositivo selezionato con la struttura dell’ISO.
- Eseguire il [MiniOS Installer](/installation/MiniOS-Installer.md) da una sessione live distribuisce MiniOS su un altro disco. Può creare sia un’installazione live modulare sia una classica installazione Linux nativa.

## Scarica e verifica l’ISO

Scarica un file ISO dal [sito ufficiale](https://minios.dev) oppure dalla pagina ufficiale delle [GitHub Releases](https://github.com/minios-linux/minios-live/releases). Verifica il file prima di scriverlo su un dispositivo; consulta [Verifica dei download](/installation/Verifying-Downloads.md).

## Scrivi il supporto avviabile

Scegli un metodo in base al tuo sistema operativo:

- [Rufus](/installation/tools/Rufus.md) su Windows
- [Ventoy](/installation/tools/Ventoy.md) su Windows o Linux
- [Balena Etcher](/installation/tools/Balena-Etcher.md) su Windows, Linux o macOS
- [`dd`](/installation/tools/dd.md) su Linux o macOS
- [Drive Utility](/installation/tools/Drive-Utility.md) su Linux
- [UNetbootin](/installation/tools/UNetbootin.md) su Windows, Linux o macOS
- [Metodo originale](/installation/tools/Original-Method.md) per una struttura MiniOS basata su file

La scrittura di un’immagine con Rufus, Etcher, `dd` o Drive Utility è distruttiva. Conferma percorso, modello e capacità del dispositivo prima di iniziare. Questi strumenti creano il supporto avviabile; non eseguono un deployment live o nativo con MiniOS Installer.

Ventoy è diverso: installa Ventoy sul dispositivo, poi copia l’ISO nella sua partizione dati. In questo modo viene mantenuta la struttura multiboot di Ventoy.

## Avvia la sessione live

1. Riavvia il computer e apri il menu di avvio del firmware.
2. Seleziona il dispositivo USB o un altro supporto avviabile.
3. Avvia MiniOS e verifica che archiviazione, rete e dispositivi di input funzionino correttamente.

Le impostazioni del firmware variano a seconda del computer. Un’immagine MiniOS può avviarsi sia tramite BIOS che UEFI; la destinazione di una successiva installazione tramite MiniOS Installer non è limitata a MBR.

## Scegli una modalità di installazione

Dalla sessione live, avvia il [MiniOS Installer](/installation/MiniOS-Installer.md) quando desideri installare MiniOS su un’altra chiavetta USB, SSD o disco rigido.

- La modalità live mantiene la pila di moduli compressi e la struttura di avvio live. Supporta la persistenza opzionale della sessione ed è adatta a installazioni portatili.
- La modalità nativa espande i moduli selezionati in un filesystem root Linux convenzionale, genera l’initramfs e installa un bootloader supportato. La modalità nativa è disponibile solo se l’immagine avviata fornisce i metadati necessari per l’installer.

L’installer supporta layout automatici BIOS/MBR, UEFI/MBR e UEFI/GPT. BIOS su GPT non è supportato dall’attuale installer. Consulta [Utilizzo di MiniOS Installer](/installation/MiniOS-Installer.md) per limiti su posizionamento, filesystem, persistenza e partizionamento.
