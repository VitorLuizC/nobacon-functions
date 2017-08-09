# Changelog das funções da NOBACON <small>STORE</small>

## 08/08/2017
- `freight` consertada. Habilitei CORs para a requisição;
- `freight` melhorada. Troquei o módulo `iconv` para o `iconv-lite` e reduzi
consideravelmente o tempo de processamento.

## 06/08/2017
- `freight` consertada. As mensagens de erro/restrição são convertidas para o
_CHARSET_ correto e não apresentam mais erros nos acentos;
- `freight` melhorada. O parâmetro CEP (`code`) é validado de uma forma mais
eficiente com o RegExp `/^\d{8}$/`, ou seja 8 caracteres decimais apenas;
- Adicionado esse CHANGELOG e um README ao projeto.

## 01/08/2017
- `freight` melhorada. Obtém também o nome do serviço, não apenas o código.

## 31/07/2017
- `freight` publicada. Obtém os preços dos serviços dos correios para o CEP
(`code`) enviado nos parâmetros da requisição.
