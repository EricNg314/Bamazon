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
    connection.query("SELECT * FROM inventory", function (err, res) {
        if (err) throw err;
        // console.log(res);
        var listOfId = [];
        for (var i = 0; i < res.length; i++) {
            listOfId.push(res[i]["item_id"]);
        }

        showSQLTable(res);

        Inquirer.prompt(
            {
                type: "input",
                name: "id",
                message: "What is the ID of the item you would like to purhase?",
                validate: function (input) {
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
            console.log(userInput["id"]);
            var inputID = parseInt(userInput["id"]);
            quantityToPurchase(inputID);
        });

    });

}

function quantityToPurchase(itemId) {

    connection.query("SELECT * FROM inventory WHERE ?", { item_id: itemId }, function (err, res) {
        if (err) throw err;
        // console.log(res);
        showSQLTable(res);

        var currQty = res[0]["stock_quantity"];
        // console.log(currQty);

        Inquirer.prompt(
            {
                type: "input",
                name: "quantity",
                message: "How many would you like to purchase?",
                validate: function (input) {
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

            var inputQuantity = parseInt(userInput["quantity"]);

            connection.query("UPDATE inventory SET ? WHERE ?",
                [
                    {
                        stock_quantity: currQty - inputQuantity
                    },
                    {
                        item_id: itemId
                    }
                ]
            )

            connection.query("SELECT * FROM inventory", function (err, res) {
                if (err) throw err;
                // console.log(res);
                showSQLTable(res);
            });
        });
    });
};


// function quitApp() {
//     Inquirer.prompt(
//         {
//             type: "confirm",
//             name: "exit",
//             message: "Would you like to exit?"
//         },
//     ).then(function (userInput) {
//         console.log(userInput.exit);
//     });
// };

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

