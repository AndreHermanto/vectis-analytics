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

const express = require('express');
const router = express.Router();
var cors = require('cors');
const auth0api = require('../api/auth0-api');
var cohort = require("../config/cohort-value-mapping");
const jwt = require("jsonwebtoken");
var fs = require('fs');
var cert = fs.readFileSync(__dirname + '/../sgc.pem');

function authenticateToken(req, res, next) {
	// Gather the jwt access token from the request header
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401) // if there isn't any token

	jwt.verify(token.toString(), cert, (err, user) => {
	  if (err) return res.sendStatus(403)
	  req.user = user
	  next() // pass the execution off to whatever request the client intended
	})
  }

router.options('/user-permissions', cors());
router.post('/user-permissions', authenticateToken, function(req, res, next) {
	const email = req.body.email;
	const platform = req.body.platform;

	if(cohort[platform] === undefined){
		res.status(400).send('No platform exist. Please check your query')
	}

	auth0api.getAccessTokenMgmtApi().then(body => {
		const access_token = JSON.parse(body).access_token;
		try{
			auth0api.getAccessToken().then(body => {
				const access_token_authorization = JSON.parse(body).access_token;
				auth0api.getUserFromEmail(access_token, email).then(e => {
					const user = JSON.parse(e);
					if(user.statusCode === 400 || user.statusCode === 401 || user.statusCode === 402 || user.statusCode === 403 || user.statusCode === 404 || user.statusCode === 500 || user.statusCode === 501 || user.statusCode === 502 || user.statusCode === 503){
						res.status(user.statusCode).send(user.message)
					}else{
						if(user.length !== 0){
							const user_id = JSON.parse(e)[0].user_id;
							auth0api.getUserRoles(access_token_authorization, user_id).then(roles=>{
								const rolesData = JSON.parse(roles).filter(x => cohort[platform].map(role => role.id).includes(x._id));
								res.send(rolesData);
							})
						}else{
							res.status(400).send('User not found')
						}
					}
				  })
			  })
		}catch(err){
			next(err);
			res.status(404).send('Something went wrong. Please try again later')
		}

	  })
})

module.exports = router;
