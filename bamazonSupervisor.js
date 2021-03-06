require("dotenv").config();

var Mysql = require("mysql");
var Inquirer = require("inquirer");
var Table = require("cli-table2");
var Colors = require("colors");
var keys = require("./keys.js");

var connection = Mysql.createConnection({
    host: keys.mysqlKey["mysql_DB_host"],
    port: keys.mysqlKey["mysql_DB_port"],
    user: keys.mysqlKey["mysql_DB_user"],
    password: keys.mysqlKey["mysql_DB_password"],
    database: "bamazon_DB"

});

//Using Color's setThemes to create custom themes.
Colors.setTheme({
    sqlHeaders: ['yellow', 'underline']
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
            choices: ["View Product Sales by Department", "Create New Department", "Delete a Department", "Exit Bamazon Supervisor"]
        }
    ).then(function (userInput) {
        switch (userInput.task) {
            case "View Product Sales by Department":
                viewSalesByDept();
                break;

            case "Create New Department":
                addNewDepartment();
                break;

            case "Delete a Department":
                deleteDepartment();
                break;

            case "Exit Bamazon Supervisor":
                quitApp();
                break;
        };

    });
}

function viewSalesByDept() {

    // connection.query("SELECT departments.department_id AS 'Dept. ID', departments.department_name AS 'Dept. Name', departments.over_head_costs AS 'Dept. Cost', COALESCE(sum(inventory.product_sales), 0) AS 'Product Sales', (COALESCE(sum(inventory.product_sales), 0) - departments.over_head_costs) AS 'Totals' FROM departments LEFT JOIN inventory ON departments.department_name=inventory.department_name GROUP BY departments.department_id ORDER BY departments.department_name", function (err, res) {

    //Query same as above for SQL, below is for visual reading.
    connection.query("SELECT departments.department_id AS 'Dept. ID'," +
        "departments.department_name AS 'Dept. Name'," +
        " departments.over_head_costs AS 'Dept. Cost'," +
        " COALESCE(sum(inventory.product_sales), 0) AS 'Product Sales'," +
        " (COALESCE(sum(inventory.product_sales), 0) - departments.over_head_costs) AS 'Totals'" +
        " FROM departments" +
        " LEFT JOIN inventory ON departments.department_name=inventory.department_name" +
        " GROUP BY departments.department_id" +
        " ORDER BY departments.department_name", function (err, res) {

            if (err) throw err;

            if (res.length !== 0) {
                showSQLTable(res);
                start();
            } else {
                console.log("Sorry no items available.");
                start();
            };
        });
};



function addNewDepartment() {
    console.log("\n -------------------------------------------------------------------- \n");
    Inquirer.prompt(
        {
            type: "input",
            name: "name",
            message: "What new department would you like to add? [Quit with Q]"
        }
    ).then(function (userInput) {
        if (userInput["name"].toUpperCase() !== "Q") {
            var deptInfo = {};
            deptInfo["department_name"] = userInput["name"];
            requestDeptCosts(deptInfo);

        } else {
            quitApp();
        }

    });

    function requestDeptCosts(deptInfo) {
        console.log("\n -------------------------------------------------------------------- \n");
        Inquirer.prompt(
            {
                type: "input",
                name: "cost",
                message: "What is the over head costs of this department? [Quit with Q]",
                validate: function (input) {
                    var check = checkIfNumbNegative(input);

                    //Checking if there's more than 2 decimal points.
                    var inputLength = ((parseFloat(input)).toString().length);
                    var inputIntLength = ((parseInt(input)).toString().length)
                    if ((inputLength - inputIntLength) > 2) {
                        check = false;
                        console.log("\n Error: Too many decmial points, max of 2.");
                    };
                    return check;
                }
            }
        ).then(function (userInput) {
            if (userInput["cost"].toUpperCase() !== "Q") {
                deptInfo["over_head_costs"] = parseFloat(userInput["cost"]);

                addToDB(deptInfo);

            } else {
                quitApp();
            };
        });
    };

    function addToDB(deptInfo) {
        console.log("\n -------------------------------------------------------------------- \n");
        connection.query("INSERT INTO departments SET ?",
            {
                department_name: deptInfo["department_name"],
                over_head_costs: deptInfo["over_head_costs"]

            }, function (err, res) {
                if (err) throw err;

                connection.query("SELECT * FROM departments WHERE ?", { department_id: res.insertId }, function (err, resQuery) {
                    if (err) throw err;
                    showSQLTable(resQuery);

                    console.log("\n " + deptInfo["department_name"] + " has been added to departments in Bamazon");

                    start();
                })
            }
        );
    };

};



function deleteDepartment() {

    console.log("\n -------------------------------------------------------------------- \n");
    connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err;
        // console.log(res);
        var listOfId = [];
        for (var i = 0; i < res.length; i++) {
            listOfId.push(res[i]["department_id"]);
        };

        if (res.length !== 0) {
            showSQLTable(res);

            console.log("\n -------------------------------------------------------------------- \n");
            Inquirer.prompt(
                {
                    type: "input",
                    name: "id",
                    message: "What is the ID of the department you would like to delete? [Quit with Q]",
                    validate: function (input) {
                        if (input.toUpperCase() === "Q") {
                            return true;
                        } else if (isNaN(input)) {
                            console.log("\n " + input + " is not a number, please input an id number.")
                            return false;
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
                    deleteID(inputID);

                } else {
                    quitApp();
                }
            });
        } else {
            console.log("Sorry no items available.");
            quitApp();
        };
    });

    function deleteID(inputID) {

        connection.query("SELECT * FROM departments WHERE ?", { department_id: inputID }, function (err, res) {
            if (err) throw err;


            connection.query("DELETE FROM departments WHERE ?", { department_id: inputID }, function (err, resDelete) {
                if (err) throw err;

                console.log("\n -------------------------------------------------------------------- \n");
                console.log("You have successfully deleted the following: ");
                showSQLTable(res);

                start();
            });

        });
    }
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

function moreTasks() {
    console.log("\n -------------------------------------------------------------------- \n");
    Inquirer.prompt(
        {
            type: "confirm",
            name: "confirm",
            message: "Would you like to do more tasks?"
        }
    ).then(function (userInput) {
        if (userInput["confirm"] === true) {
            start();
        } else {
            quitApp();
        };
    });
};



function quitApp() {
    console.log("\n ==================================================================== \n");
    console.log("Thank you for using Bamazon Supervisor for all your managerial needs!");
    connection.end();
};


function showSQLTable(res) {

    var keys = Object.keys(res[0]);
    var coloredKeys = [];
    for (var i = 0; i < keys.length; i++) {
        // coloredKeys.push(Colors.yellow(keys[i]));
        coloredKeys.push((keys[i]).sqlHeaders);
    }

    var table = new Table({
        head: coloredKeys
    });

    for (let i = 0; i < res.length; i++) {
        var rowData = [];
        for (var objKeys in res[i]) {
            rowData.push(res[i][objKeys]);

        }
        table.push(rowData);
    };
    console.log(table.toString());
};
