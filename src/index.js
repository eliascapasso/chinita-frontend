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
    back_urls: {
      success: "https://tienda-online-base.web.app:4200/order-complete/complete",
      failure: "https://tienda-online-base.web.app:4200/inicio",
      pending: "https://tienda-online-base.web.app:4200/order-complete/pending",
    },
    auto_return: "approved",
    payer: {
      name: req.body.customer.firstname,
      surname: req.body.customer.lasttname,
      email: req.body.customer.email,
      address: {
        street_name:
          req.body.customer.adress1 + " " + req.body.customer.adress2,
      },
    },
    shipments: {
      cost: parse(req.body.shippingCost),
      mode: "not_specified",
    },
    statement_descriptor: "COMPRA_TIENDA_VIRTUAL",
    items: [],
  };

  for (let i = 0; i < req.body.items.length; i++) {
    let item = {
      id: req.body.items[i].product.id,
      title: req.body.items[i].product.name,
      description: req.body.items[i].product.description,
      unit_price: req.body.items[i].product.price,
      quantity: req.body.items[i].amount,
      currency_id: "ARS",
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

function parse(x) {
  let parsed = parseInt(x);
  if (isNaN(parsed)) {
    return 0;
  }
  return parsed;
}
