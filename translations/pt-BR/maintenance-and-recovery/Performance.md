---
updated: 2026-09-16
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

- **`native`:** Armazena a camada gravável diretamente como arquivos comuns. Tem o menor overhead de contêiner e não possui tamanho fixo, mas exige um sistema de arquivos de suporte que preserve os metadados e operações do Linux necessários por MiniOS.
- **`raw`:** Usa uma imagem ext4 de capacidade fixa. O tamanho do arquivo é definido conforme a capacidade solicitada e o crescimento é explícito, tornando-o simples e previsível, mas sem o comportamento de capacidade dinâmica dos backends dinâmicos. O FAT32 limita a imagem única a 4000 MiB.
- **`dynfilefs`:** O backend FUSE/format-400 expande o armazenamento do payload sob demanda e suporta mídias que normalmente não seriam adequadas. Seu índice não é esparso: cada bloco lógico de 4 KiB declarado precisa de um deslocamento de 8 bytes, então a capacidade lógica consome cerca de 2 MiB de RAM e cerca de 2 MiB de armazenamento de índice de suporte por GiB, mesmo quando o payload está vazio. Isso torna capacidades moderadas eficientes, mas capacidades grandes e esparsas caras logo no início.
- **`dynblk`:** O backend de bloco format-1 do kernel apresenta um dispositivo de bloco normal enquanto o armazenamento thin `volumeNNN.db` cresce sob demanda. Os mapeamentos em tempo de execução são esparsos e alocam um bloco de 4 KiB para cada 128 blocos lógicos, então dados densamente mapeados consomem cerca de 8 MiB de RAM por GiB, mas a capacidade virtual não alocada não consome bloco de mapeamento. O índice interno fixo ocupa apenas 396.312 bytes por dispositivo anexado e os contadores de referência de página são esparsos. O driver, e não o MiniOS, escolhe o orçamento padrão de mapeamento em aproximadamente 25% do RAM utilizável, limitado a 4096 MiB. Isso favorece grandes capacidades esparsas; um volume totalmente preenchido pode consumir mais RAM de mapeamento por GiB do que DynFileFS.
- **`squashfs`:** Armazena um snapshot compactado e reconstrói a camada superior gravável em RAM a cada inicialização. Minimiza o uso de armazenamento persistente para sessões majoritariamente estáveis, mas exige processamento de CPU e custos de RAM durante a restauração e regrava o snapshot ao salvar.

LUKS2 pode envolver Raw, DynFileFS ou DynBlk. A criptografia adiciona etapas de desbloqueio e overhead de criptografia, mantendo a capacidade e o comportamento de armazenamento do backend subjacente.

Faça benchmarks de cargas de trabalho representativas no próprio dispositivo. Diferenças no controlador flash, sistema de arquivos, bridge USB, criptografia, compactação e no perfil de uso são mais relevantes do que um ranking universal dos modos de persistência.

## Configuração do ZRAM

O zram troca tempo de CPU por maior capacidade de memória comprimida e pode evitar o uso de swap em armazenamento, que é muito mais lento. Um dispositivo zram maior pode absorver mais páginas inativas, mas não cria RAM física; cargas de trabalho incompressíveis ainda consomem memória.
Os algoritmos de compressão equilibram desempenho, uso de CPU e taxa de compressão, e a disponibilidade depende do kernel. Comece com o padrão e altere `zramsize`, `zramcomp`, ou `nozram` apenas para cargas de trabalho específicas; consulte [Parâmetros de inicialização](/reference/Boot-Parameters) para valores aceitos.

## Sistema de Arquivos e Hardware de Armazenamento

- **Escolha do dispositivo:** Maior taxa de transferência sequencial reduz o tempo de cópia de grandes módulos, enquanto baixa latência de I/O aleatória é mais importante para cargas de trabalho persistentes em desktop.
  Meça o desempenho do dispositivo junto com o gabinete; apenas a geração do USB não determina o desempenho do flash ou SSD.
- **Escolha do sistema de arquivos:** Um sistema de arquivos nativo Linux pode usar persistência nativa sem overhead de container. Sistemas de arquivos multiplataforma aumentam a portabilidade, mas exigem um backend de container compatível para os metadados do Linux, adicionando camadas de mapeamento e sistema de arquivos. Escolha considerando portabilidade, recuperação e resultados de benchmark.
