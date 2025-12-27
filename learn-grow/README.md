# Learn & Grow - EdTech Platform

A comprehensive educational technology platform designed to connect instructors, students, and guardians. Built with modern web technologies to provide a seamless learning experience, "Learn & Grow" empowers education through advanced management tools and interactive features.

## 🚀 Features

- **Role-Based Access Control (RBAC):** Dedicated dashboards for Administrators, Instructors, Students, and Guardians.
- **Course Management:** Instructors can create and manage courses, modules, and lessons.
- **Live Classes:** Integrated scheduling and management for live video sessions (Zoom/Google Meet).
- **Assessments & Quizzes:** Robust system for creating quizzes, exams, and assignments with various question types.
- **Student Analytics:** Detailed tracking of student progress and performance.
- **Authentication:** Secure login and registration with mock support for development/demos.
- **Modern UI:** Built with NextUI and Tailwind CSS for a responsive, accessible, and beautiful interface.

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [NextUI](https://nextui.org/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) & RTK Query
- **Icons:** React Icons
- **Animation:** Framer Motion

## 📦 Getting Started

### Prerequisites

- Node.js (v18.17 or later recommended)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/learn-and-grow.git
    cd learn-and-grow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Default/Mock Credentials (Dev Mode)

For development and testing purposes, you can use the following accounts (configured in `components/Auth/LoginForm.tsx`) if the backend is not connected:

| Role       | Phone Number | Password     |
| :--------- | :----------- | :----------- |
| **Admin**  | 01706276447  | @M.jabed3834 |
| **Teacher**| 01711111111  | teacher123   |
| **Student**| 01722222222  | student123   |
| **Parent** | 01733333333  | guardian123  |

## 📂 Project Structure

```
Learn-Grow/
├── app/                  # Next.js App Router pages & API routes
│   ├── admin/            # Admin dashboard & routes
│   ├── instructor/       # Instructor dashboard & routes
│   ├── student/          # Student dashboard & routes
│   ├── guardian/         # Guardian dashboard & routes
│   ├── login/            # Authentication page
│   └── ...
├── components/           # Reusable UI components
├── lib/                  # Utility functions & configs
├── redux/                # Redux state & API slices
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
