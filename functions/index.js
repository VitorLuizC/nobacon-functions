const functions = require('firebase-functions')
const axios = require('axios')
const qs = require('qs')
const xml = require('xml2js')

const calcFreight = code => {
  const url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx'

  const parser = new xml.Parser()

  const data = qs.stringify({
    nCdEmpresa: '',
    sDsSenha: '',
    nCdServico: '40010,40045,40215,40290,41106',
    sCepOrigem: '02998060',
    sCepDestino: code,
    nVlPeso: 0.800,
    nCdFormato: 1,
    nVlComprimento: 18,
    nVlAltura: 9,
    nVlLargura: 13.5,
    nVlDiametro: 0,
    sCdMaoPropria: 'N',
    nVlValorDeclarado: 0,
    sCdAvisoRecebimento: 'S',
    StrRetorno: 'XML',
    sDtCalculo: '3'
  })

  return axios.post(url, data).then(({ data }) => {
    return new Promise((resolve, reject) => {
      parser.parseString(data, (err, json) => {
        if (err)
          reject(err)
        resolve(json)
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
      response.send(500)
    })
});
