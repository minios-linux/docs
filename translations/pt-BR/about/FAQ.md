# Perguntas frequentes

## Qual edição devo escolher e por que um aplicativo está ausente?

A edição Flux utiliza o ambiente Flux baseado em Fluxbox e um conjunto reduzido de pacotes.
As edições Standard, Toolbox e Ultra adicionam diferentes softwares progressivamente, mas a disponibilidade varia conforme a versão. Consulte
[Sobre o MiniOS](/about/About-MiniOS.md),
[Aplicativos do MiniOS](/about/MiniOS-Applications.md) e a
[lista de pacotes](/administration/Packages.md).

## Gravar o ISO é o mesmo que instalar o MiniOS?

Não. Gravar o ISO cria uma mídia live inicializável. O Instalador do MiniOS pode implantar
um sistema live modular com persistência opcional ou um sistema nativo convencional.
Escolha o layout em [Instalando o MiniOS](/installation/Installing-MiniOS.md)
e [Instalador do MiniOS](/installation/MiniOS-Installer.md).

## Quais são as credenciais padrão?

Uma imagem live sem personalização utiliza `live` / `evil` e `root` / `toor`, podendo
permitir login automático e administração sem senha. Altere essas credenciais antes
de usar em uma rede não confiável; siga as orientações em
[Reforço de segurança](/administration/Security-Hardening.md).

## Gravar o MiniOS em um pendrive USB habilita a persistência?

Nem sempre. Gravações diretas do ISO e inicializações normais do ISO pelo Ventoy não configuram
sessão persistente automaticamente. Siga [Início rápido](/installation/Quick-Start.md)
e [Gerenciamento de sessões](/configuration/Session-Management.md) para o método
de gravação e boot escolhido.

## Qual é a diferença entre a sessão ativa e a sessão em execução?

A sessão ativa é selecionada para o próximo boot; conceitualmente, a sessão em execução fornece persistência no momento. O registro persistente `running=` pode estar desatualizado após uma falha, portanto, o estado protegido do boot atual e a camada gravável montada são as referências para as operações em tempo de execução. Ativar uma sessão não altera o sistema atual. Veja [Gerenciamento de Sessão](/configuration/Session-Management.md) e [Persistência do Initrd](/configuration/Initrd-Persistence.md).

## Por que minhas alterações desapareceram após reiniciar?

Você pode ter iniciado uma sessão nova, usado mídia sem persistência ou selecionado uma sessão diferente. Sessões Native, DynFileFS, raw e LUKS recebem gravações enquanto o sistema está em execução; elas não aguardam um snapshot de desligamento. Somente a persistência SquashFS exige que as alterações mantidas em RAM sejam reconstruídas em `changes.sb`, portanto, um desligamento interrompido ou uma política de salvamento desativada pode deixar as últimas alterações não salvas. Verifique a sessão em execução e a ativa conforme descrito em [Gerenciamento de sessões](/configuration/Session-Management.md) e [Solução de problemas](/administration/Troubleshooting.md).

## LUKS e SquashFS são o mesmo tipo de persistência?

Não. LUKS armazena uma sessão ext4 gravável e criptografada em um contêiner. SquashFS é um
snapshot compactado que roda a partir de uma camada gravável em RAM e precisa ser
salvo conforme sua política. Veja
[Gerenciamento de sessões](/configuration/Session-Management.md) e [Reforço de segurança](/administration/Security-Hardening.md).

## Por que um aplicativo ou módulo da Store aparece só depois de reiniciar?

O modo módulo cria um módulo `.sb` somente leitura para o próximo boot; ele não adiciona
o aplicativo ao conjunto de módulos atual. Confirme sua localização e reinicie como
descrito em [MiniOS Store](/administration/MiniOS-Store.md).

## Devo instalar software pelo APT ou como módulo?

Use o APT para modificar um sistema em execução ou sessão persistente. Use módulos para
camadas de software somente leitura carregadas na inicialização. Compare os efeitos e requisitos
de armazenamento em [Atualizações de software](/administration/Software-Updates.md) e
[Criação de módulos](/development/Creating-Modules.md).

## Posso atualizar o MiniOS para uma nova versão no local?

Não existe atualização de versão no local suportada. Não trate uma atualização de versão do Debian
como uma atualização de imagem do MiniOS. Faça backup dos seus dados e use uma imagem criada para
a versão de destino; veja [Atualizações de software](/administration/Software-Updates.md).

## Devo usar `ip=` para configurar a rede normalmente?

Não. Fornecer uma configuração de endereço como `ip=<configuration>` seleciona o boot de rede antecipado e ignora a mídia local. Configure o sistema em execução com o NetworkManager ou as ferramentas de rede documentadas. Veja
[Boot pela rede](/installation/Network-Boot.md) e
[Configuração de rede](/configuration/Network-Configuration.md).

## Como manter as configurações de Wi-Fi após reiniciar?

Armazene o perfil do NetworkManager em uma sessão live persistente ou em uma instalação nativa,
então teste reiniciando. O instalador não cria nem modifica perfis de Wi-Fi. Veja
[Configuração de rede](/configuration/Network-Configuration.md)
e [Gerenciamento de sessões](/configuration/Session-Management.md).

## O MiniOS é compatível com BIOS e UEFI?

O MiniOS suporta BIOS legado e UEFI x86-64, mas a entrada de firmware disponível
e o layout de partição do instalador ainda são importantes. Veja
[Instalando o MiniOS](/installation/Installing-MiniOS.md) e utilize
[Recuperação de boot](/administration/Boot-Recovery.md) caso o sistema instalado
não inicie.

## Como verificar um ISO?

Baixe o ISO e o arquivo correspondente `.iso.sha256` da mesma versão oficial,
então compare o checksum SHA-256 antes de gravar ou inicializar. Siga
[Verificando downloads](/installation/Verifying-Downloads.md).

## Devo reparar primeiro uma sessão ou sistema de arquivos corrompido?

Faça backup dos dados importantes e identifique exatamente o dispositivo, sistema de arquivos e ponto de montagem antes de alterar qualquer coisa. Nunca repare a única cópia ou uma sessão ativa.
Comece por [Backup e recuperação](/administration/Backup-Recovery.md),
[Solução de problemas](/administration/Troubleshooting.md) e
[Recuperação de boot](/administration/Boot-Recovery.md).

## O que devo incluir ao pedir ajuda ou relatar um problema?

Informe a edição e versão, métodos de boot e persistência, hardware, passos exatos,
primeiro erro e logs relevantes. Remova credenciais e outros dados sensíveis,
então siga [Coletar logs](/administration/Troubleshooting.md)
e reporte defeitos reproduzíveis no
[MiniOS issue tracker](https://github.com/minios-linux/minios-live/issues).

## Devo compilar a partir do código-fonte ou usar o Image Builder?

Compile a partir do código-fonte quando precisar criar todo o sistema MiniOS e o conjunto de módulos.
Use o [MiniOS Image Builder](/development/Image-Builder.md) para uma remasterização guiada, ou [`minios-image-compose`](/development/Rebuilding-ISO.md) para compor
uma árvore de conteúdo MiniOS existente pela linha de comando. Veja
[Compilando o MiniOS](/development/Building-MiniOS.md) para builds a partir do código-fonte.
