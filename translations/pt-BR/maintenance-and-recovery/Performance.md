---
updated: 2026-09-17
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

- **`native`:** Armazena a camada gravável diretamente como arquivos comuns. Tem o menor overhead de contêiner e não possui tamanho fixo, mas exige um sistema de arquivos de suporte que preserve os metadados e operações do Linux que MiniOS necessita.
- **`raw`:** Usa uma única imagem ext4 de capacidade fixa. O tamanho do arquivo é definido conforme a capacidade solicitada e o crescimento é explícito, tornando-o simples e previsível, mas sem o comportamento de capacidade dinâmica dos backends dinâmicos. O FAT32 limita a imagem única a 4000 MiB.
- **`dynfilefs`:** O backend FUSE/format-400 expande o armazenamento do payload sob demanda e suporta mídias que normalmente não seriam adequadas. Seu índice não é esparso: cada bloco lógico de 4 KiB declarado exige um deslocamento de 8 bytes, então a capacidade lógica consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento de índice de apoio por GiB, mesmo quando o payload está vazio. Isso torna capacidades moderadas eficientes, mas capacidades grandes e dinâmicas caras desde o início.
- **`dynblk`:** O backend format-1 `DBSPRS01` do kernel mantém tabelas de mapeamento em disco e um cache de metadados limitado em RAM (padrão 1 MiB). Preencher um dispositivo existente não aloca um mapa residente completo. As descrições de extensão e diretórios escalam conforme as partes declaradas; cache de arquivos e memória do codec são adicionais. `dynblk limits --format dynblk` informa o limite máximo de geometria; `dynblk status /dev/dynblkN --json` informa buffers contabilizados e estatísticas de cache. Sobrescritas brutas comuns permanecem no local; atualizações parciais comprimidas atualmente recomprimem um bloco de 64 KiB. Escolha a política de cache de anexos de forma deliberada: `unsafe` abre mão das garantias de durabilidade.
- **`squashfs`:** Armazena um snapshot compactado e reconstrói a camada superior gravável em RAM a cada inicialização. Minimiza o armazenamento persistente para sessões mais estáveis, mas exige uso de CPU e RAM durante a restauração e regrava o snapshot ao salvar.

LUKS2 pode envolver Raw, DynFileFS ou DynBlk. A criptografia adiciona sobrecarga de desbloqueio e processamento criptográfico, mantendo a capacidade e o comportamento de armazenamento do backend subjacente.

Faça testes de desempenho com cargas de trabalho representativas no próprio dispositivo. Diferenças no controlador flash, sistema de arquivos, bridge USB, criptografia, compactação e no perfil de uso são fatores mais confiáveis do que um ranking universal dos modos de persistência.

## Configuração do ZRAM

O zram troca tempo de CPU por maior capacidade de memória comprimida e pode evitar o uso de swap em armazenamento, que é muito mais lento. Um dispositivo zram maior pode absorver mais páginas inativas, mas não cria RAM física; cargas de trabalho incompressíveis ainda consomem memória.
Os algoritmos de compressão equilibram desempenho, uso de CPU e taxa de compressão, e a disponibilidade depende do kernel. Comece com o padrão e altere `zramsize`, `zramcomp`, ou `nozram` apenas para cargas de trabalho específicas; consulte [Parâmetros de inicialização](/reference/Boot-Parameters) para valores aceitos.

## Sistema de Arquivos e Hardware de Armazenamento

- **Escolha do dispositivo:** Maior taxa de transferência sequencial reduz o tempo de cópia de grandes módulos, enquanto baixa latência de I/O aleatória é mais importante para cargas de trabalho persistentes em desktop.
  Meça o desempenho do dispositivo junto com o gabinete; apenas a geração do USB não determina o desempenho do flash ou SSD.
- **Escolha do sistema de arquivos:** Um sistema de arquivos nativo Linux pode usar persistência nativa sem overhead de container. Sistemas de arquivos multiplataforma aumentam a portabilidade, mas exigem um backend de container compatível para os metadados do Linux, adicionando camadas de mapeamento e sistema de arquivos. Escolha considerando portabilidade, recuperação e resultados de benchmark.
