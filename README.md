# VibeTalk Frontend

**VibeTalk** is a modern, responsive, real-time messaging application frontend built with React and Vite. It provides an interactive chat experience with user authentication, conversation management, and real-time communication.

**Frontend Repository:** [vibetalk-frontend](https://github.com/bitamez/vibetalk-frontend)

**Backend Repository:** [vibetalk-backend](https://github.com/bitamez/vibetalk-backend)

---

## 🚀 Features

- User registration and login
- JWT-based authentication
- Protected application routes
- Real-time messaging with Socket.IO
- User list and conversation management
- Online user status
- Responsive chat interface
- Reusable React components
- Profile management
- API integration with Axios
- Loading and error states
- Modern user interface

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React 19 | Frontend library |
| Vite 8 | Development and build tool |
| JavaScript | Application programming |
| Tailwind CSS 4 | Styling |
| React Router DOM | Client-side routing |
| Axios | HTTP requests |
| Socket.IO Client | Real-time communication |
| Lucide React | Icons |
| Context API | Global authentication state |
| Zod | Data validation |

## 📁 Project Structure

```text
frontend/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Avatar.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── Loading.jsx
│   │   ├── Message.jsx
│   │   ├── MessageInput.jsx
│   │   ├── ProfileModal.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   └── UserList.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   └── socket.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

*Folder and file entries should be adjusted to match the actual project.*

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/bitamez/vibetalk-frontend.git
```

### 2. Navigate to the project

```bash
cd vibetalk-frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the frontend root directory.

```env
VITE_API_URL=http://localhost:5000
```

For production, replace the URL with your deployed backend address.

Example:

```env
VITE_API_URL=https://your-backend.onrender.com
```

Never put database passwords, JWT signing secrets, or Supabase service-role keys in frontend environment variables. Vite exposes `VITE_` variables to browser users.

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## 🧩 Application Components

### Authentication

- Login
- Register
- AuthContext
- ProtectedRoute

Handles user authentication, token management, and protected navigation.

### Chat Interface

- Sidebar
- ChatWindow
- Message
- MessageInput
- Avatar

Provides the main messaging interface and conversation experience.

### Profile Management

- ProfileModal

Provides the user profile interface and profile management functionality.

### Loading

- Loading

Provides loading indicators while application data is being fetched.

## 🔄 Application Architecture

The frontend communicates with the backend through REST APIs and Socket.IO.

```text
          React Application
                 |
                 v
          React Router
                 |
                 v
          AuthContext
                 |
          +------+------+
          |             |
          v             v
       Axios         Socket.IO
          |             |
          v             v
       REST API     Real-Time Events
          |             |
          +------+------+
                 |
                 v
          Node.js Backend
                 |
                 v
          PostgreSQL
```

## 🔐 Authentication Workflow

1. User opens the login or registration page.
2. User submits authentication details.
3. Frontend sends the request to the backend using Axios.
4. Backend validates credentials.
5. Backend returns authentication information.
6. Frontend maintains the authenticated user session.
7. Protected routes allow access to the dashboard.
8. Socket.IO connects for real-time communication.

## 💬 Real-Time Messaging

VibeTalk uses Socket.IO Client to communicate with the backend.

The frontend supports:

- Establishing socket connections
- Sending real-time messages
- Receiving incoming messages
- Tracking online users
- Updating conversation interfaces
- Managing socket disconnections

## 🏗️ Build for Production

Run:

```bash
npm run build
```

Vite generates optimized production files in:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

## 🌐 Deployment

The frontend is designed for deployment using Vercel.

**Deployment configuration:**

| Setting | Value |
|---|---|
| Repository | bitamez/vibetalk-frontend |
| Platform | Vercel |
| Framework | Vite |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Production environment variable:

```env
VITE_API_URL=https://your-backend.onrender.com
```

Configure the backend to allow requests from your deployed frontend domain.

## 🧪 Testing

Before deployment, verify:

- Registration
- Login
- Authentication persistence
- Protected routes
- API communication
- User list
- Conversation selection
- Message sending and receiving
- Socket.IO connection
- Responsive layout
- Production build

## 🔗 Related Repository

**VibeTalk Backend:** https://github.com/bitamez/vibetalk-backend

## 👨‍💻 Developer

Developed as a full-stack real-time messaging application using modern JavaScript technologies.

---

**VibeTalk — Connect, Chat, and Communicate in Real Time.**
