# Medical Store Customer Portal

A modern, production-ready, mobile-responsive online pharmacy portal built using React.js (Vite), Tailwind CSS, and Firebase. This application features a dual-mode service architecture that lets you test all capabilities out-of-the-box using a simulated Local Storage database, switching to live Firebase services instantly once credentials are provided.

## Key Features

*   **Secure Authentication**: Register and log in. Includes email verification triggers, password strength and length checks, and 10-digit mobile number validators.
*   **Dual-Mode Service Layer**: If Firebase keys are not provided in `.env`, the app falls back to a simulated `localStorage` database with artificial latency so you can view page states immediately.
*   **Apothecary Catalog**: Browse medicines across 10 distinct categories. Search and filter by category, price, sorting criteria, and stock availability.
*   **Product Details**: View brands, manufacturers, dosages, side effects, similar medicines, and multi-image thumbnail galleries.
*   **State-Managed Cart & Wishlist**: Context-driven add-to-cart, quantity increments/decrements, item removals, coupon codes (`HEALTH10` for 10% off), and a global toast notification drawer.
*   **Visual Order Stepper**: Track your delivery status chronology (`Order Placed` -> `Processing` -> `Packed` -> `Shipped` -> `Out For Delivery` -> `Delivered`). In mock mode, the status advances every 30 seconds for demonstration!
*   **User Address CRUD**: Add, edit, delete, and set default shipping addresses.
*   **Interactive Analytics Dashboard**: Interactive charts inside the **Profile** page built with Recharts, displaying monthly medical expenses and blood sugar tracking logs. Matches dark and light browser themes dynamically.

---

## Directory Structure

```text
customer-app/
├── src/
│   ├── assets/         # App logo assets and imagery
│   ├── components/     # Reusable modules (Navbar, Footer, Skeletons, OrderTracker, etc.)
│   ├── pages/          # Layout screens (Home, Products, Checkout, Profile, etc.)
│   ├── context/        # State managers (AuthContext.jsx, CartContext.jsx)
│   ├── services/       # Network & Storage layers (firebase.js, authService.js, etc.)
│   ├── App.jsx         # App router mapping
│   ├── index.css       # Tailwind entry and custom animation keyframes
│   └── main.jsx        # App DOM mounting
├── tailwind.config.js  # Color tokens and HSL palettes
├── postcss.config.js   # CSS compile parameters
├── index.html          # Main SEO document
├── package.json        # Project packages and build scripts
└── .env.example        # Environment parameters template
```

---

## Getting Started

### Prerequisites

*   **Node.js**: Version 18.x or above
*   **NPM**: Version 9.x or above

### Installation

1.  Navigate into the project directory:
    ```bash
    cd customer-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173`.

---

## Firebase Configuration

To hook up your live Firebase project:

1.  Create a Firebase Project on the [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Email/Password** Provider under Build -> Authentication -> Sign-in method.
3.  Initialize a **Cloud Firestore** database.
4.  Copy the `.env.example` file to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
5.  Fill in your Firebase web app SDK credentials:
    ```env
    VITE_FIREBASE_API_KEY=AIzaSyA...
    VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your-app-id
    VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
    VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
    ```
6.  Restart your development server:
    ```bash
    npm run dev
    ```
    The application will automatically detect the keys, log `Firebase initialized successfully` in the dev tools, and run transactions live!

---

## Firestore Schema Setup

The service layer is built around these collections:

*   `/users/{uid}`: Profiles (name, phone, email, createdAt).
*   `/products/{productId}`: Medicine catalog details.
*   `/cart/{userId}`: Active basket items array.
*   `/wishlist/{userId}`: Favorite items array.
*   `/orders/{orderId}`: Placed checkout logs (amount, status, paymentMethod, shippingAddress, items).
*   `/addresses/{addressId}`: Shipping addresses profiles.

### Pre-populating Firestore Products (Seeding)

When you first connect your live Firebase project, your Firestore database will be empty. To make it easy to start, we have included a **developer utility** inside `productService.js`. 

To populate Firestore automatically with our 20+ realistic test medicines, open your browser dev tools console and run:
```javascript
// This seeds the 25+ default products to your Firestore collection
import("./src/services/productService").then(m => m.productService.seedProductsToFirestore())
```
*Note: Make sure your Firestore rules allow write access during seeding.*
