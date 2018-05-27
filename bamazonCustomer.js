require("dotenv").config();

var Mysql = require("mysql");
var Inquirer = require("inquirer");
var Table = require("cli-table");

var keys = require("./keys.js")

var connection = Mysql.createConnection({
    // host: "localhost",
    // port: 3306,
    // user: "root",
    // password: keys.mysqlKey["mysql_DB_password"],
    // database: "bamazon_DB"
    host: keys.mysqlKey["mysql_DB_host"],
    port: keys.mysqlKey["mysql_DB_port"],
    user: keys.mysqlKey["mysql_DB_user"],
    password: keys.mysqlKey["mysql_DB_password"],
    database: "bamazon_DB"
})

connection.connect(function (err) {
    if (err) throw err;
    start();
    // connection.end();
})

function start() {
    console.log("\n -------------------------------------------------------------------- \n");
    connection.query("SELECT * FROM inventory", function (err, res) {
        if (err) throw err;
        // console.log(res);
        var listOfId = [];
        for (var i = 0; i < res.length; i++) {
            listOfId.push(res[i]["item_id"]);
        }

        showSQLTable(res);
        console.log("\n -------------------------------------------------------------------- \n");
        Inquirer.prompt(
            {
                type: "input",
                name: "id",
                message: "What is the ID of the item you would like to purhase? [Quit with Q]",
                validate: function (input) {
                    if (input.toUpperCase() === "Q") {
                        return true;
                    }

                    if (isNaN(input)) {
                        console.log("\n " + input + " is not a number, please input an id number.")
                        return !isNaN(input);
                    }

                    var check = checkIdInList(parseInt(input), listOfId);
                    if (check === false) {
                        console.log("\n " + input + " is not in the current list of id numbers.")
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        ).then(function (userInput) {
            if (userInput["id"].toUpperCase() !== "Q") {
                var inputID = parseInt(userInput["id"]);
                quantityToPurchase(inputID);
            } else {
                quitApp();
            }
        });

    });

}

function quantityToPurchase(itemId) {

    console.log("\n -------------------------------------------------------------------- \n");
    connection.query("SELECT * FROM inventory WHERE ?", { item_id: itemId }, function (err, res) {
        if (err) throw err;
        // console.log(res);
        showSQLTable(res);
        var itemName = res[0]["product_name"];
        var currQty = res[0]["stock_quantity"];
        // console.log(currQty);

        console.log("\n -------------------------------------------------------------------- \n");
        Inquirer.prompt(
            {
                type: "input",
                name: "quantity",
                message: "How many would you like to purchase? [Quit with Q]",
                validate: function (input) {
                    if (input.toUpperCase() === "Q") {
                        return true;
                    }

                    if (isNaN(input)) {
                        console.log("\n " + input + " is not a number, please input a number.")
                        return !isNaN(input);
                    }

                    if (parseInt(input) < 0) {
                        console.log("\n Please input a positive number.");
                        return false;
                    }

                    if (currQty < parseInt(input)) {
                        console.log("\n Not enough in stock, please purchase at most " + currQty + ".");
                        return false;
                    } else {
                        return true;
                    }
                }
            },
        ).then(function (userInput) {
            if (userInput["quantity"].toUpperCase() !== "Q") {
                var inputQty = parseInt(userInput["quantity"]);
                connection.query("UPDATE inventory SET ? WHERE ?",
                    [
                        {
                            stock_quantity: currQty - inputQty
                        },
                        {
                            item_id: itemId
                        }
                    ]
                )
                console.log("You have successfully purchased " + inputQty + " of " + itemName + ".");
                purchaseMore();
            } else {
                quitApp();
            }
        });
    });
};

function purchaseMore() {
    console.log("\n -------------------------------------------------------------------- \n");
    Inquirer.prompt(
        {
            type: "confirm",
            name: "confirm",
            message: "Would you like to buy more items?"
        }
    ).then(function (userInput) {
        if (userInput["confirm"] === true) {
            start();
        } else {
            quitApp();
        }
    })

}


function quitApp() {
    console.log("\n ==================================================================== \n");
    console.log("Thank you for using Bamazon!");
    connection.end();
};

function checkIdInList(input, listOfId) {
    var checkID = false;
    for (var j = 0; j < listOfId.length; j++) {
        if (input === listOfId[j]) {
            checkID = true;
        }
    }
    return checkID;
}

//creating a table using npm package cli-table
function showSQLTable(res) {
    //turns the first object's keys into an array called keys.
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

