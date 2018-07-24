/**
 * @name hello-v1-api
 * @description This module packages the Hello API.
 */
'use strict';

const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const express = hydraExpress.getExpress();
const ServerResponse = require('fwsp-server-response');

let serverResponse = new ServerResponse();
express.response.sendError = function(err) {
  serverResponse.sendServerError(this, {result: {error: err}});
};
express.response.sendOk = function(result) {
  serverResponse.sendOk(this, {result});
};

let api = express.Router();

api.get('/',
(req, res) => {
  res.sendOk({greeting: 'Welcome to Hydra Express!'});
});

module.exports = api;
