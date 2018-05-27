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

connection.connect(function(err){
    if(err) throw err;
    start();

});

function start(){
    console.log("\n -------------------------------------------------------------------- \n");
    Inquirer.prompt(
        {
            type: "list",
            name: "task",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Products"]
        }
    ).then(function(userInput){
        console.log(userInput.task);

        quitApp();
    });
}


function quitApp(){
    console.log("\n ==================================================================== \n");
    console.log("Thank you for using Bamazon Manager for all your managerial needs!");
    connection.end();
}

