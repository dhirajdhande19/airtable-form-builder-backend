# Form Builder (Backend) ⚙️

Node.js + Express backend for the Form Builder application.  
Handles Airtable OAuth authentication, form-related APIs, and frontend integration.

## ✨ Features
- Airtable OAuth 2.0 (PKCE flow)
- JWT-based authentication
- Session handling
- APIs for forms and responses
- CORS configured for local and deployed frontend

## 🛠 Tech Stack
- Node.js
- Express
- MongoDB + Mongoose
- Airtable OAuth API
- JWT
- express-session

## 🔐 Environment Variables
Create a `.env` file using `.env.example` as reference.

```env
AIRTABLE_CLIENT_ID=<airtable_client_id>
AIRTABLE_CLIENT_SECRET=<airtable_client_secret>
AIRTABLE_REDIRECT_URI=<oauth_callback_url>

AIRTABLE_AUTH_URL=https://airtable.com/oauth2/v1/authorize
AIRTABLE_TOKEN_URL=https://airtable.com/oauth2/v1/token

ATLAS_URL=<mongodb_connection_string>

JWT_SECRET=<jwt_secret>
JWT_EXPIRES_IN=7d

FRONTEND_URL=<frontend_url>
PORT=4000
````

## 🚀 Running Locally

```bash
npm install
npm run dev
```

## 🌍 Deployment

Deployed on Render.

This backend was built for learning and portfolio purposes, focusing on core authentication and API flows rather than production-scale features.
