const express = require('express');
const router = express.Router();
var con = require('../dbconnection');
var config = require("../config/keys");
const jwt = require("jsonwebtoken");
var cors = require('cors');
var mysql = require('mysql');
var fs = require('fs');

const ignoredEmails = [
    'andre.hermanto93@gmail.com',
    'didaswiwaw@gmail.com',
    'sgc@garvan.org.au',
    'dmeetry@gmail.com',
    'warren.kaplan@gmail.com',
    'mariejobrion@gmail.com',
    'stephtongs@gmail.com',
    'sarah.casauria@mcri.edu.au',
    'alejandro.metke@csiro.au',
    'tessa.mattiske@mcri.edu.au',
    'tiffany.boughtwood@mcri.edu.au',
    'vana.madelli@mcri.edu.au',
    'alex@rivi.io',
    's.ravishankar@garvan.org.au',
    'j.copty@garvan.org.au',
    'd.lin@garvan.org.au',
    'a.palmer@garvan.org.au',
    'm.hobbs@garvan.org.au',
    'stef.elbrachtleong@mcri.edu.au',
    's.kummerfeld@garvan.org.au',
    'andrehermanto14693@gmail.com',
    'stef.elbrachtleong@gmail.com'
];

var cert = fs.readFileSync(__dirname + '/../sgc.pem');

let emailFilter = ignoredEmails.map((e,i) => {
    if(i === 0){
        return 'email !="' + e +'"';
    }else{
        return 'AND email !="' + e +'"';
    }
}).join(" ");

let cohortFilterFunc = (cohorts, options) => {
    let cohortsQuery = "";
    if(cohorts !== ""){
        let cohortsArr = cohorts.split(',');
        cohortsQuery = "(";
        if(cohortsArr.length > 0){
            cohortsArr.forEach((cohort, i) => {
                if(i !== cohortsArr.length - 1){
                    cohortsQuery = cohortsQuery + "cohort = '" + cohort + "' " + options + " ";
                }else{
                    cohortsQuery = cohortsQuery + "cohort = '" + cohort + "')";
                }
            });
        }else{
            cohortsQuery = "cohort = '" + cohort + "'";
        }
    }
    return cohortsQuery;
}

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

router.options('/user-query', cors());
router.post('/user-query', authenticateToken, function(req, res, next) {
    var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const email = req.body.email;
    const data_access = req.body.data_access;
    const cohort = req.body.cohort;
    const platform = req.body.platform;
    var sql = `INSERT INTO USER_QUERIES (timestamp, email, cohort, data_access, platform) VALUES (${mysql.escape(timestamp)},${mysql.escape(email)},${mysql.escape(cohort)}, ${mysql.escape(data_access)}, ${mysql.escape(platform)})`;

    con.query(sql, function (err, result) {
        if (err) {
            res.status(400);
            res.json({success: false, error: err.sqlMessage})
        }else{
            res.json({success: true});
        }
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
    const platform = req.body.platform;
    var sql = `INSERT INTO SEARCH_QUERIES (timestamp, gene, panel_source, panel, cohort, data_access, platform) VALUES (${mysql.escape(timestamp)},${mysql.escape(gene)},${mysql.escape(panel_source)}, ${mysql.escape(panel)},${mysql.escape(cohort)}, ${mysql.escape(data_access)}, ${mysql.escape(platform)})`;
    con.query(sql, function (err, result) {
	if (err) {
        res.status(400);
        res.json({success: false, error: err.sqlMessage})
    }else{
        res.json({success: true});
    }
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
        if (err) {
            res.status(400);
            res.json({success: false, error: err.sqlMessage})
        }else{
            res.json({success: true});
        }
      });
})

router.options('/single-panel', cors());
router.post('/single-panel', function(req, res, next) {
        const panel = req.body.panel;
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        const cohorts = req.body.cohorts || "";
        const cohortsOpt = req.body.cohortsOpt || "OR"
        let cohortFilter = cohortFilterFunc(cohorts, cohortsOpt);

        con.query(`SELECT panel_source, COUNT(timestamp) AS count FROM SEARCH_QUERIES WHERE NOT panel_source = '' AND panel = ${mysql.escape(panel)} AND platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} ${cohortFilter !== "" ? "AND " + cohortFilter : ""} GROUP BY panel_source order by count desc;`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/query-type', cors());
router.post('/query-type', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        const cohorts = req.body.cohorts || "";
        const cohortsOpt = req.body.cohortsOpt || "OR"
        let cohortFilter = cohortFilterFunc(cohorts, cohortsOpt);
        con.query(`SELECT data_access, COUNT(timestamp) AS count from USER_QUERIES where platform=${mysql.escape(platform)} AND ${emailFilter} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter} ${cohortFilter !== "" ? "AND " + cohortFilter : ""} group by data_access order by count desc;`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/gene-count', cors());
router.post('/gene-count', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        const limit = req.body.limit || null;
        const cohorts = req.body.cohorts || "";
        const cohortsOpt = req.body.cohortsOpt || "OR"
        let cohortFilter = cohortFilterFunc(cohorts, cohortsOpt);
        let query = `SELECT gene, count(timestamp) AS count FROM SEARCH_QUERIES where platform=${mysql.escape(platform)} AND gene != '' AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} ${cohortFilter !== "" ? "AND " + cohortFilter : ""} GROUP BY gene ORDER BY count DESC ${limit ? 'LIMIT ' + limit : ''};`
        con.query(query, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/daily-login', cors());
router.post('/daily-login', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        con.query(`SELECT date(timestamp) as day, count(timestamp) from USER_LOGIN WHERE platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter} group by day;`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/login-location', cors());
router.post('/login-location', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        con.query(`SELECT ST_Y(geo) as latitude, ST_X(geo) as longitude, email FROM USER_LOGIN WHERE platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter} AND geo IS NOT NULL;`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/top-login', cors());
router.post('/top-login', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        const limit = req.body.limit || null;
        let query = `SELECT email, COUNT(timestamp) as count from USER_LOGIN where platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter} group by email order by count desc LIMIT ${limit};`
        if(limit === null){
            query = `SELECT email, COUNT(timestamp) as count from USER_LOGIN where platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter} group by email order by count desc;`
        }
        con.query(query, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/count-login', cors());
router.post('/count-login', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        let query = `SELECT COUNT(timestamp) as count from USER_LOGIN where platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter};`
        con.query(query, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/email-domain', cors());
router.post('/email-domain', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        con.query(`SELECT substring_index(email, '@', -1) as email_domain, COUNT(timestamp) as count FROM USER_LOGIN where platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter} GROUP BY email_domain ORDER BY count desc;`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/monthly-login', cors());
router.post('/monthly-login', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        const year = req.body.year;
        
        con.query(`SELECT month(timestamp) as month, count(timestamp) AS Year${year} from USER_LOGIN where platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter} group by month(timestamp) order by month asc;`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/cohort-queries', cors());
router.post('/cohort-queries', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        const cohorts = req.body.cohorts || "";
        const cohortsOpt = req.body.cohortsOpt || "OR"
        let cohortFilter = cohortFilterFunc(cohorts, cohortsOpt);
        con.query(`SELECT cohort, COUNT(timestamp) AS count from USER_QUERIES where platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)} AND ${emailFilter} ${cohortFilter !== "" ? "AND " + cohortFilter : ""} group by cohort order by count desc;`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

router.options('/panel-data', cors());
router.post('/panel-data', function(req, res, next) {
        const platform = req.body.platform;
        const start = req.body.start;
        const end = req.body.end;
        const cohorts = req.body.cohorts || "";
        const cohortsOpt = req.body.cohortsOpt || "OR"
        let cohortFilter = cohortFilterFunc(cohorts, cohortsOpt);

        con.query(`SELECT panel, count(timestamp) FROM SEARCH_QUERIES WHERE panel != '' AND platform=${mysql.escape(platform)} AND timestamp BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)}  ${cohortFilter !== "" ? "AND " + cohortFilter : ""} group by panel;`, function (err, result, fields) {
            if (err) {
                res.sendStatus(400)
                return
            };
            res.send(result);
        });
});

module.exports = router;
