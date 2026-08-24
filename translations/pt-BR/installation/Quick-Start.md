# Início rápido

Este guia aborda o download, gravação, inicialização e configuração inicial do MiniOS.

## 1. Escolha uma edição

- **Minimum** oferece um conjunto reduzido de pacotes e o ambiente Flux.
- **Standard** é a edição Xfce para uso geral.
- **Toolbox** adiciona ferramentas de administração, diagnóstico, armazenamento e recuperação.
- **Ultra** inclui o conjunto mais amplo de aplicativos.

A disponibilidade de edições e ambientes gráficos varia conforme a versão. Consulte
[Sobre o MiniOS](/about/About-MiniOS.md) e a
[lista de pacotes](/administration/Packages.md) antes de baixar.

Baixe uma ISO em [minios.dev](https://minios.dev) ou na
[página de lançamentos do GitHub](https://github.com/minios-linux/minios-live/releases).
Verifique o checksum antes de usar; veja
[Verificando downloads](/installation/Verifying-Downloads.md).

## 2. Prepare um dispositivo de destino

Use um dispositivo com espaço suficiente para a ISO escolhida e para quaisquer dados ou sessões persistentes que você pretenda manter. O tamanho das ISOs varia entre versões, então confira o arquivo baixado e a ferramenta de gravação em vez de confiar em um tamanho fixo listado em um guia. Faça backup do dispositivo de destino antes: a maioria dos métodos de instalação sobrescreve parte ou todo o conteúdo.

Escolha um método e leia seu guia antes de selecionar o dispositivo:

- Windows: [Rufus](/installation/tools/Rufus.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md) ou
  [Ventoy](/installation/tools/Ventoy.md)
- Linux: [`dd`](/installation/tools/dd.md),
  [Balena Etcher](/installation/tools/Balena-Etcher.md) ou
  [Drive Utility](/installation/tools/Drive-Utility.md)
- macOS: [`dd`](/installation/tools/dd.md) ou
  [Balena Etcher](/installation/tools/Balena-Etcher.md)
- A partir do MiniOS: [MiniOS Installer](/installation/MiniOS-Installer.md)

Outros métodos documentados são [UNetbootin](/installation/tools/UNetbootin.md) e o [método original](/installation/tools/Original-Method.md). Veja
[ferramentas de criação de USB](/installation/tools/USB-Creation-Tools.md) para uma comparação
e [Instalando o MiniOS](/installation/Installing-MiniOS.md) para uma visão geral da instalação.

## 3. Entenda a persistência antes de gravar

A persistência não é criada por todos os métodos de gravação ou inicialização.

- Uma gravação de imagem bruta com `dd`, Etcher ou ferramenta similar reproduz a ISO. Isso, por si só, não configura uma sessão persistente.
- O Ventoy normalmente inicializa a ISO como um arquivo. A persistência do MiniOS deve ser configurada separadamente.
- O MiniOS Installer pode criar uma instalação live e configurar armazenamento de sessão nativo, DynFileFS, raw ou criptografado com LUKS.
- Uma inicialização limpa executa propositalmente sem persistência. Outras entradas do menu de boot do MiniOS podem retomar, criar ou selecionar sessões quando houver armazenamento gravável disponível.
- Uma instalação nativa é um sistema instalado convencional e não utiliza persistência de sessão live da mesma forma.

Consulte [Gerenciamento de sessões](/configuration/Session-Management.md) e
[Parâmetros de boot](/configuration/Boot-Parameters.md) antes de alterar o armazenamento de sessões. Mantenha backup dos arquivos importantes independentemente do modo de persistência.

## 4. Inicialize o MiniOS

1. Desligue o computador e conecte o dispositivo preparado.
2. Abra o menu de boot do firmware e selecione a entrada UEFI ou legacy do dispositivo.
3. Selecione uma sessão limpa para um teste inicial de hardware, ou uma sessão persistente somente se já tiver sido configurada.
4. Confirme se vídeo, teclado, armazenamento e rede funcionam antes de realizar alterações de instalação destrutivas.

Se o dispositivo não aparecer na lista ou a área de trabalho não iniciar, consulte
[Compatibilidade de hardware](/installation/Hardware-Compatibility.md) e
[Solução de problemas](/administration/Troubleshooting.md).

## 5. Configure o sistema

Abra **Aplicativos > Sistema > Configurar MiniOS** ou execute:

```bash
minios-configurator
```

O Configurador edita `/etc/live/config.conf`. Ele pode definir identidade do usuário, senhas, localidade, fuso horário, teclado, nome do host, serviços, armazenamento do diretório do usuário e controles de segurança. Não altera o sistema em execução diretamente; as configurações salvas são aplicadas conforme a aplicabilidade de cada item, normalmente após reinicialização ou ao criar uma nova sessão.

Perfis de segurança preenchem configurações concretas para sudo, PolicyKit, SSH, XRDP, X11, dicas de senha, bloqueio de tela e login automático. Revise os controles resultantes em vez de considerar apenas o nome do perfil como uma configuração em tempo de execução. Veja
[Reforço de segurança](/administration/Security-Hardening.md) e o
[guia do Configurador do MiniOS](/configuration/MiniOS-Configurator.md). A
[referência do arquivo de configuração](/configuration/Configuration-File.md) documenta as chaves subjacentes.

## 6. Instale softwares e salve seu trabalho

Alterações feitas pelo APT em uma sessão live só permanecem após reinicialização quando a sessão é persistente. Módulos SquashFS permanecem separados da sessão gravável e podem ser carregados como parte do sistema modular; veja
[Criando módulos](/development/Creating-Modules.md).

Salve arquivos importantes em um armazenamento conhecido como gravável e teste um desligamento limpo e reinicialização antes de confiar em uma sessão persistente.

## Obtendo ajuda

- [Otimização de desempenho](/administration/Performance-Optimization.md)
- [Gerenciamento de kernel](/administration/Kernel-Management.md)
- [Compilando o MiniOS](/development/Building-MiniOS.md)
- [Reconstruindo uma ISO](/development/Rebuilding-ISO.md)
- [Issues no GitHub](https://github.com/minios-linux/minios-live/issues)
- [Fonte do MiniOS](https://github.com/minios-linux/minios-live)
- [Documentação do Debian](https://www.debian.org/doc/)
