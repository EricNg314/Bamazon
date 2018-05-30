require("dotenv").config();

var Mysql = require("mysql");
var Inquirer = require("inquirer");
var Table = require("cli-table2");

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
});

connection.connect(function (err) {
    if (err) throw err;
    start();
    // connection.end();
});

function start() {
    console.log("\n -------------------------------------------------------------------- \n");
    connection.query("SELECT * FROM inventory", function (err, res) {
        if (err) throw err;
        // console.log(res);
        var listOfId = [];
        for (var i = 0; i < res.length; i++) {
            listOfId.push(res[i]["item_id"]);
        };

        //Prompts only if items are available, else app exits.
        if (res.length !== 0) {
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
                        } else if (isNaN(input)) {
                            console.log("\n " + input + " is not a number, please input an id number.")
                            return !isNaN(input);
                        }

                        var check = checkIdInList(parseFloat(input), listOfId);
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
        } else {
            console.log("Sorry no items available.");
            quitApp();
        };
    });

};

function quantityToPurchase(itemId) {

    console.log("\n -------------------------------------------------------------------- \n");
    connection.query("SELECT * FROM inventory WHERE ?", { item_id: itemId }, function (err, res) {
        if (err) throw err;
        // console.log(res);
        showSQLTable(res);
        var item = res[0];

        console.log("\n -------------------------------------------------------------------- \n");
        Inquirer.prompt(
            {
                type: "input",
                name: "quantity",
                message: "How many would you like to purchase? [Quit with Q]",
                validate: function (input) {
                    var check = checkIfNumbNegative(input);
                    if(input.toUpperCase() === "Q"){
                        return true;
                    }
                    if (item["stock_quantity"] < parseInt(input)) {
                        console.log("\n Error: Not enough in stock, please purchase at most " + item["stock_quantity"] + ".");
                        return false;

                    }
                    if (!(Number.isInteger(parseFloat(input)))) {
                        console.log("\n Error: " + input + " is NOT an integer");
                        return false;
                    }
                    return check;

                }
            },
        ).then(function (userInput) {
            if (userInput["quantity"].toUpperCase() !== "Q") {
                var inputQty = parseInt(userInput["quantity"]);
                purchaseQty(item, inputQty);
            } else {
                quitApp();
            };
        });
    });

    function purchaseQty(item, inputQty) {

        console.log("\n -------------------------------------------------------------------- \n");
        connection.query("UPDATE inventory SET ? WHERE ?",
            [
                {
                    product_sales: item["product_sales"] + (inputQty * item["price"]),
                    stock_quantity: item["stock_quantity"] - inputQty
                },
                {
                    item_id: item["item_id"]
                }
            ]
        )

        var totalCost = item["price"] * inputQty;

        console.log("You have successfully purchased " + inputQty + " of " + item["product_name"] + ".");
        console.log("Your total cost was $" + totalCost + ".");
        purchaseMore();
    }

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
            };
        });
    };
};



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
    };
    return checkID;
};

function checkIfNumbNegative(input) {
    if (input.toUpperCase() === "Q") {
        return true;
    } else if (input < 0) {
        console.log("\n Error: Unable to process due to negative value.");
        return false;
    } else if (isNaN(input)) {
        console.log("\n Error: " + input + " is not a number, please enter a number.");
        return false;
    } else {
        return true;
    }
}

//creating a table using npm package cli-table
function showSQLTable(res) {
    //turns the first object's keys into an array called keys.
    var keys = Object.keys(res[0]);

    //Removing key so customer does not see sales.
    var keysCleaned = [];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== "product_sales") {
            keysCleaned.push(keys[i]);
        };
    }

    var table = new Table({
        head: keysCleaned
    });

    for (let i = 0; i < res.length; i++) {
        var rowData = [];
        for (var objKeys in res[i]) {
            if (objKeys !== "product_sales") {
                rowData.push(res[i][objKeys]);
            };
        };
        table.push(rowData);
    };

    console.log(table.toString());
};

