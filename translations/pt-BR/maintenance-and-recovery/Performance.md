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

- **`native`:** Armazena a camada gravável diretamente como arquivos comuns. Tem o menor overhead de contêiner e não possui tamanho fixo, mas exige um sistema de arquivos de suporte que preserve os metadados do Linux e as operações que MiniOS precisa.
- **`raw`:** Utiliza uma imagem ext4 de capacidade fixa. O tamanho do arquivo é definido conforme a capacidade solicitada e o crescimento é explícito, tornando-o simples e previsível, mas sem o comportamento dinâmico dos backends elásticos. O FAT32 limita a imagem única a 4000 MiB.
- **`dynfilefs`:** O backend FUSE/format-400 expande o armazenamento de dados sob demanda e suporta mídias que normalmente não seriam adequadas. Seu índice não é esparso: cada bloco lógico de 4 KiB declarado precisa de um deslocamento de 8 bytes, então a capacidade lógica consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento de índice por GiB, mesmo quando o conteúdo está vazio. Isso torna capacidades moderadas eficientes, mas capacidades grandes e elásticas caras logo de início.
- **`dynblk`:** O backend format-1 `DBSPRS01` do kernel mantém tabelas de mapeamento em disco e um cache de metadados limitado em RAM (padrão 1 MiB). Preencher um dispositivo existente não aloca um mapa residente completo. Descrições de extensão e diretórios escalam conforme as partes declaradas; cache de arquivos e memória do codec são adicionais. `dynblk limits --format dynblk` informa o limite de geometria; `dynblk status /dev/dynblkN --json` informa buffers e estatísticas de cache contabilizados. Sobrescritas brutas comuns permanecem no lugar; atualizações parciais comprimidas atualmente recomprimem um bloco de 64 KiB. Escolha a política de cache de anexos com atenção: `unsafe` abre mão das garantias de durabilidade.
- **`squashfs`:** Armazena um snapshot compactado e reconstrói a camada superior gravável em RAM a cada inicialização. Minimiza o uso de armazenamento persistente para sessões majoritariamente estáveis, mas consome CPU e RAM ao restaurar e regrava o snapshot ao salvar. Quando há memória suficiente, o salvamento prepara uma cópia estável das alterações em RAM e comprime diretamente em um candidato privado no diretório da sessão. Após verificação e sincronização, MiniOS substitui `changes.sb`; não é gravada uma segunda cópia compactada. Se RAM não comportar a árvore de preparação, o espaço de trabalho em disco existente é usado para essa árvore.

LUKS2 pode envolver Raw, DynFileFS ou DynBlk. A criptografia adiciona etapas de desbloqueio e processamento, mantendo a capacidade e o comportamento de armazenamento do backend subjacente.

Avalie cargas de trabalho representativas no próprio dispositivo. Diferenças no controlador flash, sistema de arquivos, bridge USB, criptografia, compactação e perfil de uso são mais relevantes do que um ranking universal dos modos de persistência.

### Reduza gravações de cache e log com o `perch`

Configurador do MiniOS**Avançado** oferece configurações de armazenamento independentes para logs do sistema, downloads do APT e caches nativos padrão dos navegadores. Elas também funcionam no `minios/config.conf` ou em seus `config.conf.d/*.conf` fragmentos:

```bash
LIVE_LOG_STORAGE="volatile"
LIVE_APT_CACHE="volatile"
LIVE_BROWSER_CACHE="volatile"
```

Cada configuração aceita `persistent` (padrão) ou `volatile`. Reinicie após alterar uma delas. `minios-boot` aplica a política somente quando a sessão do `perch` está confirmada como gravável e durável; apenas solicitar persistência não é suficiente. Para um boot único, use `log-storage=volatile`, `apt-cache=volatile`, ou `browser-cache=volatile` na linha de comando do kernel. As formas com prefixo `live-config.` também funcionam e têm prioridade sobre arquivos de configuração. Essas opções **não** ativam `perch` sozinhas. Veja [Arquivo de configuração](/reference/configuration/config.conf) para a ordem dos arquivos de origem e [Parâmetros de boot](/reference/Boot-Parameters) para a sintaxe completa.

| Configuração | O que permanece em RAM com `volatile` | O que fica no armazenamento persistente |
|---|---|---|
| `LIVE_LOG_STORAGE` | O journal do systemd (máximo 32 MiB) e arquivos comuns de `/var/log` (32 MiB em tmpfs). | Diagnósticos de boot em `/var/log/minios/` e `/var/log/live/`, incluindo três versões anteriores dos logs. |
| `LIVE_APT_CACHE` | Pacotes baixados em `/var/cache/apt/archives` (256 ou 512 MiB em tmpfs, conforme a memória disponível). | Estado dos pacotes em `/var/lib/dpkg`, listas de repositórios em `/var/lib/apt/lists`, e arquivos instalados. |
| `LIVE_BROWSER_CACHE` | Um tmpfs compartilhado de 512 MiB para os diretórios de cache padrão do Firefox/ESR, Chromium, Chrome, Edge, Brave, Vivaldi, Opera e Yandex Browser no diretório do usuário ao vivo `~/.cache`. Uma política do sistema desativa o cache em disco do Firefox. | Perfis, cookies, senhas, dados de sites e caches de outros aplicativos. |

Os caches do APT e dos navegadores RAM são ignorados se houver menos de 1 GiB disponível ou se houver swap não-zRAM ativo. O tmpfs do repositório APT não transborda para o dispositivo: um download maior que a capacidade restante pode falhar. Um `policies.json` do Firefox já existente não é substituído; revise a configuração de cache em disco separadamente. Os caminhos nativos padrão dos navegadores são preparados após a criação do usuário ao vivo, inclusive se o navegador for instalado depois. Caminhos personalizados, instalações Flatpak/Snap e usuários criados após essa configuração não são redirecionados automaticamente. Caches de navegador armazenados anteriormente ficam ocultos pelas montagens RAM deste boot e reaparecem ao retornar para `persistent`.

Os logs de boot permanecem no armazenamento persistente gravável independentemente da configuração dos logs comuns; uma sessão SquashFS mantém esses arquivos fora de `changes.sb`, então não dependem do salvamento do snapshot no desligamento. Com `volatile`, outros arquivos em `/var/log` (incluindo histórico de texto do APT/dpkg) somem ao reiniciar. `EXPORT_LOGS=true` é uma exportação separada e explícita para a mídia MiniOS. Um tmpfs de log cheio (32 MiB) deixa de aceitar novas gravações em vez de gravar no flash. Se outro swap em disco for ativado depois, arquivos em memória ainda podem ser paginados para esse swap. Veja [Resolução de problemas](/maintenance-and-recovery/Troubleshooting#collecting-logs) para localizar os diagnósticos de boot.

MiniOS também utiliza `noatime` ao montar seus próprios dados e sistemas de arquivos de contêiner, evitando atualizações de metadados de acesso; isso não remonta discos de usuário não relacionados. O padrão `relatime` já limita esse tipo de atualização, portanto, meça o impacto antes de considerar isso uma grande economia. Mantenha o journal do sistema de arquivos, barreiras e `fsync` ativados para armazenamento persistente removível.

Para um teste controlado de gravação de log de 16 MiB seguido de `sync`, uma VM Testo registrou 33.304 setores gravados no disco virtual inferior em modo persistente e 8 em modo volátil. Isso demonstra a diferença no caminho de gravação para essa carga de trabalho. Não mede gravações internas ao controlador flash USB nem prevê a vida útil do NAND. Compare cargas de trabalho idênticas do aplicativo no dispositivo real antes de tirar conclusões sobre a durabilidade.
