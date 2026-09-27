---
updated: 2026-09-26
---

# Desempenho

O ajuste de desempenho em MiniOS envolve equilibrar tempo de inicialização, uso de RAM, leituras em tempo de execução, sobrecarga de persistência e durabilidade do armazenamento. Para detalhes sobre as opções e limites de segurança, consulte [Modos de inicialização](/using-minios/Boot-Modes), [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading), e [Persistência Initrd](/reference/boot-process/Persistence-Internals).

## Parâmetros de Inicialização para Desempenho

Os parâmetros de inicialização permitem mover tarefas do boot e leituras do sistema ao vivo entre RAM e o dispositivo de origem. Veja [Parâmetros de inicialização](/reference/Boot-Parameters) para a referência completa.

### Carregando o sistema em RAM (`toram`)

`toram` pode reduzir a latência em tempo de execução causada por dispositivos USB lentos ou ISOs via rede, ao custo de um boot mais demorado e maior uso de RAM. O modo bare `toram`usa o caminho de cópia completa. `toram=trim`geralmente consome menos RAM, mas sua cópia mais restrita pode deixar de fora dados ou módulos necessários posteriormente.

Reserve espaço para a camada gravável, aplicativos, caches e zram, não apenas para os arquivos de módulos. Quanto mais RAM for destinado à cópia ao vivo, menos estará disponível para as cargas de trabalho. Consulte [Modos de inicialização](/using-minios/Boot-Modes) para informações sobre durabilidade da cópia e restrições de remoção da mídia.

### Filtrando Módulos (`load` e `noload`)

O filtro pode reduzir a quantidade de dados copiados e camadas montadas, especialmente com `toram=trim`. O custo é um sistema menos completo e maior risco de falha na inicialização ou em tempo de execução caso alguma dependência seja omitida. Verifique o conjunto de módulos resultante; a sintaxe dos filtros e as limitações de módulos protegidos estão definidas em [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading).

## Otimização de Persistência

A persistência move as operações de leitura e gravação da camada gravável do RAM temporário para o armazenamento ou um container. A escolha do backend afeta latência, compatibilidade, gerenciamento de capacidade e complexidade de recuperação.

### Modos de Persistência (`perchmode`)

- **`native`:** Armazena a camada gravável diretamente como arquivos comuns. Tem o menor overhead de container e não possui tamanho fixo, mas exige um sistema de arquivos de base que preserve os metadados e operações do Linux que MiniOS necessita.
- **`raw`:** Usa uma única imagem ext4 de capacidade fixa. O tamanho do arquivo é definido conforme a capacidade solicitada e o crescimento é explícito, tornando-o simples e previsível, mas sem o comportamento de capacidade dinâmica dos backends dinâmicos. O FAT32 limita a imagem única a 4000 MiB.
- **`dynfilefs`:** O backend FUSE/format-400 expande o armazenamento do payload sob demanda e suporta mídias normalmente inadequadas. Seu índice não é esparso: cada bloco lógico de 4 KiB declarado precisa de um deslocamento de 8 bytes, então a capacidade lógica custa cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento de índice de base por GiB, mesmo quando o payload está vazio. Isso torna capacidades moderadas eficientes, mas capacidades grandes e dinâmicas caras desde o início.
- **`dynblk`:** O backend format-1 `DBSPRS01` kernel mantém tabelas de mapeamento em disco e um cache de metadados limitado em RAM (padrão 1 MiB). Preencher um dispositivo existente não aloca um mapa residente completo. Descrições de extensões e diretórios escalam conforme as partes declaradas; cache de arquivos e memória do codec são adicionais. `dynblk limits --format dynblk` informa o limite de geometria; `dynblk status /dev/dynblkN --json` informa buffers contabilizados e estatísticas de cache. Sobrescritas brutas comuns permanecem no lugar; atualizações parciais comprimidas atualmente recomprimem um bloco de 64 KiB. Escolha a política de cache de anexos deliberadamente: `unsafe` abre mão das garantias de durabilidade.
- **`squashfs`:** Armazena um snapshot compactado e reconstrói a camada superior gravável em RAM a cada inicialização. Minimiza o armazenamento persistente para sessões majoritariamente estáveis, mas consome CPU e RAM durante a restauração e regrava o snapshot ao salvar. Quando há memória disponível, o salvamento prepara uma cópia estável das alterações em RAM e comprime diretamente em um candidato privado no diretório da sessão. Após verificação e sincronização, MiniOS substitui atomicamente `changes.sb`; não grava uma segunda cópia compactada. Se RAM não comportar a árvore de preparação, utiliza o espaço de trabalho em disco existente para essa árvore.

LUKS2 pode envolver Raw, DynFileFS ou DynBlk. A criptografia adiciona etapas de desbloqueio e overhead de criptografia, mantendo a capacidade e o comportamento de armazenamento do backend subjacente.

Teste cargas de trabalho representativas no dispositivo real. Diferenças de controlador flash, sistema de arquivos, bridge USB, criptografia, compactação e tipo de uso são mais relevantes do que uma classificação universal dos modos de persistência.

### Reduza gravações de cache e logs com `perch`

Configurador do MiniOS **Avançado** oferece configurações de armazenamento independentes para logs comuns do sistema, downloads do APT e caches nativos padrão dos navegadores. Elas também funcionam em `minios/config.conf` ou seus `config.conf.d/*.conf` fragmentos:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Cada configuração aceita `persistent` (padrão) ou `volatile`. Reinicie após alterar uma delas. `minios-boot` aplica a política somente quando a sessão do `perch` está confirmada como gravável e durável; solicitar persistência não é suficiente. Para um boot único, use `log-storage=volatile`, `apt-cache=volatile`, ou `browser-cache=volatile` na linha de comando do kernel. As formas com prefixo `live-config.` também funcionam e têm prioridade sobre os arquivos de configuração. Essas configurações **não** ativam `perch` por si só. Veja [Arquivo de configuração](/reference/configuration/config.conf) para ordem dos arquivos-fonte e [Parâmetros de inicialização](/reference/Boot-Parameters) para a sintaxe completa.

| Configuração | O que permanece em RAM com `volatile` | O que fica no armazenamento persistente |
|---|---|---|
| `LIVE_LOG_STORAGE` | O journal do systemd (máximo de 32 MiB) e arquivos de `/var/log` comuns (32 MiB em tmpfs). | Diagnósticos de inicialização em `/var/log/minios/` e `/var/log/live/`, incluindo três versões anteriores dos logs. |
| `LIVE_APT_CACHE` | Pacotes baixados em `/var/cache/apt/archives` (256 ou 512 MiB em tmpfs, dependendo da memória disponível). | Estado dos pacotes em `/var/lib/dpkg`, listas de repositórios em `/var/lib/apt/lists`, e arquivos instalados. |
| `LIVE_BROWSER_CACHE` | Um tmpfs compartilhado de 512 MiB para diretórios de cache padrão do Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera e Yandex Browser, sob o `~/.cache` do usuário ao vivo. Uma política do sistema desativa o cache em disco do Firefox. | Perfis, cookies, senhas, dados de sites e caches de aplicativos não relacionados. |

Os caches do APT e do navegador RAM são ignorados se houver menos de 1 GiB disponível ou se a troca sem zRAM estiver ativa. O tmpfs do arquivo do APT não transborda para o dispositivo: um download maior que a capacidade restante pode falhar. Um `policies.json` do Firefox já existente não é substituído; revise a configuração do cache em disco separadamente. Os caminhos padrão dos navegadores são preparados após a criação do usuário ao vivo, inclusive quando um navegador é instalado depois. Caminhos personalizados, instalações Flatpak/Snap e usuários criados após essa configuração não são redirecionados automaticamente. Caches de navegador armazenados anteriormente ficam ocultos pelas montagens RAM neste boot e reaparecem ao retornar para `persistent`.

Os logs de boot permanecem no armazenamento persistente gravável independentemente da configuração normal de logs; uma sessão SquashFS mantém esses logs fora `changes.sb`, então eles não dependem do salvamento do snapshot ao desligar. Com `volatile`, outros arquivos em `/var/log` (incluindo o histórico de texto do APT/dpkg) desaparecem ao reiniciar. `EXPORT_LOGS=true` é uma exportação explícita separada para o meio MiniOS. Um log tmpfs completo de 32 MiB para de aceitar novas gravações de log em vez de transferir para a memória flash. Se uma swap baseada em disco for ativada depois, arquivos em memória ainda podem ser paginados para essa swap. Veja [Solução de problemas](/maintenance-and-recovery/Troubleshooting#collecting-logs) para localizar os diagnósticos de boot.

MiniOS também utiliza `noatime` ao montar seus próprios sistemas de arquivos de dados e containers, evitando atualizações de metadados de tempo de acesso; isso não remonta discos de usuário não relacionados. O padrão `relatime` já limita esse tipo de atualização, então meça a diferença antes de considerar isso uma grande economia. Mantenha o journal do sistema de arquivos, barreiras e `fsync` ativados para um armazenamento persistente removível.

Para uma gravação controlada de arquivo de log de 16 MiB seguida por `sync`, uma VM Testo registrou 33.304 setores gravados em seu disco virtual inferior no modo persistente e 8 no modo volátil. Isso demonstra a mudança no caminho de gravação para esse tipo de carga de trabalho. Não mede gravações internas no controlador USB flash nem prevê a vida útil do NAND. Compare cargas de trabalho idênticas do aplicativo no dispositivo real antes de tirar conclusões sobre a vida útil.

## Configuração do ZRAM

O zram utiliza tempo de CPU para aumentar a capacidade de memória comprimida e pode evitar o uso de swap em disco, que é muito mais lento. Um dispositivo zram maior pode absorver mais páginas inativas, mas não cria RAM física; cargas de trabalho incompressíveis ainda consomem memória.
Os algoritmos de compactação equilibram desempenho e uso de CPU em relação à taxa de compressão, e a disponibilidade depende do kernel. Comece com o padrão e altere `zramsize`, `zramcomp`, ou `nozram` apenas para uma carga de trabalho medida; veja [Parâmetros de boot](/reference/Boot-Parameters) para os valores aceitos.

## Sistema de Arquivos e Hardware de Armazenamento

- **Escolha do dispositivo:** Uma maior taxa de transferência sequencial reduz o tempo de cópia de módulos grandes, enquanto uma baixa latência de I/O aleatória é mais importante para cargas de trabalho persistentes em desktop.
  Meça o desempenho do dispositivo junto com o gabinete; apenas a geração USB não determina o desempenho do flash ou SSD.
- **Escolha do sistema de arquivos:** Um sistema de arquivos nativo do Linux pode usar persistência nativa sem a sobrecarga de containers. Sistemas de arquivos multiplataforma aumentam a portabilidade, mas exigem um backend de container compatível para metadados do Linux, adicionando camadas de mapeamento e sistema de arquivos. Escolha considerando portabilidade, necessidades de recuperação e resultados de benchmark.
