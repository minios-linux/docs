# Usando o Drive Utility

O Drive Utility é uma ferramenta gráfica para gravar imagens ISO do MiniOS em unidades USB.

**Instalação:** Disponível por padrão no MiniOS; para outras distribuições, consulte https://github.com/minios-linux/driveutility

## Importante

⚠️ **Atenção:** Selecionar o dispositivo incorreto resultará em perda de dados! Sempre confira o drive selecionado e faça backup dos dados importantes.

## Requisitos da Unidade

### Tamanho da Unidade (para gravação do MiniOS)

Veja o [Guia de Compatibilidade de Hardware](/installation/Hardware-Compatibility.md#system-requirements) para requisitos detalhados de sistema e tamanhos de unidade.

### Sistemas de Arquivos Suportados

- **FAT32**: máxima compatibilidade
- **NTFS**: compatibilidade com Windows  
- **EXT4**: recomendado para Linux

## Iniciando o Drive Utility

**Pelo menu de aplicativos:**
1. Abra o menu → Sistema → "Drive Utility"

**Pelo terminal:**
```bash
driveutility
```

## Criando Unidade USB Inicializável

1. **Selecione o modo "Write"** na janela principal do programa
2. **Selecione o arquivo ISO do MiniOS:**
   - Clique no botão "Browse" ao lado do campo "Source"
   - Localize e selecione o arquivo MiniOS.iso baixado
3. **Selecione a unidade de destino:**
   - Escolha seu pendrive na lista de dispositivos
   - Confirme a seleção pelo tamanho e modelo
4. **Inicie a gravação:**
   - Clique no botão "Write"
   - Confirme a operação – todos os dados da unidade serão apagados
5. **Aguarde a conclusão** – o processo levará alguns minutos

## Persistência Automática de Alterações

Ao gravar o MiniOS pelo Drive Utility, uma cópia exata da imagem ISO é criada. O MiniOS detecta automaticamente o método de gravação e configura a persistência de alterações no primeiro boot.

### Configuração de Parâmetros (para usuários avançados)

Para configuração precisa da persistência, é possível utilizar parâmetros de boot:

- `perchmode=native` - Salvamento direto na partição (quando houver espaço livre)
- `perchmode=dynfilefs` - Arquivo expansível dinamicamente
- `perchmode=raw` - Arquivo de tamanho fixo
- `perchsize=8000` - Espaço de armazenamento para dados em MB

Detalhes em [parâmetros de boot](/configuration/Boot-Parameters.md).
