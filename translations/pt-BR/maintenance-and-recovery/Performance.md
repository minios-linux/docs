---
updated: 2026-10-15
---

# Desempenho

O ajuste de desempenho no MiniOS envolve principalmente equilibrar o tempo de inicialização, o uso de RAM, as leituras em tempo de execução, a sobrecarga de persistência e a durabilidade do armazenamento. Para saber o significado exato das opções e seus limites de segurança, consulte [Modos de inicialização](/using-minios/Boot-Modes), [Carregamento de módulos do initrd](/reference/boot-process/Module-Loading) e [Persistência do initrd](/reference/boot-process/Persistence-Internals).

## Parâmetros de inicialização para melhorar o desempenho

Os parâmetros de inicialização podem transferir tarefas de inicialização e leituras do sistema em execução entre RAM e o dispositivo de origem. Consulte [Parâmetros de inicialização](/reference/Boot-Parameters) para ver a referência completa.

### Carregar o sistema em RAM (`toram`)

`toram` pode reduzir a latência em tempo de execução causada por um dispositivo USB lento ou uma ISO hospedada na rede, ao custo de uma inicialização mais demorada e de um consumo significativamente maior de RAM. Bare `toram` usa o caminho de cópia completa. `toram=trim` geralmente consome menos RAM, mas sua cópia mais limitada pode deixar de incluir dados ou módulos necessários posteriormente.

Reserve espaço para a camada gravável, os aplicativos, os caches e o zram, em vez de dimensionar o espaço considerando apenas os arquivos de módulo. Quanto mais RAM for destinado à cópia em execução, menos ficará disponível para a carga de trabalho. Consulte [Modos de inicialização](/using-minios/Boot-Modes) para conhecer as restrições de durabilidade da cópia e remoção da mídia.

### Filtragem de módulos (`load` e `noload`)

A filtragem pode reduzir os dados copiados e as camadas montadas, especialmente com `toram=trim`. O custo é um sistema menos capaz e maior risco de falhas na inicialização ou em tempo de execução caso uma dependência seja omitida. Verifique o conjunto de módulos resultante; a sintaxe dos filtros e as limitações para módulos protegidos estão definidas em [Carregamento de módulos do initrd](/reference/boot-process/Module-Loading).

## Otimização da persistência

A persistência transfere as operações de E/S da camada gravável de RAM temporário para o armazenamento ou um contêiner. A escolha do backend afeta a latência, a compatibilidade, o gerenciamento de capacidade e a complexidade da recuperação.

### Modos de persistência (`perchmode`)

- **`native`:** Armazena a camada gravável diretamente como arquivos comuns. Tem a menor sobrecarga de contêiner e não possui tamanho fixo, mas requer um sistema de arquivos subjacente que preserve os metadados e as operações do Linux necessários para MiniOS.
- **`raw`:** Usa uma única imagem ext4 de capacidade fixa. O tamanho do arquivo é definido de acordo com a capacidade solicitada e a expansão é explícita. Por isso, é simples e previsível, mas não oferece o comportamento de capacidade sob demanda dos backends dinâmicos. O FAT32 limita a imagem única a 4000 MiB.
- **`dynfilefs`:** O FUSE/formato 400 expande o armazenamento de dados sob demanda e funciona com mídias que, de outro modo, seriam inadequadas. Seu índice não é esparso: cada bloco lógico declarado de 4 KiB exige um deslocamento de 8 bytes. Assim, cada GiB de capacidade lógica consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento para o índice subjacente, mesmo quando não há dados. Isso torna eficientes as capacidades moderadas, mas faz com que grandes capacidades sob demanda tenham um custo inicial elevado.
- **`dynblk`:** O backend do kernel formato 1 `DBSPRS01` mantém tabelas de mapeamento em disco e um cache de metadados limitado em RAM (padrão: 1 MiB). Preencher um dispositivo existente não aloca um mapa inteiro na memória. As descrições de extensões e os diretórios aumentam conforme as partes declaradas; o cache de arquivos e a memória do codec são adicionais. `dynblk limits --format dynblk` informa o limite de geometria; `dynblk status /dev/dynblkN --json` informa as estatísticas dos buffers contabilizados e do cache. Gravações comuns em arquivos raw permanecem no mesmo local; atualizações parciais de dados compactados atualmente recompõem um bloco de 64 KiB. Escolha cuidadosamente a política de cache de anexos: `unsafe` abre mão das garantias de durabilidade.
- **`vmdk`:** Usa o driver de kernel DynBlk com armazenamento VMDK esparso dividido padrão. Ele cresce sob demanda, mas não oferece compactação pelo backend. Assim como os contêineres nativos DynBlk, pode ser copiado para RAM separadamente dos módulos do sistema e salvo explicitamente de volta no armazenamento.
- **`squashfs`:** Armazena um snapshot compactado e reconstrói a camada superior gravável em RAM a cada inicialização. Reduz ao mínimo o armazenamento persistente em sessões que mudam pouco, mas exige mais CPU e RAM durante a restauração e regrava o snapshot ao salvar. Quando há memória suficiente, o salvamento prepara uma cópia estável das alterações em RAM e compacta os dados diretamente em um único arquivo candidato privado no diretório da sessão. Após a verificação e a sincronização, MiniOS substitui atomicamente `changes.sb`; não grava uma segunda cópia compactada. Se RAM não comportar a árvore de preparação, o espaço de trabalho em disco existente será usado para essa árvore.

O LUKS2 pode encapsular Raw, DynFileFS, DynBlk ou VMDK. A criptografia acrescenta etapas de desbloqueio e sobrecarga de processamento criptográfico, mantendo o comportamento de capacidade e armazenamento do backend subjacente. A compactação DynBlk é desativada quando o LUKS2 é usado; o VMDK nunca oferece compactação pelo backend.

Faça benchmarks com cargas de trabalho representativas no dispositivo real. Diferenças no controlador flash, no sistema de arquivos, na ponte USB, na criptografia, na compactação e na carga de trabalho são mais confiáveis do que uma classificação universal dos modos de persistência.

<a id="reduce-cache-and-log-writes-with-perch"></a>

### Reduza gravações de cache e logs com `perch`

Configurador do MiniOS **Avançado** permite definir separadamente o armazenamento de logs comuns do sistema, downloads do APT e caches padrão dos navegadores nativos. Essas opções também funcionam em `minios/config.conf` ou em seus `config.conf.d/*.conf` fragmentos:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Cada configuração aceita `persistent` (o padrão) ou `volatile`. Reinicie após alterar uma configuração. `minios-boot` aplica a política após a ativação bem-sucedida da persistência em armazenamento durável ou em uma sessão gravável RAM com um registro `ram-origin` protegido; solicitar persistência não é suficiente. Para uma inicialização única, use `log-storage=volatile`, `apt-cache=volatile`, ou `browser-cache=volatile` na linha de comando do kernel. As opções com prefixo `live-config.` também funcionam e têm precedência sobre os arquivos de configuração. Essas configurações **não** ativam `perch` por conta própria. Consulte [Arquivo de configuração](/reference/configuration/config.conf) para saber a ordem dos arquivos de origem e [Parâmetros de inicialização](/reference/Boot-Parameters) para ver a sintaxe completa.

| Configuração | O que permanece em RAM com `volatile` | O que permanece no armazenamento persistente |
|---|---|---|
| `LIVE_LOG_STORAGE` | O journal do systemd (máximo de 32 MiB) e os arquivos comuns de `/var/log` (tmpfs de 32 MiB). | Diagnósticos de inicialização em `/var/log/minios/` e `/var/log/live/`, incluindo três versões anteriores dos logs. |
| `LIVE_APT_CACHE` | Pacotes baixados em `/var/cache/apt/archives` (tmpfs de 256 ou 512 MiB, conforme a memória disponível). | Estado dos pacotes em `/var/lib/dpkg`, listas de repositórios em `/var/lib/apt/lists`, e arquivos instalados. |
| `LIVE_BROWSER_CACHE` | Um tmpfs compartilhado de 512 MiB para os diretórios de cache padrão do Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera e Yandex Browser no diretório `~/.cache` do usuário da sessão live. Uma política do sistema desativa o cache em disco do Firefox. | Perfis, cookies, senhas, dados de sites e caches de outros aplicativos. |

Os caches do APT e do navegador RAM são ignorados se houver menos de 1 GiB disponível ou se o swap que não seja zRAM estiver ativo. O tmpfs do arquivo de pacotes do APT não transborda para o dispositivo: um download maior que a capacidade restante pode falhar. Uma configuração existente de cache do Firefox `policies.json` não é substituída; verifique separadamente a configuração do cache em disco. Os caminhos padrão dos navegadores nativos são preparados após a criação do usuário da sessão live, inclusive quando um navegador é instalado posteriormente. Caminhos personalizados, instalações Flatpak/Snap e usuários criados depois dessa configuração não são redirecionados automaticamente. Os caches de navegador armazenados anteriormente ficam ocultos pelas montagens RAM durante esta inicialização e reaparecem quando se volta para `persistent`.

Com persistência durável, os logs de inicialização permanecem no armazenamento da sessão gravável, independentemente da configuração de logs comuns; uma sessão durável SquashFS mantém esses logs fora de `changes.sb`, portanto eles não dependem do salvamento do snapshot durante o desligamento. Uma sessão copiada com `perchtoram` é diferente: seus logs permanecem na memória até serem salvos no armazenamento. Com `volatile`, os outros arquivos em `/var/log` (incluindo o histórico de texto do APT/dpkg) desaparecem ao reiniciar. `EXPORT_LOGS=true` é uma exportação explícita separada para a mídia MiniOS. Um tmpfs de logs cheio, com 32 MiB, deixa de aceitar novas gravações de logs em vez de transferi-las para a memória flash. Se outro swap baseado em disco for ativado posteriormente, arquivos mantidos na memória ainda poderão ser paginados para esse swap. Consulte [Solução de problemas](/maintenance-and-recovery/Troubleshooting#collecting-logs) para saber como localizar os diagnósticos de inicialização.

MiniOS também usa `noatime` ao montar seus próprios sistemas de arquivos de dados e contêineres, evitando atualizações dos metadados de tempo de acesso; isso não remonta discos de usuário não relacionados. O `relatime` padrão já limita essas atualizações, então meça a diferença antes de considerá-la uma economia significativa. Mantenha o journal do sistema de arquivos, as barreiras e `fsync` ativados em um armazenamento persistente removível.

Em um teste controlado de gravação de 16 MiB em arquivo de log, seguido de `sync`, uma VM Testo registrou 33.304 setores gravados no disco virtual inferior no modo persistente e 8 no modo volátil. Isso demonstra a mudança no caminho de gravação para essa carga de trabalho. Não mede as gravações dentro de um controlador de memória flash USB nem prevê a vida útil da NAND. Compare cargas de trabalho idênticas de aplicativos no dispositivo real antes de tirar conclusões sobre a vida útil.

## Configuração do ZRAM

O zram troca tempo de CPU por capacidade de memória compactada e pode evitar o uso de swap em armazenamento, muito mais lento. Um dispositivo zram maior pode acomodar mais páginas inativas, mas não cria RAM físico; cargas de trabalho com dados incompressíveis ainda consomem memória.
Os algoritmos de compactação equilibram taxa de transferência e uso de CPU com a taxa de compactação, e sua disponibilidade depende do kernel. Comece com o padrão e altere `zramsize`, `zramcomp` ou `nozram` somente para uma carga de trabalho medida; consulte [Parâmetros de inicialização](/reference/Boot-Parameters) para ver os valores aceitos.

## Sistemas de arquivos e hardware de armazenamento

- **Escolha do dispositivo:** Maior throughput sequencial acelera a cópia de módulos grandes, enquanto a baixa latência de E/S aleatória é mais importante para cargas de trabalho persistentes no desktop.
  Meça o dispositivo e o gabinete em conjunto; a geração USB, por si só, não permite prever o desempenho da memória flash ou do SSD.
- **Escolha do sistema de arquivos:** Um sistema de arquivos nativo do Linux pode usar persistência nativa sem a sobrecarga de um contêiner. Sistemas de arquivos multiplataforma aumentam a portabilidade, mas exigem um backend de contêiner compatível com metadados do Linux, adicionando camadas de mapeamento e de sistema de arquivos. Escolha considerando também as necessidades de portabilidade e recuperação, além dos resultados dos benchmarks.
