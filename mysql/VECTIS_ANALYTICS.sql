CREATE DATABASE VECTIS_ANALYTICS;

USE VECTIS_ANALYTICS;

CREATE TABLE USER_QUERIES ( 
	timestamp DATETIME, 
    email VARCHAR(255), 
    cohort VARCHAR(255),
	data_access varchar(255)
);

CREATE TABLE SEARCH_QUERIES (
	timestamp datetime NOT NULL,
	gene varchar(255),
	panel_source varchar(255),
	panel varchar(255),
	cohort varchar(255) NOT NULL,
	data_access varchar(255) NOT NULL
);

CREATE TABLE USER_LOGIN (
	timestamp datetime NOT NULL,
    email VARCHAR(255), 
	platform varchar(255) NOT NULL,
	signup boolean,
	geo GEOMETRY
);

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;
