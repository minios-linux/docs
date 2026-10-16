---
updated: 2026-10-15
---

# Fazendo backup de MiniOS

Um backup é a forma confiável de recuperar MiniOS. A documentação não oferece um procedimento genérico de reparo para um bootloader, sistema de arquivos ou contêiner de persistência danificado. Mantenha cópias recuperáveis antes de alterar uma versão, o kernel, o layout de armazenamento ou uma sessão importante.

## O que incluir no backup

Mantenha os itens que não podem ser simplesmente recriados a partir de uma imagem MiniOS:

- arquivos pessoais, incluindo dados ocultos de aplicativos que sejam importantes para você;
- `config.conf`, arquivos `config.conf.d` revisados e alterações intencionais no menu de inicialização ou nos parâmetros de boot;
- módulos `.sb` criados pelo usuário e uma anotação da versão MiniOS para a qual foram compilados;
- sessões persistentes que contenham o estado do sistema ou de aplicativos de que você precisa;
- chaves de criptografia, credenciais de recuperação e outros segredos, armazenados separadamente do backup que protegem.

Arquivos armazenados fora da camada da sessão, por exemplo, em um local separado para dados do usuário, precisam de backup separado. Não presuma que um arquivo de sessão contém dados montados de outro sistema de arquivos.

## Exportar sessões persistentes

O Gerenciador de sessões MiniOS pode exportar uma sessão **inativa** `native`, `dynfilefs`, `dynblk`, `vmdk` ou `raw` sessão, inclusive formatos compatíveis criptografados com LUKS2, para um arquivo `.tar.zst` verificado. Primeiro, identifique a sessão:

```bash
sudo minios-session list
sudo minios-session running
```

Em seguida, inicialize outra sessão ou **Iniciar sem salvar** e exporte a sessão inativa:

```bash
sudo minios-session export <id> /path/to/session.tar.zst
```

A exportação é uma cópia lógica do conteúdo da sessão, não uma cópia byte a byte do contêiner de armazenamento. Armazene-a em outro dispositivo.

Para uma sessão cujo backend Raw, DynFileFS, DynBlk ou VMDK esteja protegido por LUKS2, o arquivo contém os arquivos lógicos descriptografados. Proteja o arquivo separadamente se os dados precisarem permanecer criptografados.

### Sessões SquashFS

O Gerenciador de sessões atual não exporta nem copia sessões SquashFS. Use **Salvar agora** antes de desligar para garantir que o snapshot atual esteja completo; em seguida, proteja separadamente os arquivos importantes. Se precisar de uma cópia completa e restaurável de todo o dispositivo MiniOS, crie uma imagem do dispositivo offline.

Não confie na cópia manual de um diretório de sessão montado nem na reconstrução de `session.conf`, segmentos DynFileFS, arquivos de apoio DynBlk ou outros metadados do contêiner como método de backup. Um backup manual byte a byte de DynBlk é seguro somente quando o volume está desconectado e deve preservar todas as partes existentes de `volume*.db`, inclusive números com quatro ou mais dígitos, exatamente como estão; a cópia lógica de `minios-session export` é preferível.

## RAM de sessões e imagens de persistência de Ventoy

Antes de fazer backup do armazenamento usado por uma `perchtoram` sessão, salve explicitamente o estado de RAM no armazenamento original ou como uma nova sessão. Caso contrário, uma cópia offline da mídia original conterá apenas o último estado salvo. Para salvar, é necessário ter a mídia original gravável e sua identidade registrada; consulte [Sessões e persistência](/using-minios/Sessions-and-Persistence).

O backend selecionado do Persistence Plugin de Ventoy é um ambiente ext4, não uma sessão numerada de MiniOS, e não pode ser exportado pelo Session Manager. Desligue-o corretamente antes de copiar a imagem completa do backend de outro sistema; preserve também a configuração de Ventoy. Mantenha backups separados dos arquivos pessoais importantes.

## Fazer backup da configuração e dos módulos

Em mídias graváveis de MiniOS, preserve `minios/config.conf`, `minios/config.conf.d/` e os módulos criados pelo usuário armazenados em `minios/modules/`.
Registre também os parâmetros de inicialização personalizados ou as alterações no menu de inicialização que não sejam óbvios a partir desses arquivos.

Um módulo compilado para uma versão de MiniOS não é automaticamente compatível com outra.
Guarde o código-fonte ou a receita necessária para recompilar módulos personalizados importantes.

## Criar uma imagem do dispositivo inteiro

Uma imagem do dispositivo inteiro é útil quando você quer preservar juntos a tabela de partições, os arquivos de inicialização, os módulos, a configuração, as sessões e outros dados. Crie a imagem offline: desligue MiniOS e gere a imagem do dispositivo a partir de outro sistema em execução.

[Utilitário de disco](/installing-minios/installation-tools/Drive-Utility) oferece as operações **Criar imagem** e **Gravar imagem**. Salve a imagem em outro dispositivo físico. Restaurar uma imagem do dispositivo inteiro sobrescreve o destino selecionado; por isso, verifique o modelo e a capacidade do destino antes de gravar a imagem.

A imagem do dispositivo complementa um backup separado dos arquivos pessoais importantes; não o substitui.

## Restaurar um arquivo de sessão

Importar um arquivo do Session Manager cria uma nova sessão numerada; não sobrescreve a existente:

```bash
sudo minios-session import /path/to/session.tar.zst --auto-convert
```

As verificações de compatibilidade são executadas durante a importação. Inspecione a sessão importada antes de ativá-la e mantenha a sessão que já funciona até testar a cópia restaurada.

Ao migrar para outra versão de MiniOS, prefira migrar dados pessoais e configurações selecionados. Não presuma que uma sessão completa antiga ou um módulo personalizado seja compatível com a nova versão só porque é possível copiá-lo para lá.

Consulte [Sessões e persistência](/using-minios/Sessions-and-Persistence) para saber mais sobre o gerenciamento de sessões e [Atualizar MiniOS](/maintenance-and-recovery/Updating-MiniOS) para migrar entre versões de MiniOS.
