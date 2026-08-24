# Architettura di sistema MiniOS

MiniOS avvia un sistema operativo in sola lettura assemblato da moduli SquashFS e aggiunge uno strato scrivibile per la sessione corrente. L'initramfs si occupa di individuare il supporto, selezionare i moduli e la persistenza, costruire il filesystem root, applicare la configurazione iniziale e passare il controllo al sistema di init installato.

## Scoperta del boot

Il bootloader BIOS o UEFI carica un kernel Linux e l'initramfs di MiniOS da `minios/boot/`. L'initramfs quindi cerca sui dispositivi a blocchi una directory `minios` contenente moduli `.sb`. Il parametro di boot `from=` può invece specificare una directory, un dispositivo a blocchi e percorso, un file ISO locale o una selezione interattiva `askdisk`. Un ISO locale viene montato in loop prima che la sua directory `minios` venga utilizzata.

La stessa fase di scoperta supporta sorgenti ISO HTTP e PXE. La rete opzionale all'avvio serve **solo per caricare MiniOS tramite rete** (PXE / ISO HTTP). Non è una configurazione di rete persistente per la sessione. Vedi [Avvio da rete](/installation/Network-Boot.md).

Dopo la scoperta, `toram=trim` può copiare i moduli selezionati e i dati necessari in RAM, mentre `toram=full` copia l'albero dati del supporto. Consulta [Parametri di boot](/configuration/Boot-Parameters.md) per opzioni su sorgenti, filtri e copia in RAM.

## Composizione dei moduli

Ogni file `.sb` è un filesystem SquashFS in sola lettura. I moduli integrati sono memorizzati direttamente sotto `minios/`; moduli aggiuntivi possono essere archiviati sotto `minios/modules/`, inclusa la memorizzazione durevole dei moduli su un dispositivo di persistenza scrivibile. L'initramfs rileva entrambe le posizioni, applica i filtri `load=` e `noload=`, ordina i file selezionati in base al prefisso numerico del nome file e li monta in sola lettura.

Un'immagine tipica di Xfce contiene i seguenti ruoli ordinati, anche se nomi e numeri esatti dipendono dalla build e dai moduli saltati per quel target:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

I moduli successivi hanno precedenza più alta e possono sostituire i percorsi forniti dai moduli precedenti. Un modulo può dipendere dai file di ogni modulo con numero inferiore, quindi un insieme di file modulo è una composizione ordinata e non una semplice raccolta di pacchetti indipendenti.

## AUFS e OverlayFS

MiniOS utilizza un filesystem unione per presentare i moduli e lo strato scrivibile come un unico filesystem root. Seleziona AUFS quando il kernel in esecuzione lo supporta e passa a OverlayFS in caso contrario. `union=aufs` richiede AUFS ma passa comunque a OverlayFS se AUFS non è disponibile; `union=overlayfs` seleziona OverlayFS.

Le due implementazioni hanno una differenza operativa importante:

- AUFS parte dal ramo scrivibile e aggiunge i moduli montati come rami in sola lettura. MiniOS può attivare o disattivare un modulo nel root in esecuzione quando il mount AUFS lo consente.
- OverlayFS riceve la sua lista `lowerdir` completa e ordinata al momento del mount del root, più un `upperdir` e `workdir`. L'insieme dei moduli inferiori non può essere modificato al volo dal Module Manager.

Per questo motivo, Module Manager separa **Attivi ora**, l'insieme dei moduli montati, da **Prossimo avvio**, i moduli selezionati dai supporti e dalle regole di boot correnti. L'aggiunta o la rimozione di un modulo durevole normalmente modifica solo il prossimo avvio. Creare o aprire un modulo non lo attiva. L'attivazione e la disattivazione a runtime sono possibili solo con AUFS.

## Strato scrivibile e sessioni

Senza persistenza, lo strato scrivibile è in RAM e viene perso allo spegnimento. La persistenza colloca quello strato in una sessione numerata sotto `minios/changes/`. `session.conf` registra la sessione predefinita per il prossimo avvio, la sessione usata dall'avvio corrente, i metadati di compatibilità, lo stato e le impostazioni specifiche della modalità.

| Modalità | Archiviazione scrivibile | Note |
|------|------------------|-------|
| `native` | File archiviati direttamente nella directory della sessione | Richiede un filesystem POSIX scrivibile che preservi i metadati Linux. |
| `dynfilefs` | Filesystem ext4 espandibile suddiviso tra file di appoggio | Supporta filesystem POSIX e supporti FAT32, NTFS o exFAT. |
| `raw` | `changes.img` a dimensione fissa contenente ext4 | Supporta filesystem POSIX e supporti FAT32, NTFS o exFAT. |
| `luks` | LUKS2 `changes.luks` contenente ext4 | Richiede cryptsetup e un initramfs costruito con supporto crittografia MiniOS. La passphrase viene richiesta durante l'avvio. |
| `squashfs` | Snapshot `changes.sb` compresso | Viene estratto in RAM per l'uso; il salvataggio ricostruisce e sostituisce atomicamente lo snapshot. Il filesystem di persistenza deve preservare i metadati Linux durante il salvataggio. |

La sessione attiva è quella predefinita per il prossimo avvio. La sessione in esecuzione è quella già montata nel root corrente. L'attivazione di un'altra sessione non sostituisce lo strato scrivibile attuale. I controlli di compatibilità della sessione includono versione MiniOS, edizione, filesystem unione e modalità di persistenza.

Consulta [Gestione delle sessioni](/configuration/Session-Management.md) per comandi di creazione, selezione, dimensionamento, crittografia, conversione, esportazione e recupero.

## Precedenza della configurazione

La configurazione del supporto è `minios/config.conf`, con frammenti opzionali in `minios/config.conf.d/`. Le copie in esecuzione sono `/etc/live/config.conf` e `/etc/live/config.conf.d/` nella root composta.

All'avvio, MiniOS confronta le date di modifica e copia un file del supporto più recente nella root runtime. Se il supporto è scrivibile e la copia runtime è più recente, viene copiata sul supporto. I file frammento vengono sincronizzati per nome file in entrambe le direzioni. Se l'orologio è stato riportato indietro dall'ultima sincronizzazione, MiniOS evita di sovrascrivere i timestamp e si limita a riempire le destinazioni mancanti.

Le opzioni della riga di comando del kernel sovrascrivono i valori corrispondenti letti dalla configurazione runtime per quell'avvio. Questo significa che l'ordine effettivo per un'impostazione esplicitamente supportata è: parametro di boot, poi configurazione runtime/supporto sincronizzata, poi il valore predefinito integrato. Le modifiche persistenti alla configurazione runtime possono diventare la configurazione del supporto quando la sorgente è scrivibile; i supporti ISO in sola lettura non possono ricevere quell'aggiornamento.

Consulta [File di configurazione](/configuration/Configuration-File.md) e [live-config](/configuration/live-config.md) per le impostazioni supportate.

## Spegnimento e ciclo di salvataggio

Lo spegnimento normale offre innanzitutto al sistema in esecuzione la possibilità di svuotare i servizi e i dati di sessione. Una sessione SquashFS con salvataggio allo spegnimento abilitato viene ricostruita e validata prima dello smontaggio del filesystem. Il backend di salvataggio scrive un marcatore di completamento per la sessione esatta in esecuzione; l'initramfs di spegnimento controlla quel marcatore e lascia la sessione "dirty" se il salvataggio richiesto non è riuscito.

L'initramfs di spegnimento quindi scollega i dispositivi loop non utilizzati, smonta la vecchia root e lo strato scrivibile, registra una sessione riuscita come pulita, smonta il supporto e chiude una mappatura LUKS gestita da MiniOS. I supporti ottici possono quindi essere espulsi prima dello spegnimento o del riavvio. I salvataggi manuali e periodici SquashFS utilizzano lo stesso backend di snapshot, ma solo la policy di salvataggio configurata allo spegnimento blocca la finalizzazione pulita in caso di salvataggio mancante.

## Struttura del supporto

Un'immagine attuale è organizzata come segue. Le directory opzionali compaiono solo quando la funzione correlata ha creato contenuti.

```text
/
|-- .disk/                         ISO metadata
|-- EFI/                           UEFI boot files
`-- minios/
    |-- 00-core-<arch>.sb          base userspace
    |-- 01-kernel-<version>-<arch>.sb
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

I percorsi avviati sotto `/run/initramfs/memory/` sono mount di implementazione, non una seconda copia persistente di questa struttura.

## Documentazione correlata

- [Parametri di boot](/configuration/Boot-Parameters.md)
- [Menu di boot](/configuration/Boot-Menus.md)
- [File di configurazione](/configuration/Configuration-File.md)
- [Gestione delle sessioni](/configuration/Session-Management.md)
- [Avvio da rete](/installation/Network-Boot.md)
- [Creazione dei moduli](/development/Creating-Modules.md)
