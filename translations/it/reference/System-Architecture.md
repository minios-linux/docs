---
updated: 2026-09-16
---

# Architettura di sistema

MiniOS avvia un sistema operativo in sola lettura assemblato da moduli SquashFS e aggiunge un livello scrivibile per la sessione corrente. L'initramfs si occupa di individuare il supporto, selezionare i moduli e la persistenza, costruire il filesystem root, applicare la configurazione iniziale e trasferire il controllo al sistema di init installato.

## Rilevamento del boot

Il bootloader BIOS o UEFI carica un kernel Linux e un initramfs MiniOS da `minios/boot/`. L'initramfs quindi rileva l'albero dati MiniOS che contiene i moduli live. Una sorgente può essere locale, selezionata interattivamente o fornita tramite un percorso di rete supportato; un ISO locale viene montato in loop prima che il suo albero dati venga utilizzato. La precedenza esatta e le forme accettate di `from=` sono documentate in [Rilevamento del sistema Initrd](/reference/boot-process/System-Discovery).

La stessa fase di rilevamento supporta sorgenti ISO HTTP e PXE. La rete opzionale in fase di avvio anticipato serve solo per **caricare MiniOS tramite rete** (PXE / ISO HTTP). Non si tratta di una configurazione di rete persistente per la sessione. Vedi [Avvio da rete](/reference/boot-process/Network-Boot).

Dopo il rilevamento, MiniOS può opzionalmente preparare una copia RAM. Se la sorgente originale rimane necessaria dipende dalla modalità di copia, dalla persistenza e dal distacco riuscito. Consulta [Modalità di avvio](/using-minios/Boot-Modes) per il modello operativo.

## Composizione dei moduli

Ogni file `.sb` è un filesystem SquashFS in sola lettura. I moduli integrati sono memorizzati direttamente sotto `minios/`; posizioni aggiuntive dei moduli possono contribuire alla composizione ordinata. L'initramfs seleziona, ordina e monta i livelli risultanti in sola lettura. I livelli candidati, la sostituzione del basename, i filtri, le estensioni personalizzate dei bundle e il coordinamento con il kernel in esecuzione sono specificati in [Caricamento moduli Initrd](/reference/boot-process/Module-Loading).

Un'immagine Xfce tipica contiene i seguenti ruoli ordinati, anche se nomi e numeri esatti dipendono dalla build e dai moduli saltati per quel target:

```text
00-core-<arch>.sb
01-kernel-<version>-<arch>.sb
02-firmware-<arch>.sb
03-gui-base-<arch>.sb
04-xfce-desktop-<arch>.sb
05-apps-<arch>.sb or the next applicable module
```

I moduli successivi hanno priorità superiore e possono sostituire i percorsi forniti dai moduli precedenti. Un modulo può dipendere da file presenti in qualsiasi modulo con numero inferiore, quindi un insieme di file modulo è una composizione ordinata e non una semplice raccolta di pacchetti indipendenti.

## AUFS e OverlayFS

MiniOS utilizza un union filesystem per presentare i moduli e il layer scrivibile come un unico filesystem root. Seleziona AUFS quando il kernel in esecuzione lo supporta e in caso contrario passa a OverlayFS. `union=aufs` richiede AUFS ma utilizza comunque OverlayFS se AUFS non è disponibile; `union=overlayfs` seleziona OverlayFS. Con UEFI Secure Boot, initrd non carica il modulo non firmato `aufs-ng` e utilizza OverlayFS a meno che non sia già presente un'altra implementazione AUFS utilizzabile.

Le due implementazioni presentano una differenza operativa importante:

- AUFS parte dal ramo scrivibile e aggiunge i moduli montati come rami in sola lettura. MiniOS può attivare o disattivare un modulo nel root attivo se il mount AUFS supporta questa operazione.
- OverlayFS riceve l'elenco completo e ordinato `lowerdir` dei moduli quando il root viene montato, più un `upperdir` e `workdir`. L'insieme dei moduli inferiori non può essere modificato in tempo reale da **Gestore moduli MiniOS**.

**Gestore moduli MiniOS** separa quindi **In esecuzione ora**, l'insieme dei moduli montati, da **Avvio successivo**, i moduli selezionati dai supporti e dalle regole di boot correnti. L'aggiunta o la rimozione di un modulo persistente normalmente modifica solo il prossimo avvio. Creare o aprire un modulo non lo attiva. L'attivazione e la disattivazione in tempo reale sono disponibili solo con AUFS.

Dopo che il root è stato assemblato e il setup iniziale è completato, l'initrd di LiveKit utilizza `pivot_root`, mantiene il vecchio initrd per le operazioni di spegnimento ed esegue l'init del nuovo root. Il percorso dracut prepara lo stesso root assemblato ma lascia il passaggio finale `switch_root` a dracut. Vedi [Caricamento moduli initrd](/reference/boot-process/Module-Loading) per i dettagli sul confine di passaggio.

## Layer scrivibile e sessioni

Senza persistenza, il layer scrivibile è supportato dalla memoria e scompare allo spegnimento. Attivando la persistenza, invece, si può avviare una sessione numerata con un backend di storage supportato. La selezione, la compatibilità, eventuali errori di attivazione, l'autorità per l'avvio corrente e la durabilità sono definiti in [Persistenza initrd](/reference/boot-process/Persistence-Internals).

| Modalità | Storage scrivibile | Note |
|------|------------------|-------|
| `native` | File archiviati direttamente nella directory della sessione | Richiede un filesystem POSIX scrivibile che conservi i metadati Linux. |
| `dynfilefs` | Filesystem ext4 espandibile suddiviso tra file di supporto | Supporta filesystem POSIX e supporti FAT32, NTFS o exFAT. |
| `dynblk` | Filesystem ext4 leggero su un device a blocchi kernel supportato da `volumeNNN.db` file | Richiede il supporto DynBlk in userspace, kernel e initrd. |
| `raw` | Immagine a dimensione fissa `changes.img` contenente ext4 | Supporta filesystem POSIX e supporti FAT32, NTFS o exFAT. |
| `squashfs` | Snapshot `changes.sb` compresso | Viene estratto in RAM per l'uso; il salvataggio ricostruisce e sostituisce atomicamente lo snapshot. Il filesystem di persistenza deve mantenere i metadati Linux durante il salvataggio. |

Raw, DynFileFS e DynBlk possono opzionalmente includere un layer LUKS2. I metadati registrano separatamente backend di storage e cifratura. Allo spegnimento vengono rilasciati ext4, il mapper, eventuali loop posseduti e il backend secondo l'ordine delle dipendenze.

La sessione attiva selezionata per una ripresa futura e il layer scrivibile effettivamente autorizzato per l'avvio corrente sono stati correlati ma distinti. Modificare una selezione futura non sostituisce il layer scrivibile in esecuzione.

Vedi [Gestione sessioni](/using-minios/Sessions-and-Persistence) per i comandi di creazione, selezione, dimensionamento, cifratura, conversione, esportazione e recupero.

## Precedenza della configurazione

La configurazione del supporto è `minios/config.conf`, con frammenti opzionali in `minios/config.conf.d/`. Le copie runtime sono `/etc/live/config.conf` e `/etc/live/config.conf.d/` nel root composto.

All'avvio, MiniOS confronta i tempi di modifica e copia un file del supporto più recente nel root runtime. Se il supporto è scrivibile e la copia runtime è più recente, viene copiata nuovamente sul supporto. I file frammento vengono sincronizzati per nome in entrambe le direzioni. Se l'orologio è stato riportato indietro dall'ultima sincronizzazione, MiniOS evita la sostituzione dei timestamp e riempie solo le destinazioni mancanti.

Le opzioni della riga di comando del kernel sovrascrivono i valori corrispondenti letti dalla configurazione runtime per quell'avvio. Questo significa che l'ordine effettivo per un'impostazione esplicitamente supportata è il parametro di avvio, poi la configurazione runtime/supporto sincronizzata, poi il valore predefinito integrato. Le modifiche persistenti alla configurazione runtime possono diventare la configurazione del supporto quando la sorgente è scrivibile; i supporti ISO in sola lettura non possono ricevere tale aggiornamento.

Consulta [File di configurazione](/reference/configuration/config.conf) e [live-config](/reference/configuration/live-config) per le impostazioni supportate.

## Ciclo di spegnimento e salvataggio

Lo spegnimento normale dà innanzitutto al sistema in esecuzione la possibilità di svuotare i servizi e i dati di sessione. Una sessione SquashFS con salvataggio allo spegnimento abilitato viene ricostruita e validata prima dello smontaggio del filesystem. Il backend di salvataggio scrive un marcatore di completamento per la sessione esatta in esecuzione; l'initramfs di spegnimento controlla quel marcatore e lascia la sessione sporca se il salvataggio richiesto non è riuscito.

L'initramfs di spegnimento quindi scollega i dispositivi loop inutilizzati, smonta il vecchio root e il livello scrivibile, registra una sessione riuscita come pulita, smonta il supporto e chiude una mappatura LUKS di proprietà MiniOS. I supporti ottici possono quindi essere espulsi prima dello spegnimento o del riavvio. I salvataggi manuali e periodici SquashFS utilizzano lo stesso backend snapshot, ma solo la policy di spegnimento configurata blocca la finalizzazione pulita in caso di salvataggio mancante allo spegnimento.

## Albero dei media

Un'immagine attuale è organizzata come segue. Le directory opzionali compaiono solo quando la funzione correlata ha creato dei contenuti.

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

I percorsi avviati sotto `/run/initramfs/memory/` sono mount di implementazione, non una seconda copia persistente di questo albero.

## Documentazione correlata

- [Modalità di avvio](/using-minios/Boot-Modes)
- [Rilevamento del sistema Initrd](/reference/boot-process/System-Discovery)
- [Caricamento moduli Initrd](/reference/boot-process/Module-Loading)
- [Persistenza Initrd](/reference/boot-process/Persistence-Internals)
- [Parametri di avvio](/reference/Boot-Parameters)
- [Menu di avvio](/preparing-and-customizing/Customizing-the-Boot-Menu)
- [File di configurazione](/reference/configuration/config.conf)
- [Gestione sessioni](/using-minios/Sessions-and-Persistence)
- [Avvio da rete](/reference/boot-process/Network-Boot)
- [Creazione moduli](/preparing-and-customizing/Managing-Modules#creating-modules)
