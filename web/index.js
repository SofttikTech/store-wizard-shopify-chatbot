// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import mongoose from "mongoose";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});


mongoose
  .connect("mongodb+srv://mmousa:gained-tragedy@autoringai.rddmd.mongodb.net/dev-auto-ring-ai", {
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error.message);
  });


// app.get("/api/customers", async (_req, res) => {
//   try {
//     // Access the current session
//     const session = res.locals.shopify.session;

//     // Get store name from session  
//     const storeName = session.shop;

//     // Create a Shopify GraphQL client
//     const client = new shopify.api.clients.Graphql({ session });

//     // Fetch customers from Shopify
//     const customerData = await client.query({
//       data: `{
//         customers(first: 1) {
//           edges {
//             node {
//               id
//               firstName
//               lastName
//               email
//             }
//           }
//         }
//       }`,
//     });

//     const customers = customerData.body.data.customers.edges.map((edge) => ({
//       id: edge.node.id,
//       firstName: edge.node.firstName,
//       lastName: edge.node.lastName,
//       email: edge.node.email,
//     }));

//     res.status(200).send({ storeName, customers });
//   } catch (error) {
//     console.error("Error fetching customers:", error.message);
//     res.status(500).send({ error: "Failed to fetch customer data." });
//   }
// });


app.get("/api/store/info", async (req, res) => {
  let storeInfo = await shopify.api.rest.Shop.all({
    // session: res.locals.shopify.session,
    session: session,
  });
  res.send(200).send(storeInfo)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
