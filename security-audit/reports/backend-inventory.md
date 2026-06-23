# Backend Discovery & Inventory Report

## TECHNOLOGY STACK
- **Programming Language**: JavaScript (Node.js)
- **Framework**: Express.js
- **Runtime Environment**: Node.js v18.x
- **Package Manager**: npm

## ARCHITECTURE
- **Type**: Monolithic Web Application (with decoupled React Native client)
- **Design Pattern**: MVC (Model-View-Controller) / Layered Architecture

## API STRUCTURE
- **Type**: RESTful APIs
- **Format**: JSON (`application/json`)

## AUTHENTICATION
- **Primary Mechanism**: JSON Web Tokens (JWT)
- **Storage**: HttpOnly Cookies / LocalStorage (Mobile)
- **Session Strategy**: Stateless JWT

## AUTHORIZATION
- **Mechanism**: Role-Based Access Control (RBAC)
- **Roles Detected**: `USER`, `ADMIN`, `SELLER`

## DATABASE
- **Primary Database**: MongoDB (Assuming Mongoose ODM)
- **Caching**: None detected yet

## ORM / ODM
- **Library**: Mongoose

## ADDITIONAL FEATURES
- **File Uploads**: Yes (Multer)
- **Payment Gateways**: Easebuzz / Razorpay integrations detected.
- **External Integrations**: Third-party payment APIs.
