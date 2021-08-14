const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

//Settings
app.set("port", process.env.PORT || 3000);

//Middleware
const corsOptions = { origin: "*" };
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// SDK de Mercado Pago
const mercadopago = require("mercadopago");

// Agrega credenciales
mercadopago.configure({
  access_token:
    "APP_USR-6410586645251716-081310-931fec56178dcba5529ae799e8a2be91-807106888",
});

//routes
app.post("/api/checkout", (req, res) => {
  console.log(req.body);
  let preference = {
    items: [],
  };

  for (let i = 0; i < req.body.items.length; i++) {
    let item = {
      title: req.body.items[i].product.name,
      unit_price: req.body.items[i].product.price,
      quantity: req.body.items[i].amount,
    };
    preference.items.push(item);
  }

  console.log(preference);

  return mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.set("Content-Type", "text/html");
      res.send(JSON.stringify(response.body.init_point));
    })
    .catch(function (error) {
      console.log(error);
    });
});

//server
app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
