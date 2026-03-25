# WhatsApp Shop Management Tool

A lightweight, responsive web application to manage your WhatsApp catalog products.

## Features
- **Product Management**: Add, Edit, and Delete products.
- **Image Hosting**: Direct integration with Cloudinary for fast and reliable image serving.
- **WhatsApp Catalog Feed**: Automatically generates a CSV feed compatible with Facebook Commerce Manager.
- **Modern UI**: Dark-mode, glassmorphism, and fully responsive for mobile/tablet use.

## Setup Instructions

### 1. Vercel Deployment & Database
This project is designed to be hosted on Vercel. 
1. Push this code to a GitHub repository.
2. Import the project into [Vercel](https://vercel.com).
3. In your Vercel Project Dashboard:
   - Go to **Storage** and create a new **KV (Redis)** database.
   - Connect the KV database to your project. This will automatically add `KV_URL`, `KV_REST_API_URL`, etc. to your environment variables.

### 2. Cloudinary Configuration
To enable image uploads, you need to update `main.js` with your Cloudinary details:
1. Open [main.js](file:///c:/Users/Natanel%20Richey/Desktop/Even%20Pinah/WhatsappShop/main.js).
2. Look for the `cloudinary.createUploadWidget` configuration (around line 105).
3. Replace `'demo'` with your **Cloud Name**.
4. Replace `'ml_default'` with your **Upload Preset** (create an unsigned preset in Cloudinary settings).

### 3. Usage
- **Add Product**: Click "Add New Item", upload an image, and fill in the details.
- **Edit/Delete**: Use the buttons on each product card.
- **Export to WhatsApp**: Click "Download Catalog CSV" in the header. Use this file in Facebook Commerce Manager to sync your catalog.

## Tech Stack
- **Frontend**: Vite + Vanilla JS + CSS
- **Backend**: Vercel Serverless Functions
- **Storage**: Vercel KV (Redis)
- **Images**: Cloudinary
