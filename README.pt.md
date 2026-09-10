# Ferramentas do Dia a Dia (Everyday Tools)

Utilitários gratuitos no navegador, com foco em privacidade. **Todo o processamento ocorre no seu dispositivo** — sem uploads, anúncios, rastreadores ou cadastro.

**English:** see [README.md](./README.md)

## Ferramentas

1. **Comprimir e redimensionar imagens** — comparação de tamanho/qualidade; baixa arquivos novos (nunca sobrescreve originais)
2. **Converter imagens** — PNG / JPEG / WebP com erros claros e limites
3. **PDF mesclar, dividir, reordenar** — no cliente com [pdf-lib](https://pdf-lib.js.org/)
4. **Códigos QR** — baixar PNG e SVG
5. **Texto** — limpar, remover linhas duplicadas, contar palavras
6. **Dinheiro** — descontos, preço unitário, divisão de conta

## Privacidade

- Arquivos e texto não saem do navegador
- Sem analytics, anúncios ou contas
- Seção Apoie/Doações **desativada por padrão** (`src/config/support.ts`)

## Instalar e rodar

Node.js 20+ recomendado.

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
npm run preview
```

## Publicar (opções gratuitas)

O app é estático (`dist/`). **GitHub Pages** para repositórios públicos é gratuito; este projeto **não afirma** que Pages já está ativo — você precisa habilitar nas configurações do repositório. Nada pago é necessário para o uso padrão.

## Limites

- Imagens: 25 MB cada, até 20 arquivos
- PDFs: 50 MB cada, até 30 arquivos

## Créditos

React, Vite, pdf-lib, browser-image-compression e qrcode (todos MIT). Detalhes em [README.md](./README.md).

## Limitações

- Conversão via Canvas; GIFs animados viram um quadro
- PDFs criptografados podem falhar
- Sem processamento em servidor (de propósito)

## Licença

[MIT](./LICENSE) © 2026 manansbdb
