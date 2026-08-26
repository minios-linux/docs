# Architettura di sistema MiniOS

MiniOS avvia un sistema operativo in sola lettura assemblato da moduli SquashFS e aggiunge uno strato scrivibile per la sessione corrente. L'initramfs si occupa di individuare il supporto, selezionare i moduli e la persistenza, costruire il filesystem root, applicare la configurazione iniziale e passare il controllo al sistema di init installato.

## Scoperta del boot

Il bootloader BIOS o UEFI carica un kernel Linux e l'initramfs di MiniOS da
`minios/boot/`. L'initramfs quindi individua l'albero dati di MiniOS che contiene
i moduli live. La sorgente può essere locale, selezionata interattivamente oppure fornita
tramite un percorso di rete supportato; un ISO locale viene montato in loop prima che il suo albero dati
venga utilizzato. La precedenza esatta e i formati accettati di `from=` sono documentati in
[Scoperta del sistema Initrd](/configuration/Initrd-System-Discovery.md).

La stessa fase di scoperta supporta sorgenti ISO HTTP e PXE. La rete opzionale in fase di early-boot
serve solo per **caricare MiniOS tramite rete** (PXE / ISO HTTP). Non si tratta di una configurazione di rete persistente per la sessione. Vedi
[Boot da rete](/installation/Network-Boot.md).

Dopo la scoperta, MiniOS può opzionalmente preparare una copia in RAM. Se la sorgente originale rimane necessaria dipende dalla modalità di copia, dalla persistenza e dal distacco riuscito. Consulta [Modalità di boot](/configuration/Boot-Modes.md) per il modello operativo.

## Composizione dei moduli

Ogni file `.sb` è un filesystem SquashFS in sola lettura. I moduli integrati sono memorizzati
direttamente sotto `minios/`; ulteriori percorsi di moduli possono contribuire alla
composizione ordinata. L'initramfs seleziona, ordina e monta i layer risultanti in sola lettura. I livelli candidati, la sostituzione del basename, i filtri, le estensioni bundle personalizzate e il coordinamento con il kernel in esecuzione sono specificati in
[Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md).

Un'immagine tipica di Xfce contiene i seguenti ruoli ordinati, anche se nomi e numeri esatti dipendono dalla build e dai moduli saltati per quel target:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

I moduli successivi hanno precedenza più alta e possono sostituire i percorsi forniti dai moduli precedenti. Un modulo può dipendere da file presenti in ogni modulo con numero inferiore, quindi un insieme di file modulo è una composizione ordinata e non una semplice raccolta di pacchetti indipendenti.

## AUFS e OverlayFS

MiniOS utilizza un filesystem unione per presentare i moduli e il layer scrivibile come un unico filesystem root. Seleziona AUFS quando il kernel in esecuzione lo supporta e passa a OverlayFS in caso contrario. `union=aufs` richiede AUFS ma passa comunque a OverlayFS se AUFS non è disponibile; `union=overlayfs` seleziona OverlayFS.

Le due implementazioni presentano una differenza operativa importante:

- AUFS inizia con il ramo scrivibile e aggiunge i moduli montati come rami in sola lettura. MiniOS può attivare o disattivare un modulo nel root in esecuzione quando il mount AUFS supporta tale operazione.
- OverlayFS riceve la sua lista `lowerdir` ordinata completa al momento del mount del root, più un `upperdir` e `workdir`. L'insieme dei moduli inferiori non può essere modificato in tempo reale dal Module Manager.

Per questo motivo, Module Manager separa **In esecuzione ora**, cioè l'insieme dei moduli montati,
da **Prossimo boot**, ovvero i moduli selezionati dai supporti e dalle regole di boot correnti. L'aggiunta o la rimozione di un modulo persistente normalmente modifica solo il prossimo boot. Creare o aprire un modulo non lo attiva. L'attivazione e la disattivazione a runtime sono disponibili solo con AUFS.

Dopo che il root è stato assemblato e il setup iniziale completato, l'initrd LiveKit utilizza `pivot_root`, mantiene il vecchio initrd per le operazioni di spegnimento ed esegue l'init del nuovo root. Il percorso dracut prepara lo stesso root assemblato ma lascia la fase finale di `switch_root` a dracut. Consulta
[Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md) per i dettagli sul passaggio di consegne.

## Layer scrivibile e sessioni

Senza persistenza, il layer scrivibile è supportato dalla memoria e scompare allo spegnimento. La persistenza può invece attivare una sessione numerata con un backend di storage supportato. Selezione, compatibilità, errori di attivazione, autorità del boot corrente e durabilità sono definiti in
[Persistenza Initrd](/configuration/Initrd-Persistence.md).

| Modalità | Storage scrivibile | Note |
|------|---------------------|-------|
| `native` | File memorizzati direttamente nella directory della sessione | Richiede un filesystem POSIX scrivibile che preservi i metadati Linux. |
| `dynfilefs` | Filesystem ext4 espandibile suddiviso su file di supporto | Supporta filesystem POSIX e supporti FAT32, NTFS o exFAT. |
| `raw` | `changes.img` a dimensione fissa contenente ext4 | Supporta filesystem POSIX e supporti FAT32, NTFS o exFAT. |
| `luks` | LUKS2 `changes.luks` contenente ext4 | Richiede cryptsetup e un initramfs costruito con il supporto alla cifratura di MiniOS. La passphrase viene richiesta durante il boot. |
| `squashfs` | Snapshot `changes.sb` compresso | Decompresso in RAM per l'utilizzo; il salvataggio ricostruisce e sostituisce atomicamente lo snapshot. Il filesystem di persistenza deve preservare i metadati Linux durante il salvataggio. |

La sessione attiva selezionata per un ripristino futuro e il layer scrivibile effettivamente autorizzato per il boot corrente sono stati correlati ma distinti. Cambiare una selezione futura non sostituisce il layer scrivibile in esecuzione.

Consulta [Gestione delle sessioni](/configuration/Session-Management.md) per i comandi di creazione, selezione, dimensionamento, cifratura, conversione, esportazione e recupero.

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

- [Modalità di boot](/configuration/Boot-Modes.md)
- [Scoperta del sistema Initrd](/configuration/Initrd-System-Discovery.md)
- [Caricamento moduli Initrd](/configuration/Initrd-Module-Loading.md)
- [Persistenza Initrd](/configuration/Initrd-Persistence.md)
- [Parametri di boot](/configuration/Boot-Parameters.md)
- [Menu di boot](/configuration/Boot-Menus.md)
- [File di configurazione](/configuration/Configuration-File.md)
- [Gestione delle sessioni](/configuration/Session-Management.md)
- [Boot da rete](/installation/Network-Boot.md)
- [Creazione dei moduli](/development/Creating-Modules.md)
