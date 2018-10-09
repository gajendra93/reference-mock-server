const uuidv4 = require('uuid/v4');
const { getResponse, postResponse } = require('./payments.js');

const postPaymentSubmissionsResponse = (paymentSubmissionId, paymentId, status) => ({
  Data: {
    PaymentSubmissionId: paymentSubmissionId,
    PaymentId: paymentId,
    Status: status,
    CreationDateTime: `${(new Date()).toISOString().slice(0, -5)}+00:00`,
  },
  Links: {
    Self: `/open-banking/v1.1/payment-submissions/${paymentSubmissionId}`,
  },
  Meta: {},
});

const getPaymentSubmissionsResponse = (paymentSubmissionId, status) => ({
  Data: {
    PaymentSubmissionId: paymentSubmissionId,
    PaymentId: uuidv4(),
    Status: status,
    CreationDateTime: `${(new Date()).toISOString().slice(0, -5)}+00:00`,
  },
  Links: {
    Self: `/open-banking/v1.1/payment-submissions/${paymentSubmissionId}`,
  },
  Meta: {}
})

const post = (req, res) => {
  const paymentSubmissionId = uuidv4();
  const paymentId = req.body.Data.PaymentId;
  const responsePayload = postPaymentSubmissionsResponse(paymentSubmissionId, paymentId, 'AcceptedSettlementInProcess');
  return postResponse(req, res, responsePayload);
};

const get = (req, res) => {
  const responsePayload = getPaymentSubmissionsResponse(req.pathParams.PaymentSubmissionId, 'AcceptedSettlementCompleted');
  return getResponse(req, res, responsePayload);
}

const paymentSubmissionsMiddleware = (req, res, next) => {
  if (req.path.indexOf('/open-banking/v1.1/payment-submissions') === -1) {
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

exports.postPaymentSubmissionsResponse = postPaymentSubmissionsResponse;
exports.getPaymentSubmissionsResponse = getPaymentSubmissionsResponse;
exports.paymentSubmissionsMiddleware = paymentSubmissionsMiddleware;
