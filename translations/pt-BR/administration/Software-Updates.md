# Atualizações de software

O MiniOS combina módulos de imagem SquashFS somente leitura com uma camada de execução gravável. O método de atualização deve corresponder à camada que está sendo alterada. Atualizar pacotes dentro de uma sessão em execução não é o mesmo que substituir os módulos no meio do MiniOS.

## Atualize pacotes com o APT

O APT grava na camada de execução. Ative e utilize uma sessão persistente antes de atualizar se as alterações precisarem ser mantidas após a reinicialização:

```bash
sudo apt update
sudo apt upgrade
```

Sem persistência, as alterações de pacotes desaparecem ao desligar. Com persistência, os arquivos atualizados e o estado do APT permanecem naquela sessão, mas os módulos de imagem `.sb` subjacentes não são alterados. Uma nova sessão ainda usará as versões dos pacotes presentes na imagem.

O APT é adequado para manter uma instalação persistente. Verifique o espaço disponível antes, pois os arquivos atualizados são armazenados além dos módulos base compactados. Não trate uma atualização de release do Debian no local como uma atualização de imagem do MiniOS; utilize uma imagem criada para o release de destino.

## Atualize software com módulos

Um módulo `.sb` é um software somente leitura carregado na inicialização. Os módulos são duráveis quando armazenados no diretório `modules/` gravável do MiniOS ou em uma fonte de módulo de persistência durável. Eles não exigem que as alterações de pacotes sejam salvas na sessão.

Verifique o conjunto de módulos do próximo boot antes e depois de adicionar um módulo:

```bash
sb next-boot
sudo sb next-boot add 50-example.sb
```

O `sb next-boot add` valida e publica um novo módulo de forma atômica, mas não sobrescreve um módulo existente com o mesmo nome. Remova primeiro um módulo de usuário substituível quando a atualização mantiver o mesmo nome base:

```bash
sudo sb next-boot remove 50-example.sb
sudo sb next-boot add 50-example.sb
```

Módulos base e módulos em mídia somente leitura não podem ser removidos por este comando. Construa ou obtenha módulos atualizados para a mesma arquitetura, release da distribuição e camada de módulo inferior. Módulos com numeração mais alta sobrescrevem camadas inferiores, então um módulo complementar antigo também pode sobrescrever arquivos fornecidos por uma imagem base mais recente.

Para software empacotado localmente, o `apt2sb upgrade` pode criar um módulo de atualização. Veja [Criando módulos](/development/Creating-Modules.md) para detalhes sobre construção de módulos e níveis de dependência.

## Substitua módulos de imagem

Atualizações oficiais de imagem substituem arquivos no meio do MiniOS; o `apt upgrade` não os atualiza. Prefira substituir todo o conjunto de módulos base e os arquivos de boot correspondentes de uma versão do MiniOS, ou reinstalar a partir da nova imagem. Não misture arquivos de núcleo, desktop, aplicativos, firmware ou boot de versões diferentes, a menos que sua compatibilidade esteja documentada.

Antes da substituição:

1. Faça backup da configuração do MiniOS, dados de persistência, módulos de usuário e dos módulos base atuais.
2. Registre as listas de módulos ativos e do próximo boot com `sb list` e `sb next-boot`.
3. Realize a substituição a partir de outro sistema ou de um boot carregado em RAM para que os arquivos de origem não estejam em uso.
4. Mantenha os arquivos anteriores até que a nova imagem inicialize e o hardware e aplicativos necessários tenham sido testados.

Preserve os nomes base dos módulos e a ordem quando uma versão instruir a substituição direta. Uma fonte posterior com o mesmo nome base substitui uma fonte anterior na seleção do próximo boot; cópias com nomes diferentes podem ser carregadas juntas e gerar uma ordem de camadas não intencional.

## Atualize o kernel

O kernel é um conjunto coordenado: o módulo de driver `01-kernel.sb`, a imagem do kernel, o initramfs e a configuração do bootloader devem estar em conformidade. Use o Gerenciador de Kernel do MiniOS ou o comando `minios-kernel` em vez de atualizar apenas um pacote `linux-image` com o APT.

Liste e empacote um kernel do repositório, depois ative-o para o próximo boot:

```bash
sudo minios-kernel list
sudo minios-kernel package --repo <linux-image-package> -o /tmp/kernel-output
sudo minios-kernel activate <kernel-version>
```

A ativação atualiza a configuração de boot do MiniOS. Reinicie para rodar o kernel selecionado e, em seguida, verifique com `uname -r`. Mantenha pelo menos um kernel conhecido e funcional e seus arquivos de boot até que hardware, armazenamento, rede e drivers externos tenham sido testados. O módulo padrão de kernel do MiniOS pode incluir drivers adicionais que não estão presentes em um kernel do repositório da distribuição.

Veja [Gerenciamento de kernel](/administration/Kernel-Management.md) para o fluxo de trabalho gráfico, opções de comando e procedimento de recuperação.

## Compatibilidade e recuperação

Faça backup da persistência antes de alterar a imagem base ou o kernel. Arquivos de pacotes persistentes e metadados podem sobrescrever um novo módulo base ou descrever versões de pacotes que não correspondem mais a ele. Teste uma nova imagem primeiro com uma sessão limpa e depois teste com uma cópia da sessão existente. Mantenha a imagem original, os módulos e o backup da sessão até que o rollback não seja mais necessário.

Após qualquer atualização, verifique os módulos selecionados, faça um boot, e confira os aplicativos e hardware afetados. Se uma nova imagem base entrar em conflito com módulos de usuário antigos ou persistência, desative essas camadas e reintroduza uma de cada vez.
