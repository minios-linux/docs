---
updated: 2026-08-31
---

# Atualizando MiniOS

MiniOS **não** tem um procedimento de atualização in-place compatível de uma versão MiniOS para outra. O sistema modular live é montado com módulos SquashFS somente leitura e uma camada de sessão gravável. Portanto, alterar pacotes Debian no sistema em execução não substitui a própria versão MiniOS.

::: warning Uma versão mais recente do MiniOS é uma nova instalação
Não há um equivalente MiniOS `dist-upgrade` que transforme uma cópia instalada ou persistente de uma versão MiniOS em outra versão. Migrar para uma versão mais recente do MiniOS significa instalar essa versão e, em seguida, migrar os dados e as configurações que você deseja manter.
:::

## O APT pode ser usado

MiniOS não bloqueia nem proíbe o APT. Você pode instalar e atualizar pacotes Debian quando isso for útil:

```bash
sudo apt update
sudo apt upgrade
```

### MiniOS live modular

Em uma sessão MiniOS live, o APT grava arquivos de pacotes e metadados de pacotes na camada gravável. Com a persistência ativada, essas alterações podem permanecer após a reinicialização. Os módulos somente leitura `.sb` abaixo dessa camada não são alterados; os arquivos atualizados na sessão simplesmente substituem os arquivos dos módulos.

Isso é manutenção de pacotes **dentro dessa sessão**, não uma atualização do MiniOS.
Isso também consome espaço de persistência e pode fazer com que a sessão fique bastante diferente da imagem publicada. Uma nova sessão ainda começa com o conjunto de pacotes contido nos módulos MiniOS.

Não altere as fontes do APT para outra versão do Debian nem execute `upgrade`, `full-upgrade` ou `dist-upgrade` esperando obter uma versão MiniOS mais recente.
Isso cria um estado misto do sistema; não reproduz o conjunto de módulos, os arquivos de inicialização, a seleção de firmware, os pacotes MiniOS nem outras opções de uma versão MiniOS publicada.

### Após a conversão nativa

Uma instalação nativa criada pelo Instalador do MiniOS é um desktop Debian convencional, não o sistema live modular do MiniOS. Ela mantém a experiência familiar do desktop MiniOS, incluindo o ambiente de desktop selecionado, a identidade visual e os aplicativos comuns, enquanto o software live específico do MiniOS é removido. O sistema resultante tem um sistema de arquivos raiz gravável: o APT atualiza os pacotes normalmente, o kernel é gerenciado por meio de pacotes Debian e o bootloader instalado e o initramfs seguem o fluxo de trabalho convencional do Debian.

Assim, o modelo de atualização de versão do MiniOS não se aplica a esse sistema convertido. A identidade visual e os softwares comuns de desktop do MiniOS podem ser mantidos, enquanto a manutenção contínua segue o modelo normal do Debian, em vez do fluxo de trabalho de módulos e sessões do MiniOS.

## Migrando para uma versão mais recente MiniOS

Trate uma versão mais recente MiniOS como um sistema separado:

1. Faça o download e [verifique](/installing-minios/Verifying-Downloads) a nova imagem.
2. Faça backup dos arquivos importantes, da configuração, dos módulos de usuário e das sessões persistentes, conforme descrito em [Fazendo backup de MiniOS](/maintenance-and-recovery/Backing-Up-MiniOS).
3. Instale a nova versão usando o [método de instalação](/installing-minios/Installation-Methods) adequado.
4. Inicialize com uma sessão nova e verifique primeiro o hardware e os aplicativos de que você precisa.
5. Migre os arquivos pessoais e as configurações selecionadas. Se o Session Manager puder exportar a sessão antiga, importe o arquivo e deixe as verificações de compatibilidade serem executadas, em vez de copiar manualmente um armazenamento de sessão em uso.
6. Recrie ou reinstale os módulos personalizados que não forem reconhecidos como compatíveis com a versão de destino.

Mantenha a instalação antiga ou o backup até que a nova versão tenha sido testada.
Não combine módulos básicos, arquivos de inicialização, arquivos do kernel ou arquivos initramfs de versões diferentes do MiniOS na tentativa de criar uma atualização.

## Módulos e kernels são tarefas de manutenção separadas

Um `.sb` módulo pode ser substituído ou recriado de forma independente, quando essa for a intenção. Isso altera uma camada de personalização; não altera a versão MiniOS. Consulte [Gerenciando módulos](/preparing-and-customizing/Managing-Modules).

O kernel MiniOS também é gerenciado como um conjunto coordenado de módulos do kernel, `vmlinuz` e initramfs. Use [Gerenciando kernels](/preparing-and-customizing/Managing-Kernels) para essa operação. Atualizar apenas um pacote `linux-image` com o APT não corresponde ao fluxo de gerenciamento do kernel MiniOS, e alterar o kernel não atualiza a versão MiniOS.
