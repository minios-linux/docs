---
updated: 2026-10-15
---

# Architettura del sistema

MiniOS avvia un sistema operativo in sola lettura, assemblato a partire da moduli SquashFS, e aggiunge un livello scrivibile per la sessione corrente. L’initramfs si occupa di individuare il supporto, selezionare i moduli e la persistenza, creare il filesystem root, applicare la configurazione iniziale e passare il controllo al sistema init installato.

## Rilevamento all’avvio

Il bootloader BIOS o UEFI carica un kernel Linux e un initramfs MiniOS da `minios/boot/`. L’initramfs individua quindi l’albero dati MiniOS che contiene i moduli live. La sorgente può essere locale, selezionata in modo interattivo oppure fornita tramite un percorso di rete supportato; un ISO locale viene montato in loop prima di utilizzare il relativo albero dati. Le priorità esatte e i formati `from=` accettati sono descritti in [Rilevamento del sistema tramite initrd](/reference/boot-process/System-Discovery).

La stessa fase di rilevamento supporta sorgenti ISO HTTP e PXE. La rete opzionale nelle prime fasi di avvio serve solo per **caricare MiniOS dalla rete** (PXE / ISO HTTP). Non configura una rete persistente per la sessione. Vedi [Avvio da rete](/reference/boot-process/Network-Boot).

Dopo il rilevamento, MiniOS può preparare facoltativamente una copia RAM. La necessità di mantenere la sorgente originale dipende dalla modalità di copia, dalla persistenza e dal completamento corretto della disconnessione. Vedi [Modalità di avvio](/using-minios/Boot-Modes) per il funzionamento.

## Composizione dei moduli

Ogni `.sb` file è un filesystem SquashFS in sola lettura. I moduli integrati sono archiviati direttamente in `minios/`; altre posizioni dei moduli possono contribuire alla composizione ordinata. L’initramfs seleziona, ordina e monta i livelli risultanti in sola lettura. Le priorità dei candidati, la sostituzione in base al nome del file, i filtri, le estensioni dei bundle personalizzati e il coordinamento con il kernel in esecuzione sono descritti in [Caricamento dei moduli nell’initrd](/reference/boot-process/Module-Loading).

Una tipica immagine Xfce contiene i seguenti ruoli in ordine, anche se nomi e numeri esatti dipendono dalla build e dai moduli esclusi per quella destinazione:

```text
00-core-<arch>.sb
01-kernel-<version>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

I moduli successivi hanno priorità maggiore e possono sostituire i percorsi forniti dai moduli precedenti. Un modulo può dipendere dai file presenti in tutti i moduli con numero inferiore: perciò, un insieme di file di moduli costituisce una composizione ordinata, non una raccolta di pacchetti indipendenti.

## AUFS e OverlayFS

MiniOS usa un filesystem union per presentare i moduli e il livello scrivibile come un unico filesystem root. Seleziona AUFS quando il kernel in esecuzione lo supporta e, in caso contrario, ripiega su OverlayFS. `union=aufs` richiede AUFS, ma ripiega comunque su OverlayFS quando AUFS non è disponibile; `union=overlayfs` seleziona OverlayFS. Con UEFI Secure Boot attivo, initrd non carica il modulo `aufs-ng` non firmato e usa OverlayFS, a meno che non sia già presente un’altra implementazione AUFS utilizzabile.

Le due implementazioni presentano un’importante differenza operativa:

- AUFS parte dal ramo scrivibile e aggiunge i moduli montati come rami in sola lettura. MiniOS può attivare o disattivare un modulo nel root in esecuzione, se il mount AUFS supporta questa operazione.
- OverlayFS riceve l’elenco completo e ordinato dei `lowerdir` moduli quando viene montato il root, oltre a un `upperdir` e a un `workdir`. L’insieme dei moduli inferiori non può essere modificato sul momento da **Gestore moduli MiniOS**.

**Gestore moduli MiniOS** separa quindi **Sessione corrente**, cioè l’insieme dei moduli montati, da **Prossimo avvio**, cioè i moduli selezionati in base al supporto corrente e alle regole di avvio. L’aggiunta o la rimozione di un modulo persistente modifica normalmente solo l’avvio successivo. Creare o aprire un modulo non lo attiva. L’attivazione e la disattivazione durante l’esecuzione sono disponibili solo con AUFS.

Una volta assemblato il root e completata la configurazione iniziale, l’initrd di LiveKit usa `pivot_root`, mantiene il vecchio initrd per le operazioni di arresto ed esegue init del nuovo root. Il percorso dracut prepara lo stesso root assemblato, ma lascia a dracut il passaggio finale del `switch_root`. Vedi [Caricamento dei moduli nell’initrd](/reference/boot-process/Module-Loading) per i dettagli sul passaggio di controllo.

## Livello scrivibile e sessioni

Senza persistenza, il livello scrivibile è supportato dalla memoria e scompare allo spegnimento. La persistenza può invece attivare una sessione numerata con un backend di archiviazione supportato. Selezionando un backend Persistence Plugin Ventoy, MiniOS usa un unico ambiente persistente ext4 diretto anziché sessioni numerate. La selezione, la compatibilità, gli errori di attivazione, l’autorità per l’avvio corrente e la durabilità sono descritti in [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Modalità | Archiviazione scrivibile | Note |
|------|------------------|-------|
| `native` | File archiviati direttamente nella directory della sessione | Richiede un filesystem POSIX scrivibile che mantenga i metadati Linux. |
| `dynfilefs` | Filesystem ext4 espandibile suddiviso in file di supporto | Supporta filesystem POSIX e supporti FAT32, NTFS o exFAT. |
| `dynblk` | Filesystem ext4 thin su un dispositivo a blocchi del kernel basato su `volumeNNN.db` file | Richiede lo userspace DynBlk, il kernel e il supporto initrd. |
| `vmdk` | File sparsi suddivisi `volume.vmdk` / `volume-sNNN.vmdk` esposti come dispositivo a blocchi dal driver DynBlk | Richiede il supporto `vmdk-session-v1` DynBlk/initrd; nessuna compressione del backend. |
| `raw` |  `changes.img` contenente ext4 | Supporta filesystem POSIX e supporti FAT32, NTFS o exFAT. |
| `squashfs` | Snapshot `changes.sb` compresso | Decompresso in RAM per l’uso; il salvataggio ricrea e sostituisce atomicamente lo snapshot. Durante il salvataggio, il filesystem di persistenza deve mantenere i metadati Linux. |

Raw, DynFileFS, DynBlk e VMDK possono includere facoltativamente un livello LUKS2. I metadati registrano separatamente il backend di archiviazione e la crittografia. Allo spegnimento, ext4, il mapper, l’eventuale loop di proprietà e il backend vengono rilasciati nell’ordine delle dipendenze.

La sessione attiva selezionata per un ripristino futuro e il livello scrivibile effettivamente autorizzato per l’avvio corrente sono stati correlati ma distinti. Modificare una selezione futura non sostituisce il livello scrivibile in uso.

Per i comandi di creazione, selezione, dimensionamento, crittografia, conversione, esportazione e ripristino, consulta [Gestione delle sessioni](/using-minios/Sessions-and-Persistence).

## Precedenza della configurazione

La configurazione del supporto si trova in `minios/config.conf`, con frammenti facoltativi in `minios/config.conf.d/`. Le copie usate in fase di esecuzione si trovano in `/etc/live/config.conf` e `/etc/live/config.conf.d/` nella root composta.

All’avvio, MiniOS confronta gli orari di modifica e copia nel filesystem root di runtime il file del supporto più recente. Se il supporto è scrivibile e la copia di runtime è più recente, questa viene copiata nuovamente sul supporto. I file dei frammenti vengono sincronizzati in entrambe le direzioni in base al nome. Se l’orologio è stato spostato indietro dall’ultima sincronizzazione, MiniOS evita di sostituire i timestamp e si limita a creare le destinazioni mancanti.

Le opzioni della riga di comando del kernel prevalgono sui valori corrispondenti letti dalla configurazione di runtime per quell’avvio. Di conseguenza, l’ordine effettivo per un’impostazione esplicitamente supportata è: parametro di avvio, configurazione sincronizzata di runtime/supporto, valore predefinito integrato. Le modifiche persistenti al runtime possono diventare la configurazione del supporto se la sorgente è scrivibile; i supporti ISO di sola lettura non possono ricevere questo aggiornamento.

Per le impostazioni supportate, consulta [File di configurazione](/reference/configuration/config.conf) e [live-config](/reference/configuration/live-config).

## Ciclo di spegnimento e salvataggio

Durante uno spegnimento normale, il sistema in esecuzione ha innanzitutto la possibilità di svuotare i buffer dei servizi e salvare i dati della sessione. Una sessione SquashFS con il salvataggio allo spegnimento attivato viene ricreata e convalidata prima dello smontaggio dei filesystem. Il backend di salvataggio scrive un marcatore di completamento per la sessione esatta in esecuzione; l’initramfs di spegnimento controlla il marcatore e lascia la sessione nello stato dirty se il salvataggio richiesto non è riuscito.

L’initramfs di spegnimento scollega quindi i dispositivi loop inutilizzati, smonta la vecchia root e il livello scrivibile, contrassegna come clean una sessione salvata correttamente, smonta il supporto e chiude una mappatura LUKS gestita da MiniOS. È quindi possibile espellere i supporti ottici prima dello spegnimento o del riavvio. I salvataggi manuali e periodici SquashFS usano lo stesso backend di snapshot, ma solo la policy di spegnimento configurata impedisce la finalizzazione come clean se manca il salvataggio allo spegnimento.

## Struttura del supporto

Un’immagine aggiornata è organizzata come segue. Le directory facoltative sono presenti solo se la funzionalità correlata ha creato dei contenuti.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>.sb
    |-- 02-firmware-<arch>.sb
    |-- NN-<name>-<arch>.sb        ordered system modules
    |-- boot/                      kernels, initramfs, GRUB, and Syslinux data
    |-- changes/                   session metadata and numbered sessions
    |-- modules/                   additional next-boot modules
    |-- config.conf                main media configuration
    |-- config.conf.d/             optional configuration fragments
    |-- kernels/                   optional inactive kernel repository
    |-- userdata/                  optional linked or bound user directories
    `-- log/                       optional exported boot logs
```

I percorsi di avvio in `/run/initramfs/memory/` sono mount usati dall’implementazione, non una seconda copia persistente di questa struttura.

## Documentazione correlata

- [Modalità di avvio](/using-minios/Boot-Modes)
- [Rilevamento del sistema initrd](/reference/boot-process/System-Discovery)
- [Caricamento dei moduli initrd](/reference/boot-process/Module-Loading)
- [Persistenza initrd](/reference/boot-process/Persistence-Internals)
- [Parametri di avvio](/reference/Boot-Parameters)
- [Menu di avvio](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [File di configurazione](/reference/configuration/config.conf)
- [Gestione delle sessioni](/using-minios/Sessions-and-Persistence)
- [Avvio dalla rete](/reference/boot-process/Network-Boot)
- [Creazione di moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
