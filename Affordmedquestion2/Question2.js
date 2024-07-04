const express = require('express');
const axios = require('axios');

const app = express();

// Configuration
const COMPANIES = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const CATEGORIES = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth",
                    "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];
const TEST_SERVER_URL = "http://20.244.56.144/test/companies/{}/categories/{}/products";
const TIMEOUT = 500; // milliseconds
const DEFAULT_PRODUCTS_PER_PAGE = 10;

// Global variables
let productIds = {};

app.get('/categories/:categoryname/products', async (req, res) => {
  const n = parseInt(req.query.n) || DEFAULT_PRODUCTS_PER_PAGE;
  const page = parseInt(req.query.page) || 1;
  const sort = req.query.sort;
  const order = req.query.order || 'asc';
  const minPrice = parseFloat(req.query.minPrice);
  const maxPrice = parseFloat(req.query.maxPrice);

  let products;
  if (n > DEFAULT_PRODUCTS_PER_PAGE) {
    // Enforce pagination
    const offset = (page - 1) * n;
    products = await getProductsFromTestServer(req.params.categoryname, n, offset, sort, order, minPrice, maxPrice);
  } else {
    products = await getProductsFromTestServer(req.params.categoryname, n, 0, sort, order, minPrice, maxPrice);
  }

  // Generate unique IDs for the products
  for (const product of products) {
    const productId = generateProductId(req.params.categoryname, product);
    product.id = productId;
    productIds[productId] = product;
  }

  res.json({ products });
});

app.get('/categories/:categoryname/products/:productid', (req, res) => {
  if (req.params.productid in productIds) {
    res.json({ product: productIds[req.params.productid] });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

async function getProductsFromTestServer(categoryname, n, offset, sort, order, minPrice, maxPrice) {
  let products = [];
  for (const company of COMPANIES) {
    const url = TEST_SERVER_URL.replace('{}', company).replace('{}', categoryname);
    const params = {
      top: n,
      minPrice,
      maxPrice,
      offset
    };
    try {
      const response = await axios.get(url, { params, timeout: TIMEOUT });
      products = products.concat(response.data.products);
    } catch (error) {
      console.error(error);
      continue;
    }
  }

  if (sort) {
    products.sort((a, b) => {
      if (a[sort] < b[sort]) return order === 'asc' ? -1 : 1;
      if (a[sort] > b[sort]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return products.slice(0, n);
}

function generateProductId(categoryname, product) {
  const productId = `${categoryname}_${Object.keys(productIds).length + 1}`;
  return productId;
}

const PORT = process.env.PORT || 9876;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

