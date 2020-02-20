"use strict";

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const DaisySDK = require('@daisypayments/daisy-sdk/private');
const fetch = require('node-fetch');

const app = express()

function modern(callback) {
  return function wrapper(req, res, next) {
    callback(req, res, next).catch(next);
  };
}

app.use(morgan("combined"));
app.use(cors("*"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const SDK_DEV = {
  baseURL: "http://localhost:8000",
};
const daisy = new DaisySDK.ServerPayments({
  manager: {
    identifier: "margarita-otp-rinkeby",
    secretKey: "key-otp-rinkeby",
  },
  override: SDK_DEV,
  withGlobals: { fetch },
});

const APP_URL = "http://localhost:8001";
const orders = [];

app.get("/", (req,res) => res.send("/"));

app.post("/checkout/daisy/", modern(async (req, res) => {
  const cart = req.body["cart"];
  const input = req.body["input"];

  if (cart.length === 0) {
    return res.status(400);
  }

  const invoice = await daisy.createInvoice({
    invoicedName: input["name"],
    invoicedDetail: `Ship to: ${[input["street"], input["city"], input["state"], input["postal_code"]].filter(Boolean).join(", ")}`,
    redirectURL: `${APP_URL}/success/`,
    cancelURL: `${APP_URL}/checkout/`,
    items: [
      ...cart.map(item => {
        return {
          sku: item["id"],
          description: item["name"],
          quantity: 1,
          amount: `${item["price"]}${"0".repeat(18 - 2)}`,
        }
      }),
      {
        description: "Free shipping",
        type: "SHIPPING",
        quantity: 1,
        amount: 0,
      },
      {
        description: "Tax",
        type: "TAX",
        quantity: 1,
        amount: `${19}${"0".repeat(18 - 2)}`, // TODO: calculate?
      },
    ],
  });

  orders.push(invoice);

  return res.status(201).json(invoice);
}));

app.listen(process.env.PORT || 3333, err => {
  if (err) {
    console.error(err);
  }
});
