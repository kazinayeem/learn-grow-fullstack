module.exports = {
  apps: [
    {
      name: "next-app",
      script: ".next/standalone/server.js",
      cwd: "/root/learn-grow-fullstack/learn-grow", // ✅ FIXED
      instances: 2, // (4 না, তোমার VPS 2 core)
      exec_mode: "cluster",

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },

    {
      name: "backend-api",
      script: "/root/learn-grow-fullstack/grow-backend/dist/server.js", // ✅ FIXED
      cwd: "/root/learn-grow-fullstack/grow-backend",

      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
