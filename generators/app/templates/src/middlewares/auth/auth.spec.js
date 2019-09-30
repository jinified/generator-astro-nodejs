/* eslint-disable arrow-body-style */
const jwt = require('jsonwebtoken');
const MockReq = require('mock-express-request');
const MockRes = require('mock-express-response');
const httpStatus = require('http-status');
const { jwtTokenSecret } = require('@config/vars');
const { authMiddleware } = require('./auth.middleware');

describe('Middleware - authMiddleware', () => {
  const res = new MockRes();
  beforeEach(() => {});

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw error if authorization header not present', () => {
    const req = new MockReq({
      headers: {}
    });
    const status = jest.spyOn(res, 'status');
    const json = jest.spyOn(res, 'json');
    return authMiddleware(req, res).then(() => {
      expect(status).toBeCalledWith(httpStatus.UNAUTHORIZED);
      expect(json).toBeCalledWith(expect.objectContaining({
        responseCode: httpStatus.UNAUTHORIZED,
        responseMessage: expect.any(String),
        response: expect.any(Object)
      }));
    });
  });

  it('should throw error if jwt token invalid', () => {
    const req = new MockReq({
      headers: { authorization: 'Bearer adadsdfdsdfsdf' }
    });
    const status = jest.spyOn(res, 'status');
    const json = jest.spyOn(res, 'json');
    return authMiddleware(req, res).then(() => {
      expect(status).toBeCalledWith(httpStatus.UNAUTHORIZED);
      expect(json).toBeCalledWith(expect.objectContaining({
        responseCode: httpStatus.UNAUTHORIZED,
        responseMessage: expect.any(String),
        response: expect.any(Object)
      }));
    });
  });

  it('should validate the authorization token', (done) => {
    const accessToken = jwt.sign({
      sessionToken: 'asd',
      user: {
        name: test
      }
    }, jwtTokenSecret, { expiresIn: '1h' });
    const req = new MockReq({
      headers: { authorization: `Bearer ${accessToken}` }
    });
    return authMiddleware(req, res, () => {
      done();
    });
  });
});
