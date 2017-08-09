const { Parser } = require('xml2js')
const iconv = require('iconv-lite')
const request = require('request')
const functions = require('firebase-functions')
const cors = require('cors')({ origin: true })

const mapResults = results => {
  const names = {
    '40010': 'SEDEX',
    '40045': 'SEDEX a Cobrar',
    '40215': 'SEDEX 10',
    '40290': 'SEDEX Hoje',
    '41106': 'PAC'
  }

  return results['Servicos']['cServico']
    .map(freight => ({
      name: names[freight['Codigo'][0]],
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

  const parser = new Parser()

  return new Promise((resolve, reject) => {
    const options = {
      qs: {
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
      },
      encoding: null
    }

    request.get(url, options, (err, response) => {
      if (err)
        reject('Erro no serviço online dos correios.')

      const data = iconv.decode(response.body, 'ISO-8859-1')

      parser.parseString(data, (err, results) => {
        if (err)
          reject('Erro ao traduzir os dados dos correios.')
        resolve(mapResults(results))
      })
    })
  })
}

exports.freight = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    const isCode = /^\d{8}$/

    if (!isCode.test(request.body.code)) {
      response.status(500).send('CEP incorreto ou vazio.')
      return
    }

    calcFreight(request.body.code)
      .then(data => response.send(data))
      .catch(err => {
        const message = typeof err === 'string' ? err : 'Erro ao calcular o frete.'
        response.status(500).send(message)
      })
  })
})
