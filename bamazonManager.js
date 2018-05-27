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

function start() {
    console.log("\n -------------------------------------------------------------------- \n");
    Inquirer.prompt(
        {
            type: "list",
            name: "task",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Products", "Exit Bamazon Manager"]
        }
    ).then(function (userInput) {
        console.log(userInput.task);
        switch (userInput.task) {
            case "View Products for Sale":
                // console.log("For Sale");
                viewProducts();
                break;
            case "View Low Inventory":
                // console.log("Items in inventory");
                viewLowProducts();
                break;
            case "Add to Inventory":
                // console.log("Adding inventory");
                break;
            case "Add New Products":
                // console.log("Adding a new product");
                break;
            case "Exit Bamazon Manager":
                quitApp();
                break;
        };

    });
}

function viewProducts() {
    connection.query("SELECT * FROM inventory", function (err, res) {
        console.log(res);
        if (res.length !== 0) {
            showSQLTable(res);
            start();
        } else {
            console.log("Sorry no items available.");
            start();
        }
    })
}


function viewLowProducts() {
    connection.query("SELECT * FROM inventory WHERE stock_quantity <= 3", function (err, res) {
        console.log(res);
        if (res.length !== 0) {
            showSQLTable(res);
            start();
        } else {
            console.log("Sorry no items available.");
            start();
        }
    })
}

function quitApp() {
    console.log("\n ==================================================================== \n");
    console.log("Thank you for using Bamazon Manager for all your managerial needs!");
    connection.end();
}

function showSQLTable(res) {
    var keys = Object.keys(res[0]);
    var table = new Table({
        head: keys
    });

    for (let i = 0; i < res.length; i++) {
        var rowData = [];
        for (var objKeys in res[i]) {
            rowData.push(res[i][objKeys]);
        }
        table.push(rowData);
    }
    console.log(table.toString());
}