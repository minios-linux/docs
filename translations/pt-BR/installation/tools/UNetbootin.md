# Usando o UNetbootin

UNetbootin é uma ferramenta open source multiplataforma que permite criar pendrives bootáveis para várias distribuições Linux, incluindo o MiniOS.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira cuidadosamente o drive selecionado e faça backup dos dados importantes.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md#system-requirements) para requisitos detalhados de sistema e tamanhos de drive.

## Instalando o UNetbootin

1. **Baixe o UNetbootin** no [site oficial](https://unetbootin.github.io/)
2. **Instale o programa** no seu sistema:
   - **Windows**: Execute o instalador como administrador
   - **Linux**: Instale pelo repositório ou utilize o AppImage
   - **macOS**: Arraste o aplicativo para a pasta Aplicativos

## Criando um Pendrive Bootável

1. **Abra o UNetbootin** como administrador/root
2. **Selecione a origem da imagem:**
   - Defina a opção para "Imagem de disco"
   - Clique no botão "..." e selecione o arquivo ISO do MiniOS
3. **Selecione o dispositivo de destino:**
   - Na lista "Drive", selecione seu pendrive
   - Certifique-se de que o dispositivo correto está selecionado
4. **Inicie o processo:** Clique em "OK"
5. **Aguarde a conclusão** – o processo pode levar de 10 a 20 minutos

## Persistência Automática de Alterações

O UNetbootin formata automaticamente o drive em FAT32, então o MiniOS usará o modo dynfilefs para salvar alterações. Isso garante máxima compatibilidade com diversos sistemas, incluindo suporte para boot EFI.

### Configuração de Parâmetros (para Usuários Avançados)

Quando for necessário configurar com precisão, é possível usar parâmetros de boot:

- `perchmode=dynfilefs` - Arquivo expansível dinamicamente (padrão)
- `perchmode=raw` - Arquivo de tamanho fixo
- `perchsize=8000` - Espaço de armazenamento de dados em MB

Mais detalhes em [parâmetros de boot](/configuration/Boot-Parameters.md).
