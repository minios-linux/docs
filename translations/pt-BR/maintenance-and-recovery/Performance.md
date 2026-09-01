---
updated: 2026-08-26
---

# Desempenho

O ajuste de desempenho no MiniOS é principalmente um equilíbrio entre tempo de inicialização, uso de RAM, leituras em tempo de execução, sobrecarga de persistência e durabilidade do armazenamento. Para detalhes exatos sobre as opções e limites de segurança, consulte [Modos de inicialização](/using-minios/Boot-Modes), [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading) e [Persistência Initrd](/reference/boot-process/Persistence-Internals).

## Parâmetros de Inicialização para Desempenho

Os parâmetros de inicialização podem transferir tarefas do boot e leituras do sistema ativo entre RAM e o dispositivo de origem. Veja [Parâmetros de inicialização](/reference/Boot-Parameters) para a referência completa.

### Carregando o Sistema na RAM (`toram`)

`toram` pode reduzir a latência em tempo de execução causada por um dispositivo USB lento ou ISO via rede, ao custo de um boot mais demorado e uso significativamente maior de RAM. O `toram` puro utiliza o caminho de cópia completa. `toram=trim` normalmente consome menos RAM, mas sua cópia mais restrita pode deixar de fora dados ou módulos necessários posteriormente.

Reserve espaço para a camada gravável, aplicativos, caches e zram, em vez de considerar apenas o tamanho dos arquivos de módulos. Mais RAM alocado para a cópia ao vivo significa menos disponível para a carga de trabalho. Consulte [Modos de inicialização](/using-minios/Boot-Modes) para orientações sobre durabilidade da cópia e restrições de remoção de mídia.

### Filtrando Módulos (`load` e `noload`)

O filtro pode reduzir os dados copiados e as camadas montadas, especialmente com `toram=trim`. O custo é um sistema menos capaz e maior risco de falha no boot ou em tempo de execução caso alguma dependência seja omitida. Verifique o conjunto de módulos resultante; a sintaxe de filtro e as limitações de módulos protegidos estão definidas em [Carregamento de módulos Initrd](/reference/boot-process/Module-Loading).

## Otimização de Persistência

A persistência transfere as operações de leitura/gravação da camada gravável da RAM temporária para o armazenamento ou um container. A escolha do backend afeta latência, compatibilidade, gerenciamento de capacidade e complexidade de recuperação.

### Modos de Persistência (`perchmode`)

- **`native`:** Evita uma camada de sistema de arquivos em arquivo e é a escolha mais simples em um sistema de arquivos POSIX adequado, mas não está disponível em sistemas de arquivos que não preservam os metadados exigidos pelo Linux.
- **`raw`:** Tem capacidade fixa previsível e comportamento ext4 convencional, mas reserva o tamanho do arquivo e não pode crescer além do armazenamento disponível.
- **`dynfilefs`:** Expande sob demanda e suporta mídias normalmente inadequadas, com complexidade adicional de mapeamento e recuperação.
- **`luks`:** Adiciona confidencialidade ao custo de trabalho de desbloqueio e sobrecarga de criptografia.
- **`squashfs`:** Troca compressão no momento do salvamento e trabalho de extração de RAM por um snapshot compacto; não é um backend gravável de baixa latência geral.

Faça benchmarks de cargas de trabalho representativas no dispositivo real. Diferenças no controlador flash, sistema de arquivos, bridge USB e carga de trabalho são mais relevantes do que um ranking universal dos modos de persistência.

## Configuração do ZRAM

O zram troca tempo de CPU por capacidade de memória comprimida e pode evitar o uso de swap em armazenamento, que é muito mais lento. Um dispositivo zram maior pode absorver mais páginas inativas, mas não cria RAM física; cargas de trabalho incompressíveis ainda consomem memória.
Os algoritmos de compressão equilibram taxa de transferência e uso de CPU em relação à taxa de compressão, e a disponibilidade depende do kernel. Comece com o padrão e altere `zramsize`, `zramcomp` ou `nozram` apenas para cargas de trabalho medidas; veja [Parâmetros de inicialização](/reference/Boot-Parameters) para os valores aceitos.

## Sistema de Arquivos e Hardware de Armazenamento

- **Escolha do dispositivo:** Maior taxa de transferência sequencial reduz o tempo de cópia de módulos grandes, enquanto baixa latência em I/O aleatória é mais importante para cargas de trabalho persistentes de desktop.
  Meça o dispositivo e o gabinete juntos; apenas a geração USB não prevê o desempenho do flash ou SSD.
- **Escolha do sistema de arquivos:** Um sistema de arquivos nativo Linux pode usar persistência nativa sem sobrecarga de container. Sistemas de arquivos multiplataforma melhoram a portabilidade, mas exigem um backend de container compatível para metadados Linux, adicionando camadas de mapeamento e sistema de arquivos. Escolha com base nas necessidades de portabilidade e recuperação, além dos resultados de benchmarks.
