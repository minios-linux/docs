# Otimização de desempenho

O ajuste de desempenho no MiniOS é principalmente um equilíbrio entre tempo de inicialização, uso de RAM,
leituras em tempo de execução, sobrecarga de persistência e durabilidade do armazenamento. Para detalhes exatos sobre as opções
e seus limites de segurança, consulte [Modos de inicialização](/configuration/Boot-Modes.md),
[Carregamento de módulos Initrd](/configuration/Initrd-Module-Loading.md) e
[Persistência do Initrd](/configuration/Initrd-Persistence.md).

## Parâmetros de inicialização para desempenho

Os parâmetros de inicialização permitem mover tarefas do boot e leituras do sistema ao vivo entre a RAM e o
dispositivo de origem. Veja [Parâmetros de inicialização](/configuration/Boot-Parameters.md) para a
referência completa.

### Carregando o sistema na RAM (`toram`)

`toram` pode reduzir a latência em tempo de execução causada por um dispositivo USB lento ou ISO via rede,
à custa de um boot mais demorado e uso significativamente maior de RAM. O `toram` puro
usa o caminho de cópia completa. `toram=trim` normalmente consome menos RAM, mas sua cópia mais restrita
pode deixar de carregar dados ou módulos necessários posteriormente.

Reserve espaço para a camada gravável, aplicativos, caches e zram, em vez de
calcular apenas para os arquivos de módulos. Mais RAM dedicada à cópia ao vivo significa menos disponível
para a carga de trabalho. Siga [Modos de inicialização](/configuration/Boot-Modes.md) para
orientações sobre durabilidade da cópia e restrições de remoção de mídia.

### Filtrando módulos (`load` e `noload`)

O filtro pode reduzir a quantidade de dados copiados e camadas montadas, especialmente com
`toram=trim`. O custo é um sistema menos completo e maior risco de falha no boot ou
durante a execução se uma dependência for omitida. Verifique o conjunto de módulos resultante;
a sintaxe do filtro e as limitações de módulos protegidos estão definidas em
[Carregamento de módulos Initrd](/configuration/Initrd-Module-Loading.md).

## Otimização de persistência

A persistência transfere as operações de leitura/gravação da camada gravável da RAM temporária para o armazenamento ou para um
container. A escolha do backend afeta latência, compatibilidade, gerenciamento de capacidade
e complexidade de recuperação.

### Modos de persistência (`perchmode`)

- **`native`:** Evita uma camada de sistema de arquivos em arquivo e é a escolha mais simples em um sistema de arquivos POSIX adequado, mas não está disponível em sistemas de arquivos que não conseguem preservar os metadados exigidos pelo Linux.
- **`raw`:** Tem capacidade fixa previsível e comportamento ext4 convencional, mas reserva o tamanho do arquivo e não pode crescer além do armazenamento disponível.
- **`dynfilefs`:** Expande sob demanda e suporta mídias que normalmente seriam inadequadas, com complexidade adicional de mapeamento e recuperação.
- **`luks`:** Adiciona confidencialidade ao custo de trabalho para desbloqueio e sobrecarga de criptografia.
- **`squashfs`:** Troca compressão no momento do salvamento e trabalho de extração na RAM por um snapshot compacto; não é um backend gravável de baixa latência para uso geral.

Faça benchmarks de cargas de trabalho representativas no dispositivo real. Diferenças no controlador flash,
sistema de arquivos, bridge USB e carga de trabalho são mais relevantes do que um
ranking universal dos modos de persistência.

## Configuração do ZRAM

O zram troca tempo de CPU por capacidade de memória comprimida e pode evitar o uso de swap em armazenamento, que é muito mais lento.
Um dispositivo zram maior pode absorver mais páginas inativas, mas não cria RAM física; cargas de trabalho incompressíveis ainda consomem memória.
Os algoritmos de compressão equilibram throughput e uso de CPU em relação à taxa de compressão,
e a disponibilidade depende do kernel. Comece com o padrão e altere
`zramsize`, `zramcomp` ou `nozram` apenas para cargas de trabalho medidas; veja
[Parâmetros de inicialização](/configuration/Boot-Parameters.md) para os valores aceitos.

## Sistema de arquivos e hardware de armazenamento

- **Escolha do dispositivo:** Maior taxa de transferência sequencial reduz o tempo de cópia de módulos grandes,
  enquanto baixa latência de I/O aleatório é mais importante para cargas de trabalho persistentes em desktop.
  Meça o dispositivo e o gabinete juntos; apenas a geração USB não
  prevê o desempenho do flash ou SSD.
- **Escolha do sistema de arquivos:** Um sistema de arquivos nativo Linux pode usar persistência nativa
  sem sobrecarga de container. Sistemas de arquivos multiplataforma melhoram a portabilidade,
  mas exigem um backend de container compatível para metadados do Linux, adicionando camadas de mapeamento
  e de sistema de arquivos. Escolha com base em portabilidade, necessidades de recuperação e
  resultados de benchmark.
