let mappedProducts = [];
let startIndex = 0;
const batchSize = 20;
let allProducts = [];
let filteredProducts = [];
let stockData = [];
let loading = false;

async function loadPriceList() {
  const [productData, stockData, flagData] = await Promise.all([
    fetch("products.json").then((res) => res.json()),
    fetch("stock.json").then((res) => res.json()),
    fetch("flags.json").then((res) => res.json()),
  ]);

  mappedProducts = productData.map((product) => {
    const stockInfo =
      stockData.find((stock) => stock.SKU === product.SKU) || {};
    const originISO = flagData.find(
      (flag) => flag.origin === product["Origin of product"]
    )?.iso;

    const currencyMap = {
      EUR: "€",
      USD: "$",
    };

    return {
      sku: product["SKU"],
      name: product["Name"],
      stock: stockInfo["Qty Available"],
      isInStock: stockInfo["Qty Available"] > 0,
      originISO,
      category: product["Product Category"],
      subcategory: product["Subcategory"],
      currency: currencyMap[product["Currency (Code)"]] || "",
      packaging: product["Colli"],
      volume: product["M3"],
      weight: product["Weight_KG"],
      pricePerUnit: Number(product["Price unit price"]),
      pricePerOrder: Number(product["Order unit price"]),
      priceDiscount: product["Discount %"],
      priceUnit: product["Price Unit"],
      orderUnit: product["order unit"],
      orderDiscount: product["Colli discount"],
      quantityPerOrder: product["Colli per pallet"],
    };
  });

  renderProducts(mappedProducts);

  document.querySelector(".search-icon").addEventListener("click", (e) => {
    e.preventDefault();
    const query = document.getElementById("search-input").value.toLowerCase();
    const filtered = mappedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
    renderProducts(filtered, true);
  });

  document.querySelectorAll(".category-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      const selectedCategory = e.target.textContent.trim();
      filteredProducts = mappedProducts.filter(
        (product) => product.category === selectedCategory
      );
      renderProducts(filteredProducts);
    });
  });
  document
    .querySelector(".dropdown-menu div")
    .addEventListener("click", function () {
      const filtered = mappedProducts.filter((product) => product.isInStock);

      renderProducts(filtered, true);
      document.querySelector(".dropdown-menu").classList.remove("show");
    });
}

function renderProducts(products, reset = true) {
  const table = document.querySelector("#products-table tbody");

  if (reset) {
    table.innerHTML = "";
    startIndex = 0;
    filteredProducts = products;
  }

  const nextBatch = filteredProducts.slice(startIndex, startIndex + batchSize);
  const rows = nextBatch.map(generateProductRow).join("");
  table.insertAdjacentHTML("beforeend", rows);

  startIndex += batchSize;
  loading = false;
}

function handleScroll() {
  const table = document.querySelector(".price-list");
  if (
    table.scrollTop + table.clientHeight >= table.scrollHeight - 100 &&
    !loading &&
    startIndex < filteredProducts.length
  ) {
    loading = true;
    renderProducts(filteredProducts, false);
  }
}

function generateProductRow(product) {
  const stockDotClass = product.isInStock
    ? product.stock < 1000
      ? "orange-dot"
      : "green-dot"
    : "red-dot";

  const flagImg = product.originISO
    ? `<img
        src="https://flagcdn.com/w20/${product.originISO}.png"
        srcset="https://flagcdn.com/w40/${product.originISO}.png 2x"
        width="30"
        height="20"
        alt="${product.originISO} flag"
        title="${product.originISO.toUpperCase()}"
      />`
    : "";

  const discountPercent = Number(product.priceDiscount);
  const hasDiscount = discountPercent > 0;

  const discountedOrderPrice = hasDiscount
    ? product.pricePerOrder * (1 - discountPercent / 100)
    : product.pricePerOrder;

  const discountedUnitPrice = hasDiscount
    ? product.pricePerUnit * (1 - discountPercent / 100)
    : product.pricePerUnit;
  return `
<tr>
  <td width= 169px><strong>${product.name}</strong><br />${product.sku}</td>
  <td class="text-center" width= 120px>
     ${
       hasDiscount
         ? `<span class="discount-new">${
             product.currency
           } ${discountedOrderPrice.toFixed(2)}</span><br>
         <span class="discount-old">${
           product.currency
         } ${product.pricePerOrder.toFixed(2)}</span> ${product.orderUnit}`
         : `${product.currency} ${product.pricePerOrder.toFixed(2)}<br>${
             product.orderUnit
           }`
     }
  </td>
  <td class="text-center">
    <div class="${stockDotClass}"></div>
  </td>
  <td class="text-center">${flagImg}</td>
  <td class="text-center" width= 180px>
    ${product.category}<br />${product.subcategory}
  </td>
  <td>
    <div class="qty-btn">
     ${
       product.isInStock
         ? `
            <button onclick="updateQty('${product.sku}', -1)">-</button>
      <input 
  type="number" 
  id="qty-${product.sku}" 
  min="0" 
  step="1"
  max="${stockData[product.sku] || ""}" 
  value="${quantities[product.sku] || 0}" 
  onchange="handleQtyInput('${product.sku}', this.value)" 
  class="qty-input"
/>


      <button onclick="updateQty('${product.sku}', 1)">+</button>`
         : `<div class="out">OUT OF STOCK</div>`
     }
    </div>
  </td>
  <td class="text-center" width= 132px>${product.packaging}</td>
  <td class="text-center">
     ${
       hasDiscount
         ? `<span class="discount-new">${
             product.currency
           } ${discountedUnitPrice.toFixed(2)}</span><br>
         <span class="discount-old">${
           product.currency
         } ${product.pricePerUnit.toFixed(2)}</span> ${product.priceUnit}`
         : `${product.currency} ${product.pricePerUnit.toFixed(2)}<br>${
             product.priceUnit
           }`
     }
  </td>
  <td class="text-center" width=70px>
  ${
    product.isInStock
      ? `
        <div class="pallet-order">
          <input 
            class="form-check-input" 
            type="checkbox" 
            value="${product.sku}" 
            id="pallet-${product.sku}" 
            onchange="togglePalletOrder('${product.sku}', ${
          product.quantityPerOrder
        }, this.checked)" 
          />
          <label class="form-check-label" for="pallet-${product.sku}">
            ${product.quantityPerOrder}
          </label>
          ${
            product.orderDiscount && Number(product.orderDiscount) > 0
              ? `<div class="pallet-discount">-${product.orderDiscount}%</div>`
              : ""
          }
        </div>
      `
      : ""
  }
</td>

  <td class="text-center">
    ${product.volume.toFixed(2)} m<br />${product.weight} kg
  </td>
</tr>
  `;
}

const quantities = {}; // Keep track of quantities per SKU

function updateQty(sku, change) {
  if (!quantities[sku]) {
    quantities[sku] = 0;
  }

  // Update quantity but don't allow negative numbers
  const newQty = Math.max(0, quantities[sku] + change);

  // If this is the first time anything is added, show the order summary
  if (newQty > 0 && Object.values(quantities).every((qty) => qty === 0)) {
    document.getElementById("orderSummary").classList.remove("hidden");
  }

  quantities[sku] = newQty;

  // Update quantity display in the price list
  const priceListInput = document.getElementById(`qty-${sku}`);
  if (priceListInput) {
    priceListInput.value = newQty;
  }

  // Update quantity display in the summary (if any)
  const qtyElement = document.getElementById(sku);
  if (qtyElement) {
    qtyElement.textContent = quantities[sku];
  }

  updateOrderSummary();
}

function togglePalletOrder(sku, qtyPerPallet, isChecked) {
  if (!quantities[sku]) {
    quantities[sku] = 0;
  }

  if (isChecked) {
    quantities[sku] += qtyPerPallet;
  } else {
    // Optional: subtract pallet quantity when unchecked
    quantities[sku] = Math.max(0, quantities[sku] - qtyPerPallet);
  }

  // Show order summary if needed
  if (quantities[sku] > 0) {
    document.getElementById("orderSummary").classList.remove("hidden");
  }

  // Update the displayed quantity in the price list
  const priceListInput = document.getElementById(`qty-${sku}`);
  if (priceListInput) {
    priceListInput.value = quantities[sku];
  }

  // Update the displayed quantity in the summary (if any)
  const qtyElement = document.getElementById(sku);
  if (qtyElement) {
    qtyElement.textContent = quantities[sku];
  }

  updateOrderSummary();
}

function updateOrderSummary() {
  const orderBody = document.getElementById("orderItems");
  orderBody.innerHTML = "";

  let subtotal = 0;
  let totalSavings = 0;
  let totalVolume = 0;
  let totalWeight = 0;

  for (const sku in quantities) {
    const qty = quantities[sku];
    if (qty > 0) {
      const product = mappedProducts.find((p) => p.sku === sku);
      const regularDiscount = Number(product.priceDiscount) || 0;
      const palletDiscount = Number(product.orderDiscount) || 0;
      const qtyPerPallet = Number(product.quantityPerOrder);
      const isPallet = qtyPerPallet > 0 && qty % qtyPerPallet === 0;

      let unitPrice = product.pricePerOrder;
      let oldTotal = unitPrice * qty;
      let finalTotal = oldTotal;

      // Calculate total volume and weight for this item
      const itemTotalVolume = (product.volume * qty).toFixed(2);
      const itemTotalWeight = (product.weight * qty).toFixed(2);
      totalVolume += Number(itemTotalVolume);
      totalWeight += Number(itemTotalWeight);

      // Apply regular discount first if it exists
      if (regularDiscount > 0) {
        unitPrice = unitPrice * (1 - regularDiscount / 100);
        oldTotal = unitPrice * qty;
        finalTotal = oldTotal;
      }

      // Apply pallet discount if it's a full pallet order
      if (isPallet && palletDiscount > 0) {
        finalTotal = oldTotal * (1 - palletDiscount / 100);
      }

      const savings = oldTotal - finalTotal;
      subtotal += finalTotal;
      totalSavings += savings;

      orderBody.innerHTML += `
        <tr>
          <td class="left-align"><strong>${product.name}</strong><br />${product.sku}</td>
          <td class="center-align">
            ${
              regularDiscount > 0
                ? `<span class="discount-new">${product.currency} ${unitPrice.toFixed(2)}</span><br>
                   <span class="discount-old">${product.currency} ${product.pricePerOrder.toFixed(2)}</span>`
                : `${product.currency} ${unitPrice.toFixed(2)}`
            }
          </td>
          <td class="order-purchase-button">
            <div class="qty-btn">
              <button onclick="updateQty('${sku}', -1)">-</button>
              <input 
                type="number" 
                id="qty-${product.sku}" 
                min="0" 
                step="1"
                max="${stockData[product.sku] || ""}" 
                value="${quantities[product.sku] || 0}" 
                onchange="handleQtyInput('${product.sku}', this.value)" 
                class="qty-input"
              />
              <button onclick="updateQty('${sku}', 1)">+</button>
            </div>
          </td>
          <td class="center-align">
            ${
              savings > 0
                ? `
                  <span class="discount-new">${product.currency} ${finalTotal.toFixed(2)}</span><br>
                  <span class="discount-old">${product.currency} ${oldTotal.toFixed(2)}</span><br>
                  <span class="savings">Pallet Savings: ${product.currency} ${savings.toFixed(2)}</span>
                `
                : `${product.currency} ${finalTotal.toFixed(2)}`
            }
          </td>
          <td class="center-align">
            ${itemTotalVolume} m³<br />${itemTotalWeight} kg
          </td>
        </tr>
      `;
    }
  }

  // Add 120px spacer row before summary
  orderBody.innerHTML += `
    <tr><td colspan="5" style="height:120px;"></td></tr>
    <tr class="summary-header-row">
      <td colspan="3"><span class="summary-title">SUMMARY</span></td>
      <td class="summary-header-cell">Total</td>
      <td class="summary-header-cell">Volume Weight</td>
    </tr>
    <tr class="summary-row">
      <td colspan="3"></td>
      <td class="center-align total-price"><span class="summary-total">€${subtotal.toFixed(2)}</span></td>
      <td class="center-align total-volume-weight"><span class="summary-total">${totalVolume.toFixed(2)} m³<br />${totalWeight.toFixed(2)} kg</span></td>
    </tr>
  `;

  // Update the order button total
  const orderButtonTotal = document.getElementById('orderButtonTotal');
  if (orderButtonTotal) {
    orderButtonTotal.textContent = subtotal.toFixed(2);
  }
}

function toggleOrderSummary() {
  const summary = document.getElementById("orderSummary");
  summary.classList.toggle("hidden");
}

function handleQtyInput(sku, value) {
  const maxStock = stockData[sku] || Infinity;
  let numericQty = Math.max(0, Math.floor(Number(value)) || 0);

  // Clamp to max available stock
  if (numericQty > maxStock) {
    numericQty = maxStock;
  }

  quantities[sku] = numericQty;

  // Sync both inputs
  const inputField = document.getElementById(`qty-${sku}`);
  if (inputField) inputField.value = numericQty;

  const summaryField = document.getElementById(`qty-summary-${sku}`);
  if (summaryField) summaryField.value = numericQty;

  // Show summary
  if (numericQty > 0) {
    document.getElementById("orderSummary").classList.remove("hidden");
  }

  updateOrderSummary();
}

window.onload = loadPriceList;
document.querySelector(".price-list").addEventListener("scroll", handleScroll);
