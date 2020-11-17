const express = require('express');
const router = express.Router();
var con = require('../dbconnection');
var config = require("../config/keys");
const jwt = require("jsonwebtoken");
var cors = require('cors')
var mysql = require('mysql');

function authenticateToken(req, res, next) {
	// Gather the jwt access token from the request header
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401) // if there isn't any token

	jwt.verify(token.toString(), config.auth0ClientSecret, (err, user) => {
	  if (err) return res.sendStatus(403)
	  req.user = user
	  next() // pass the execution off to whatever request the client intended
	})
  }

router.options('/user-query', cors());
router.post('/user-query', authenticateToken, function(req, res, next) {
    var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const email = req.body.email;
    const data_access = req.body.data_access;
    const cohort = req.body.cohort;
    var sql = `INSERT INTO USER_QUERIES (timestamp, email, cohort, data_access) VALUES (${mysql.escape(timestamp)},${mysql.escape(email)},${mysql.escape(cohort)}, ${mysql.escape(data_access)})`;

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json({success: true});
      });
})

router.options('/search-query', cors());
router.post('/search-query', authenticateToken, function(req, res, next) {
    var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const gene = req.body.gene || "";
    const panel_source = req.body.panel_source || "";
    const panel = req.body.panel || "";
    const cohort = req.body.cohort;
    const data_access = req.body.data_access;
    var sql = `INSERT INTO SEARCH_QUERIES (timestamp, gene, panel_source, panel, cohort, data_access) VALUES (${mysql.escape(timestamp)},${mysql.escape(gene)},${mysql.escape(panel_source)}, ${mysql.escape(panel)},${mysql.escape(cohort)}, ${mysql.escape(data_access)})`;

    con.query(sql, function (err, result) {
	if (err) throw err;
        res.json({success: true});
      });
})

router.options('/user-login', cors());
router.post('/user-login', authenticateToken, function(req, res, next) {
    var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const email = req.body.email;
    const signup = req.body.signup;
    const geoLat = req.body.geoLat;
    const geoLng = req.body.geoLng;
    const platform = req.body.platform;
    var sql = `INSERT INTO USER_LOGIN (timestamp, email, platform, signup, geo) VALUES (${mysql.escape(timestamp)},${mysql.escape(email)},${mysql.escape(platform)},${mysql.escape(signup)}, ST_GeomFromText('POINT(${mysql.escape(geoLng)} ${mysql.escape(geoLat)})'))`;
    
    con.query(sql, function (err, result) {
	if (err) throw err;
        res.json({success: true});
      });
})

router.options('/temp-query', cors());
router.post('/temp-query', function(req, res, next) {
        const query = req.body.query;
        con.query(`SELECT ${query}`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

module.exports = router;
