---
updated: 2026-09-13
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

- **`native`:** Evita a camada de sistema de arquivos em arquivo e é a opção mais simples em um sistema de arquivos POSIX adequado, mas não está disponível em sistemas que não preservam os metadados necessários do Linux.
- **`raw`:** Tem capacidade fixa previsível e comportamento ext4 convencional, mas reserva o tamanho do arquivo e não pode crescer além do espaço disponível no armazenamento de apoio.
- **`dynfilefs`:** O backend FUSE/format-400 expande sob demanda e suporta mídias normalmente inadequadas, com complexidade adicional de mapeamento e recuperação.
- **`dynblk`:** O backend de bloco format-1 do kernel apresenta um dispositivo de bloco normal, enquanto o thin `volumeNNN.db` cresce sob demanda. Evita I/O via FUSE, mas cada dispositivo conectado consome memória fixa de metadados e as gravações continuam limitadas pelo espaço livre no sistema de arquivos de apoio e pelos limites de admissão do dynblk.
- **`luks`:** Adiciona confidencialidade ao custo de trabalho de desbloqueio e sobrecarga de criptografia.
- **`squashfs`:** Troca compressão no momento do salvamento e trabalho de extração de RAM por um snapshot compacto; não é um backend gravável de baixa latência geral.

Faça testes de desempenho com cargas representativas no dispositivo real. Diferenças no controlador flash, sistema de arquivos, bridge USB e carga de trabalho são mais relevantes do que um ranking universal dos modos de persistência.

## Configuração do ZRAM

O zram troca tempo de CPU por maior capacidade de memória comprimida e pode evitar o uso de swap em armazenamento, que é muito mais lento. Um dispositivo zram maior pode absorver mais páginas inativas, mas não cria RAM física; cargas de trabalho incompressíveis ainda consomem memória.
Os algoritmos de compressão equilibram desempenho, uso de CPU e taxa de compressão, e a disponibilidade depende do kernel. Comece com o padrão e altere `zramsize`, `zramcomp`, ou `nozram` apenas para cargas de trabalho específicas; consulte [Parâmetros de inicialização](/reference/Boot-Parameters) para valores aceitos.

## Sistema de Arquivos e Hardware de Armazenamento

- **Escolha do dispositivo:** Maior taxa de transferência sequencial reduz o tempo de cópia de grandes módulos, enquanto baixa latência de I/O aleatória é mais importante para cargas de trabalho persistentes em desktop.
  Meça o desempenho do dispositivo junto com o gabinete; apenas a geração do USB não determina o desempenho do flash ou SSD.
- **Escolha do sistema de arquivos:** Um sistema de arquivos nativo Linux pode usar persistência nativa sem overhead de container. Sistemas de arquivos multiplataforma aumentam a portabilidade, mas exigem um backend de container compatível para os metadados do Linux, adicionando camadas de mapeamento e sistema de arquivos. Escolha considerando portabilidade, recuperação e resultados de benchmark.
