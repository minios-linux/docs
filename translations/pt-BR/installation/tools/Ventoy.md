# Usando o Ventoy

Ventoy é uma ferramenta popular para criar pendrives bootáveis que permite armazenar múltiplos arquivos ISO em um único dispositivo e inicializar a partir de qualquer um deles.

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

⚠️ **Requisito de modo de boot:** Para que o MiniOS funcione corretamente com o Ventoy, você DEVE selecionar o **modo GRUB2** ao inicializar, ou renomear seu arquivo ISO com o sufixo `VTGRUB2` (exemplo: `minios-standard-amd64_VTGRUB2.iso`) para forçar automaticamente o modo GRUB2.

## Requisitos do Drive

### Tamanho do Drive

Consulte o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md#system-requirements) para detalhes sobre requisitos de sistema e tamanhos de drive.

## Instalando o Ventoy

### Método 1: Instalação Padrão

1. **Baixe o Ventoy** no [site oficial](https://www.ventoy.net/)
2. **Execute o instalador do Ventoy** e selecione seu pendrive
3. **Instale o Ventoy** no drive (todos os dados serão apagados)
4. **Copie o arquivo ISO do MiniOS** para a pasta raiz do pendrive

Após a instalação, o drive estará pronto para uso. O MiniOS criará automaticamente o armazenamento para salvar alterações.

### Método 2: Instalação com Partição de Dados Separada (Recomendado)

1. **Baixe o Ventoy** no [site oficial](https://www.ventoy.net/)
2. **Execute o instalador do Ventoy** e selecione seu pendrive  
3. **Ative a opção "Reservar Espaço"** durante a instalação para criar uma partição adicional
4. **Instale o Ventoy** no drive
5. **Copie o arquivo ISO do MiniOS** para a pasta raiz do pendrive
6. **Crie uma partição ext4** no espaço reservado com o rótulo `persistence`

Esse método oferece operações de dados mais rápidas e maior controle sobre o armazenamento.

## Integração com o MiniOS

O MiniOS possui suporte nativo ao Ventoy e detecta automaticamente quando está sendo executado em um ambiente Ventoy. O sistema configura automaticamente a persistência de alterações sem necessidade de configuração adicional pelo usuário.

### Persistência Automática de Alterações

O MiniOS detecta automaticamente quando está rodando em um ambiente Ventoy e configura a persistência de alterações:

- **Com partição `persistence` separada**: Usa essa partição para armazenamento direto de dados (modo nativo, máxima velocidade)
- **Com instalação padrão**: Cria um arquivo dinâmico na partição principal do Ventoy (modo dynfilefs)

### Configuração de Parâmetros (para Usuários Avançados)

Quando for necessária uma configuração precisa, é possível utilizar parâmetros de boot:

**Para partição `persistence` separada (todos os modos disponíveis):**
- `perchmode=native` - Salvamento direto na partição (mais rápido)
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente
- `perchmode=raw` - Arquivo de tamanho fixo

**Para instalação padrão do Ventoy (dois modos disponíveis):**
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente (padrão, economiza espaço)
- `perchmode=raw` - Arquivo de tamanho fixo

**Parâmetros comuns para arquivos:**
- `perchsize=8000` - Tamanho do espaço de armazenamento de dados em MB

Mais detalhes em [parâmetros de boot](/configuration/Boot-Parameters.md).

## Usando o MiniOS com Ventoy

### Inicialização

Após instalar o Ventoy e copiar o arquivo ISO do MiniOS para o drive:

1. **Inicie pelo pendrive** - selecione-o no BIOS/UEFI
2. **Selecione o MiniOS** na lista de arquivos ISO disponíveis no menu do Ventoy
3. **⚠️ IMPORTANTE: Selecione o modo GRUB2** quando solicitado pelo Ventoy
4. **Aguarde o carregamento** - o sistema será configurado automaticamente para uso

### **Requisitos de Modo de Boot do Ventoy**

**Para que o MiniOS funcione corretamente:**
- **Modo GRUB2** - Necessário para o funcionamento correto do MiniOS

**Solução alternativa:**
- Adicione o sufixo `VTGRUB2` ao nome do arquivo ISO (exemplo: `minios-5.0.0-standard-amd64_VTGRUB2.iso`)
- Isso faz com que o Ventoy utilize automaticamente o modo GRUB2 sem solicitar
