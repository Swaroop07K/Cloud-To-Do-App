# Cloud-Based Todo Application

A secure, real-time todo list application built with React and Firebase.

## Features
- **User Authentication**: Secure email and password login.
- **Real-time Sync**: Tasks stay in sync across devices instantly.
- **Full CRUD**: Add, edit, delete, and toggle tasks.


### 1. Install and Run
```bash
npm install
npm run dev
```

### 2. Build and Deploy
```bash
npm run build
firebase deploy
```

## Security
This application implements strict Firestore Security Rules. User identities are verified at the server level, and data integrity is enforced via schema validation within the rules themselves.
