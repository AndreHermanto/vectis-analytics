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