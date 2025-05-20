# Lighting Fast Ordering

## Overview
The Lighting Fast Ordering project is a web application designed to facilitate the ordering process for products. It provides users with an interactive interface to view products, manage quantities, and calculate order summaries efficiently.

## Project Structure
The project consists of the following files:

- **script.js**: Contains the main JavaScript code for the application. It handles loading product data, managing stock information, rendering products, updating quantities, and calculating order summaries. Key functions include:
  - `loadPriceList`: Loads product and stock data.
  - `renderProducts`: Renders the product list in the UI.
  - `handleQtyInput`: Manages user input for product quantities.
  - `updateOrderSummary`: Calculates and displays the order summary.
  - `toggleOrderSummary`: Toggles the visibility of the order summary.

- **products.json**: Contains product data in JSON format. Each product includes details such as SKU, name, price, category, and other relevant attributes.

- **stock.json**: Contains stock data in JSON format. It provides information about the available quantities for each product SKU.

- **flags.json**: Contains flag data in JSON format. It maps product origins to their respective ISO country codes for displaying flags.

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the project in your preferred code editor.
3. Ensure you have a local server running to serve the HTML and JavaScript files.
4. Open the `index.html` file in your web browser to view the application.

## Usage Guidelines
- Use the search functionality to quickly find products by name or SKU.
- Select product quantities using the "+" and "-" buttons or by entering a value directly in the input field.
- The order summary will update automatically as you modify quantities.
- You can toggle the visibility of the order summary to view your selected items and total costs.

## Contributing
Contributions to the project are welcome. Please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.