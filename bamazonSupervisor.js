require("dotenv").config();

var Mysql = require("mysql");
var Inquirer = require("inquirer");
var Table = require("cli-table");

var keys = require("./keys.js");

var connection = Mysql.createConnection({
    host: keys.mysqlKey["mysql_DB_host"],
    port: keys.mysqlKey["mysql_DB_port"],
    user: keys.mysqlKey["mysql_DB_user"],
    password: keys.mysqlKey["mysql_DB_password"],
    database: "bamazon_DB"

});

connection.connect(function (err) {
    if (err) throw err;
    start();

});