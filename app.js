// require mysql and inquirer
var mysql = require("mysql");
var inquirer = require("inquirer");
//Creates a basic table, it's awesome
var cTable = require("console.table");
// create connection to the database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password123",
  database: "Bamazon"
});

function start() {
  //   prints the items for sale and their details. I had a large block of code only to find out about node tables-much easier than writing to consolelog the database.
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    console.log("WELCOME TO BAMAZON");
    console.log(
      "----------------------------------------------------------------------------------------------------"
    );
    console.table(res);

    console.log(" ");
    //Inquirer with prompts and lets user to make purchases
    inquirer
      .prompt([
        {
          type: "input",
          name: "id",
          message: "What is the ID of the product you would like to purchase?",
          validate: function(value) {
            if (
              isNaN(value) == false &&
              parseInt(value) <= res.length &&
              parseInt(value) > 0
            ) {
              return true;
            } else {
              return false;
            }
          }
        },
        {
          //The users input will in realtime affect the amount of stock avaible in the SQL DB
          type: "input",
          name: "qty",
          message: "How much would you like to purchase?",
          validate: function(value) {
            if (isNaN(value)) {
              return false;
            } else {
              return true;
            }
          }
        }
      ])
      .then(function(ans) {
        var whatToBuy = ans.id - 1;
        var howMuchToBuy = parseInt(ans.qty);
        var grandTotal = parseFloat(
          (res[whatToBuy].price * howMuchToBuy).toFixed(2)
        );

        //checks if quantity is sufficient
        if (res[whatToBuy].stock_quantity > howMuchToBuy) {
          var stock = res[whatToBuy].stock_quantity;
          //after purchase, updates quantity in the table
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: res[whatToBuy].stock_quantity - howMuchToBuy
              },
              { ID: ans.id }
            ],
            function(err, result) {
              if (err) throw err;
              console.log(
                "BOOM! Your total is $" +
                  grandTotal.toFixed(2) +
                  ". Your item(s) will be shipped to you in 3-5 business days."
              );
            }
          );

          reprompt();

          connection.query("SELECT * FROM products", function(err, deptRes) {
            if (err) throw err;
            var index;
            for (var i = 0; i < res.length; i++) {
              if (res[i].department === res[whatToBuy].department) {
                index = i;
              }
            }
          });
          //if insuffiecient amount of stock then this will console log, then reprompts function for user
        } else console.log("SORRY WE ARE OUT OF STOCK", reprompt());
      });
  });
}
//lets user buy products again
function reprompt() {
  inquirer
    .prompt([
      {
        type: "confirm",
        name: "reply",
        message: "Would you like to purchase another item?"
      }
    ])
    .then(function(ans) {
      if (ans.reply) {
        start();
      } else {
        console.log("See ya soon!");
      }
    });
}

start();
