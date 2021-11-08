// The MIT License

// Copyright (c) 2021 Garvan, Andre Hermanto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var request = require("request");
var config = require("../config/keys")

module.exports ={
  getAccessToken: function(){
    var options = { method: 'POST',
    url: 'https://sgc.au.auth0.com/oauth/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      "grant_type": 'client_credentials',
      "client_id": config.auth0AuthorizationClientId,
      "client_secret": config.auth0AuthorizationClientSecret,
      "audience":"urn:auth0-authz-api"
      }};
  
    return new Promise (function(resolve, reject){
      request(options, function (error, response, body) {
        if(error) return reject(error);
        try {
          resolve(body);
        }catch(e){
          reject(e);
        }
      }
    )});
  },
  getAccessTokenMgmtApi: function(){
    var options = { method: 'POST',
    url: 'https://sgc.au.auth0.com/oauth/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      "grant_type": 'client_credentials',
      "client_id":config.auth0VectisClientId,
      "client_secret":config.auth0VectisClientSecret,
      "audience":"https://sgc.au.auth0.com/api/v2/"
      }};
  
    return new Promise (function(resolve, reject){
      request(options, function (error, response, body) {
        if(error) return reject(error);
        try {
          resolve(body);
        }catch(e){
          reject(e);
        }
      }
    )});
  },
  getUserRoles: function(accessToken, userId){
    var options = { method: 'GET',
      url: `https://sgc.au.webtask.io/adf6e2f2b84784b57522e3b19dfc9201/api/users/${userId}/roles`,
      headers: { 
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      }
    }

    return new Promise (function(resolve, reject){
      request(options, function (error, response, body) {
        if(error) return reject(error);
        try {
          resolve(body);
        }catch(e){
          reject(e);
        }
      }
    )});
  },
  getRoles: function(accessToken){
    var options = { method: 'GET',
      url: `https://sgc.au.webtask.io/adf6e2f2b84784b57522e3b19dfc9201/api/roles`,
      headers: { 
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      }
    }

    return new Promise (function(resolve, reject){
      request(options, function (error, response, body) {
        if(error) return reject(error);
        try {
          resolve(body);
        }catch(e){
          reject(e);
        }
      }
    )});
  },
  getUserFromEmail: function(accessToken, email){
    var options = { method: 'GET',
      url: `https://sgc.au.auth0.com/api/v2/users-by-email`,
      qs: {email: email},
      headers: { 
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      }
    }

    return new Promise (function(resolve, reject){
      request(options, function (error, response, body) {
        if(error) return reject(error);
        try {
          resolve(body);
        }catch(e){
          reject(e);
        }
      }
    )});
  },
  getUser: function(accessToken, id){
    var options = { method: 'GET',
      url: `https://sgc.au8.webtask.io/adf6e2f2b84784b57522e3b19dfc9201/api/users/${id}`,
      headers: { 
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      }
    }

    return new Promise (function(resolve, reject){
      request(options, function (error, response, body) {
        if(error) return reject(error);
        try {
          resolve(body);
        }catch(e){
          reject(e);
        }
      }
    )});
  }
} 