# Nexus LOS - Loan Origination System

A robust Minimum Viable Product (MVP) modeling the lifecycle of a Loan across four discrete phases: Pre-Screening, Underwriting, CAM & Risk Assessment, and RCM Sanctioning. 
Built elegantly atop the MERN Stack and styled with a Glassmorphism Aesthetic.

## Core Features
1. **Roles-Based Interface Dashboard**: Custom workflows per user (`sales`, `management`, `analyst`, `rcm`).
2. **REST API State Machines**: Sequential database status checks ensuring forms, financials, and mandatory documents are met before Lead advancement.
3. **Internal Queries**: A built in Query-board module allowing dynamic interaction attached to specific cases.
4. **Multifile Operations**: Powered securely via `multer` serving KYC requirements and Excel models.

## Getting Started

1. Set up backend database:
   ```bash
   cd backend
   npm install
   node seed.js
   npm run dev
   ```

2. Start Frontend Server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Demo Credentials
The `node seed.js` command generates the following accounts, separated by role (All passwords are `password123`):

- **Sales:** `sales@example.com`
- **Management:** `management@example.com`
- **Analyst:** `analyst@example.com`
- **RCM / Sanctioner:** `rcm@example.com`

---
