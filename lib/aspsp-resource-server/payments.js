const uuidv4 = require('uuid/v4');
const { accountRequestHelper } = require('./account-request.js');
const log = require('debug')('log');

const postPaymentsResponse = (request, paymentId, status) => ({
  Data: {
    PaymentId: paymentId,
    Status: status,
    CreationDateTime: `${(new Date()).toISOString().slice(0, -5)}+00:00`,
    Initiation: request.Data.Initiation,
  },
  Risk: request.Risk,
  Links: {
    Self: `/open-banking/v1.1/payments/${paymentId}`,
  },
  Meta: {},
});

const getPaymentsResponse = (paymentId, status) => ({
  Data: {
    PaymentId: paymentId,
    Status: status,
    CreationDateTime: `${(new Date()).toISOString().slice(0, -5)}+00:00`,
    Initiation: {
      InstructionIdentification: "ACME412",
      EndToEndIdentification: "FRESCO.21302.GFX.20",
      InstructedAmount: {
        Amount: "140.70",
        Currency: "GBP"
      },
      CreditorAccount: {
        SchemeName: "SortCodeAccountNumber",
        Identification: "123422290",
        Name: "Alice"
      }
    },
  },
  Risk: {},
  Links: {
    Self: `/open-banking/v1.1/payments/${paymentId}`,
  },
  Meta: {}
});

const postResponse = (req, res, responsePayload) => {
  const authorization = req.headers['authorization']; // eslint-disable-line
  const authorized = accountRequestHelper.checkAuthorization({ authorization });
  if (!authorized) {
    return res.sendStatus(401);
  }
  const interactionId = req.headers['x-fapi-interaction-id'];
  const response = res.status(201).header('Content-Type', 'application/json');
  if (interactionId) {
    response.header('x-fapi-interaction-id', interactionId);
  }
  return response.json(responsePayload);
};

const getResponse = (req, res, responsePayload) => {
  const authorization = req.headers['authorization']; // eslint-disable-line
  const authorized = accountRequestHelper.checkAuthorization({ authorization });
  if (!authorized) {
    return res.sendStatus(401);
  }
  const interactionId = req.headers['x-fapi-interaction-id'];
  const response = res.status(200).header('Content-Type', 'application/json');
  if (interactionId) {
    response.header('x-fapi-interaction-id', interactionId);
  }
  return response.json(responsePayload);
}

const post = (req, res) => {
  const paymentId = uuidv4();
  const responsePayload = postPaymentsResponse(req.body, paymentId, 'AcceptedTechnicalValidation');
  return postResponse(req, res, responsePayload);
};

const get = (req, res) => {
  const responsePayload = getPaymentsResponse(req.pathParams.PaymentId, 'AcceptedTechnicalValidation');
  return getResponse(req, res, responsePayload);
}

const paymentsMiddleware = (req, res, next) => {
  if (req.path.indexOf('/open-banking/v1.1/payments') === -1) {
    return next();
  }
  switch (req.method) {
    case 'POST':
      return post(req, res);
    case 'GET':
      return get(req, res);
    default:
      return res.sendStatus(400);
  }
};

exports.postPaymentsResponse = postPaymentsResponse;
exports.getPaymentsResponse = getPaymentsResponse;
exports.postResponse = postResponse;
exports.getResponse = getResponse;
exports.paymentsMiddleware = paymentsMiddleware;
