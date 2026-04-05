# TaskFlow: Premium Task Management App

TaskFlow is a cutting-edge, full-stack Task Management Application. It leverages a modern **Node.js/Prisma backend** coupled with a high-performance **Next.js frontend**. The application is designed to prioritize aesthetics, featuring an interactive Canvas API text-rendering background powered by `@chenglou/pretext`, stunning glassmorphic UI components, and fluid `framer-motion` animations.

## ✨ Features

- **Advanced Authentication:** Seamless JWT-based user registration, login, profile updates, and session routing.
- **Task Management CRUD:** Add, edit, delete, and toggle task completion cleanly in real time.
- **Dynamic Filtering & Pagination:** Scalable data retrieval with serverside pagination, title searching, and complete/pending filtration.
- **Cutting-Edge Graphics Engine:** The login viewport features a real-time (60fps) Canvas-drawn mathematical repulsion engine using `@chenglou/pretext` for interactive text measurement and wrapping around a wandering glowing orb.
- **Dark Mode Glassmorphism:** A tailored, zero-framework CSS variable design system featuring ambient backdrops, subtle hover scalings, and neon focal points.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Animations:** Framer Motion
- **Web Canvas APIs:** `@chenglou/pretext` for multiline dom-free text layout.
- **Network Requests:** Axios with automatic token interception

### Backend
- **Framework:** Express.js 
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** MongoDB
- **Security:** `bcrypt` for password hashing, `jsonwebtoken` for secure session cookies.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB cluster URL (e.g., MongoDB Atlas)

### 1. Setup the Backend
Open a terminal in the `/Backend` directory:
```bash
cd Backend
npm install
```

Create a `.env` file in the `/Backend` root:
```env
DATABASE_URL="mongodb+srv://jhonwatson172_db_user:CYGL22slcKAhcGME@cluster0.zhfwbcc.mongodb.net/task_management?appName=Cluster0"
JWT_SECRET="supers3cr3tkey123!@#"
JWT_REFRESH_SECRET="sup3rlongr3fr3shk3y456!@#"
PORT=3000
```

Sync the database schemas and start the server:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Setup the Frontend
Open a new terminal in the `/frontend` directory:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `/frontend` root:
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

Start the frontend development server:
```bash
# We use port 3001 to avoid conflicting with the backend process on port 3000.
npm run dev
```

### 3. Usage
Navigate to `http://localhost:3001` in your browser. Register a new user, experience the Canvas pretext environment, and start creating tasks!

---

## 📚 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Generate JWT tokens.
- `POST /logout`: Destroy session.
- `GET /profile`: Retrieve user profile via token.
- `PUT /profile`: Update name or regenerate password securely.

### Tasks (`/api/tasks`)
- `GET /`: Retrieve tasks array (supports `?page=`, `?limit=`, `?search=`, and `?status=`).
- `POST /`: Create a new task.
- `PATCH /:id`: Update task title or description.
- `PATCH /:id/toggle`: Toggle true/false completion status.
- `DELETE /:id`: Permanently delete a task.
