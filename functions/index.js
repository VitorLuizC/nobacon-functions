const functions = require('firebase-functions')
const request = require('request')
const xml = require('xml2js')

const mapResults = results => {
  return results['Servicos']['cServico']
    .map(freight => ({
      code: freight['Codigo'][0],
      price: +(freight['Valor'][0].replace(',', '.') || 0),
      delivery: {
        time: +(freight['PrazoEntrega'][0] || 0),
        home: freight['EntregaDomiciliar'][0] === 'S',
        onSaturday: freight['EntregaSabado'][0] === 'S',
        restriction: freight['MsgErro'][0]
      }
    }))
    .filter(freight => !!freight.price)
}

const calcFreight = code => {
  const url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx'

  const parser = new xml.Parser()

  return new Promise((resolve, reject) => {
    const data = {
      nCdEmpresa: '',
      sDsSenha: '',
      sCepOrigem: '70002900',
      sCepDestino: code,
      nVlPeso: 0.800,
      nCdFormato: 1,
      nVlComprimento: 18,
      nVlAltura: 9,
      nVlLargura: 13.5,
      sCdMaoPropria: 'n',
      nVlValorDeclarado: 0,
      sCdAvisoRecebimento: 's',
      nCdServico: '40010,40045,40215,40290,41106',
      nVlDiametro: 0,
      StrRetorno: 'xml',
      nIndicaCalculo: '3'
    }

    request.get(url, { qs: data }, (err, response) => {
      if (err)
        reject('Erro no serviço online dos correios.')

      parser.parseString(response.body, (err, results) => {
        if (err)
          reject('Erro ao traduzir os dados dos correios.')
        resolve(mapResults(results))
      })
    })
  })
}

exports.freight = functions.https.onRequest((request, response) => {
  const code = request.body.code

  if (!code)
    response.send(500, 'Parâmetro incorreto ou vazio.')

  calcFreight(code)
    .then(data => response.send(data))
    .catch(err => {
      const message = typeof err === 'string' ? err : 'Erro ao calcular o frete.'
      response.send(500, message)
    })
});
