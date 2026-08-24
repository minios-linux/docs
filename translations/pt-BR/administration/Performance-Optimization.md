# Guia de Otimização de Desempenho

Este guia apresenta técnicas para otimizar o desempenho do MiniOS, com foco em suas características únicas como sistema live. Os maiores ganhos de performance podem ser alcançados ajustando como o MiniOS carrega seus dados e gerencia alterações persistentes.

## Parâmetros de Boot para Desempenho

A maneira mais eficaz de aumentar o desempenho, especialmente ao rodar a partir de um pendrive USB lento, é utilizando parâmetros de boot para controlar como o sistema é carregado na memória. Para a lista completa de parâmetros disponíveis, consulte [Parâmetros de Boot](/configuration/Boot-Parameters.md).

### Carregando o Sistema na RAM (`toram`)

Esta é a otimização mais importante. O parâmetro de boot `toram` copia todo o sistema MiniOS da mídia de boot para a RAM do seu computador. Isso torna o sistema extremamente responsivo, pois não precisa mais ler dados do USB, que é mais lento.

- **Uso:** Adicione `toram` à linha de comando do kernel no boot.
- **Requisito:** É necessário ter RAM suficiente para comportar os módulos principais do sistema. Para a edição `standard`, recomenda-se pelo menos 2-3 GB de RAM livre.
- **Benefício:** Melhora drasticamente o tempo de abertura de aplicativos e a agilidade geral do sistema.

Existem dois modos para o `toram`:

- **`toram=full` (Padrão):** Copia todos os módulos do sistema para a RAM. Use esta opção se você tem bastante memória.
- **`toram=trim`:** Copia apenas os módulos essenciais definidos pelos parâmetros de boot `load` e `noload`. Útil para sistemas com pouca RAM.

### Filtrando Módulos (`load` e `noload`)

Para reduzir o uso de memória, você pode especificar quais módulos serão carregados. Isso é especialmente eficiente quando combinado com `toram=trim`.

- **`load=module1,module2`:** Carrega apenas os módulos especificados (ex: `load=01-kernel,03-gui-base,04-xfce-desktop`).
- **`noload=module_name`:** Exclui um módulo específico do carregamento.

Assim, você pode criar um sistema enxuto na RAM, personalizado para suas necessidades.

## Otimização da Persistência

A forma como o MiniOS salva suas alterações (persistência) pode impactar significativamente o desempenho, especialmente na velocidade de gravação.

### Modos de Persistência (`perchmode`)

O parâmetro de boot `perchmode` define o backend para o armazenamento persistente. A escolha depende do seu dispositivo de armazenamento:

- **`perchmode=native` (Padrão):** Salva arquivos diretamente em um diretório do seu dispositivo. Esta é a **opção mais rápida para SSDs e pendrives USB rápidos**, pois evita a sobrecarga de sistemas de arquivos em arquivos.
- **`perchmode=raw`:** Utiliza um arquivo de imagem pré-alocado para as alterações. O desempenho é bom, mas o tamanho do arquivo é fixo.
- **`perchmode=dynfilefs`:** Usa um arquivo que cresce dinamicamente. É uma boa escolha para **pendrives USB mais lentos**, pois pode reduzir a amplificação de gravação e potencialmente aumentar a vida útil do dispositivo, embora possa ser um pouco mais lento que o modo `native`.

### Ativando e Desativando a Persistência

Por padrão, o MiniOS roda em modo "live", onde todas as alterações são descartadas ao reiniciar. Para salvar suas alterações, é necessário ativar explicitamente a persistência.

- **Para Ativar a Persistência:** Adicione o parâmetro `perch` à linha de comando do boot. Isso instrui o MiniOS a ativar o mecanismo de persistência.
- **Para Desativar a Persistência:** Basta não adicionar o parâmetro `perch`. Se ele não estiver presente, o sistema rodará totalmente na RAM (ou no dispositivo de boot) e nenhuma alteração será salva.

## Configuração do ZRAM

O MiniOS utiliza `zram` por padrão para criar um espaço de swap compactado na sua RAM. Isso melhora o desempenho em sistemas com pouca memória física, evitando o uso de um arquivo de swap muito mais lento no disco.

**Dimensionamento automático:**
- **≥4GB RAM:** 2GB de ZRAM
- **1-4GB RAM:** Metade da RAM total
- **<1GB RAM:** 512MB de ZRAM

**Parâmetros de boot:**
- **`zramsize=1024`:** Define o tamanho do dispositivo zram (ex.: `zramsize=1024` para 1GB). Por padrão, é configurado automaticamente de acordo com a sua RAM total.
- **`zramcomp=lz4`:** Define o algoritmo de compactação (`lzo`, `lzo-rle`, `lz4`, `lz4hc`, `zstd`). `lz4` geralmente oferece um bom equilíbrio entre velocidade e taxa de compactação.
- **`nozram`:** Desativa completamente o ZRAM.

Para a maioria dos usuários, as configurações padrão de `zram` são ideais. Ajustá-las só é recomendado se você tiver necessidades específicas e compreender os impactos dessas mudanças.

## Sistema de Arquivos e Hardware de Armazenamento

- **Use um Pendrive Rápido:** O principal fator de hardware para o desempenho do MiniOS é a velocidade do seu pendrive. Utilizar um **pendrive USB 3.0 ou SSD baseado em USB** proporcionará uma experiência muito melhor do que um pendrive USB 2.0 simples e lento.
- **Escolha do Sistema de Arquivos:** Para a partição de persistência, usar um sistema de arquivos Linux padrão como **ext4** geralmente oferece o melhor desempenho e confiabilidade.
