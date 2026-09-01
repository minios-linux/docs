---
updated: 2026-08-31
---

# Atualizando MiniOS

MiniOS **não** possui um procedimento de atualização in-place suportado de uma versão MiniOS para outra. O sistema modular live é montado a partir de módulos SquashFS somente leitura, além de uma camada de sessão gravável, então alterar pacotes Debian no sistema em execução não substitui a própria versão MiniOS.

::: warning Uma nova versão MiniOS é uma nova instalação
Não existe um equivalente MiniOS ao `dist-upgrade` que transforme uma cópia instalada ou persistente de uma versão MiniOS em outra versão. Migrar para uma versão MiniOS mais recente significa instalar essa versão e, em seguida, migrar os dados e configurações que você deseja manter.
:::

## APT é permitido

MiniOS não bloqueia nem proíbe o uso do APT. Você pode instalar e atualizar pacotes Debian quando isso for útil:

```bash
sudo apt update
sudo apt upgrade
```

### MiniOS live modular

Em uma sessão live MiniOS, o APT grava arquivos de pacotes e metadados de pacotes na camada gravável. Com persistência, essas alterações podem sobreviver a uma reinicialização. Os módulos `.sb` somente leitura abaixo dessa camada não são alterados; arquivos atualizados na sessão simplesmente sobrescrevem os arquivos dos módulos.

Isso é manutenção de pacotes **dentro dessa sessão**, não uma atualização do MiniOS.
Também consome espaço de persistência e pode fazer a sessão diferir substancialmente da imagem publicada. Uma nova sessão ainda inicia a partir do conjunto de pacotes contido nos módulos MiniOS.

Não altere as fontes do APT para outra versão do Debian e execute `upgrade`, `full-upgrade` ou `dist-upgrade` esperando obter uma versão MiniOS mais recente.
Isso cria um estado de sistema misto; não reproduz o conjunto de módulos, arquivos de boot, seleção de firmware, pacotes MiniOS ou outras escolhas de uma versão MiniOS publicada.

### Após a conversão nativa

Uma instalação nativa criada pelo MiniOS é um desktop Debian convencional, em vez do sistema live modular MiniOS. Ela mantém a experiência familiar do desktop MiniOS, incluindo o ambiente de área de trabalho selecionado, identidade visual e aplicativos comuns, enquanto o software live específico para MiniOS é removido. O sistema resultante possui um sistema de arquivos raiz gravável: o APT atualiza os pacotes normalmente, o kernel é gerenciado por meio de pacotes Debian e o bootloader e o initramfs instalados utilizam o fluxo de trabalho convencional do Debian.

O modelo de upgrade de versão do MiniOS não se aplica a esse sistema convertido. A identidade visual e os softwares de desktop comuns do MiniOS podem permanecer, enquanto a manutenção contínua segue o modelo normal do Debian, e não o fluxo de trabalho de módulos/sessões do MiniOS.

## Migrando para uma versão MiniOS mais recente

Trate uma nova versão MiniOS como um sistema separado:

1. Baixe e [verifique](/installing-minios/Verifying-Downloads) a nova imagem.
2. Faça backup de arquivos importantes, configurações, módulos de usuário e sessões persistentes conforme descrito em [Backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Instale a nova versão usando o [método de instalação](/installing-minios/Installation-Methods) apropriado.
4. Inicialize primeiro com uma sessão nova e verifique o hardware e os aplicativos necessários.
5. Migre arquivos pessoais e configurações selecionadas. Onde o Session Manager puder exportar a sessão antiga, importe o arquivo compactado e deixe as verificações de compatibilidade rodarem, em vez de copiar manualmente o armazenamento da sessão ativa.
6. Reconstrua ou reinstale módulos personalizados quando não houver certeza de compatibilidade com a versão de destino.

Mantenha a instalação antiga ou o backup até testar a nova versão.
Não misture módulos base, arquivos de boot, arquivos de kernel ou arquivos initramfs de versões MiniOS diferentes tentando fabricar uma atualização.

## Módulos e kernels são tarefas de manutenção separadas

Um módulo `.sb` criado pelo usuário pode ser substituído ou reconstruído de forma independente quando isso for intencional. Isso altera uma camada de customização; não altera a versão MiniOS. Veja [Gerenciando módulos](/preparing-and-customizing/Managing-Modules).

O kernel MiniOS também é gerenciado como um módulo de kernel coordenado, `vmlinuz`, e conjunto de initramfs. Use [Gerenciando kernels](/preparing-and-customizing/Managing-Kernels) para essa operação. Atualizar apenas um pacote `linux-image` com o APT não é o fluxo de trabalho de gerenciamento de kernel MiniOS, e alterar o kernel não atualiza a versão MiniOS.
