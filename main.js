//importing npm's
var mysql = require("mysql");
var inquirer = require("inquirer");

// making sure that input is numbers only
function correctInput(choice) {
    
    //variable declaration
	var int = Number.isInteger(parseFloat(choice));
	var sign = Math.sign(choice);

	if (int&& (sign === 1)) {
		return true;
	} else {
		return "For input please enter item ID number, with out decimals.";
	}
}

//connection trought mamp
//taking credentials
var connection = mysql.createConnection({
    host: "localhost",

    // Connection port
    port: 8889,

    //Your username
    user: "root",

    //Your password
    password: "root",
    database: "bamazon_db"
});
//running funcion for connecting or error prompt
connection.connect(function (err) {
    if (err) {
        console.log("connected as id " + connection.threadId);
    } else {
        //home page a list to choose from or quit.
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Please choose from folowing options",
                    choices: ["List of Products", "Quit Game"],
                    name: "event"
                }
            ])
            //function for sorting answer
            .then(function (response) {
                //listing products
                if (response.event === "List of Products") {
                    listOfProducts();

                    //quit game 
                } else if (response.event === "Quit Game") {
                    console.log("Thank you for considering us. Have a wonderfull day!")
                    connection.end();
                }

            });
    }
});

//------functions for user inputs------
//displayng list of products
function listOfProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) {
            console.log("The Error is:" + err);
        } else
            for (let i = 0; i < res.length; i++) {
                console.log("Product ID:" + res[i].id);
                console.log("Product Name:" + res[i].product_name);
                console.log("Product Description:" + res[i].department_name);
                console.log("Quantity:" + res[i].stock_quantity);
                console.log("Price:" + res[i].price + "$");
                console.log("")
            }
        //asking to buy
        inquirer
            .prompt([
                //user a list for imput
                {
                    type: "input",
                    name: "id",
                    message: "Please use the product ID to complete purchase. What Product Would you Like to buy:",
                    validate: correctInput, //calling input function for validation
                    filter: Number //filtering to number(integer)
                },
                {
                    type: "input",
                    name: "quantity",
                    message: "How Many Products Would you Like to by:",
                    validate: correctInput, //calling input function for validation
                    filter: Number //filtering to number(integer)
                }
            ])
            //function for sorting answer
            .then(function (input) {
                
                //variable declaration
                var item = input.id;
                var quantity = input.quantity;
                //console.log(item);
                //console.log(quantity);

                //query for fetching product after choice
                connection.query("SELECT * FROM products WHERE ?",
                    { id: item }, function (err, res) {
                        if (err) throw err;
                        if (res.length === 0) {
                            console.log("Please select valid option.");
                            listOfProducts();
                        } else {
                            //saving product quantity for comparing
                            var productQuantity = res[0];

                            //console.log('productData = ' + JSON.stringify(productQuantity));
                            //console.log('productData.stock_quantity = ' + productQuantity.stock_quantity);

                            //if the product is in stock
                            if (quantity <= productQuantity.stock_quantity) {
                                //for informational purpose
                                console.log("Your product is in stock, and we are placing your order!");

                                //updating stock query
                                var updateQuery = "UPDATE products SET stock_quantity = " +
                                    (productQuantity.stock_quantity - quantity) + " WHERE id = " + item;
                                    //console.log("updateQuery = " + updateQuery);

                                //updating invetory
                                connection.query(updateQuery, function (err, res) {
                                    if (err) throw err;

                                    console.log("Your order nas been processed. Your total is " + productQuantity.price * quantity + " $");
                                    console.log("Thank you for shoppig with us!")

                                    connection.end();
                                });
                            } else {
                                console.log("Unfortunately, The quantity for this item is lower than expected.");
                                console.log("Please modify your order. We are sorry for inconvenience!");
                                console.log("Thanks for understanding!");

                                //back to list of products
                                listOfProducts();
                            }
                        }
                    });

            });
    });
}
