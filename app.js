var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password123",
  database: "bamazon"
});
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  connection.end();
});
function start() {
  inquirer.prompt({
    name: "inventory",
    type: "rawlist",
    message: "Would you like to [VIEW] our inventory?",
    choices: ["YES", "NO"]
  });
  then(function(answer) {
    if (answer.inventory.toUpperCase() === "YES") {
      inventory();
    }
  });
}

function inventory() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;

    inquirer.prompt([
      {
        name: "choice",
        type: "rawlist",
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < results.length; i++) {
            choiceArray.push(results[i].item_name);
          }
          return choiceArray;
        }
      }
    ]);
  });
}

inventory();
start();

//THIS WILL DISPLAY THE DB
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  afterConnection();
});

function afterConnection() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log(res);
    connection.end();
  });
}
