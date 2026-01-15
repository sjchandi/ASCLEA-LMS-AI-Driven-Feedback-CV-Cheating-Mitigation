// socketServer.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const port = process.env.SOCKET_IO_PORT || 3000;

const io = new Server(httpServer, {
    cors: {
        origin: "*", // allow frontend to connect
    },
});

// Keep track of online students
let onlineUsers = new Map(); // key: user, value: socket.id

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Student comes online
    socket.on("user_online", ({ user }) => {
        console.log(user);

        // Store user info along with their socket id
        onlineUsers.set(user.user_id, { ...user, socketId: socket.id });

        console.log("Online users:", onlineUsers);

        // Filter only students
        const students = Array.from(onlineUsers.values()).filter(
            (u) => u.role_name === "student"
        );

        // Emit array of students including their socketId
        io.emit("online_students", students);

        console.log("Online students:", students);
    });

    // Heartbeat ping to keep online status
    socket.on("student_ping", ({ user }) => {
        if (onlineUsers.has(user)) {
            // update timestamp or keep alive
        }
    });

    // Student leaves or disconnects
    socket.on("disconnect", () => {
        // Remove any user whose socketId matches the disconnected socket
        for (let [userId, userObj] of onlineUsers.entries()) {
            if (userObj.socketId === socket.id) {
                onlineUsers.delete(userId);
            }
        }

        // Emit only students
        const students = Array.from(onlineUsers.values()).filter(
            (u) => u.role_name === "student"
        );

        io.emit("online_students", students);
        console.log("Client disconnected:", socket.id);
    });

    socket.on("student_offline", ({ user }) => {
        // Remove by user_id
        onlineUsers.delete(user.user_id);

        const students = Array.from(onlineUsers.values()).filter(
            (u) => u.role_name === "student"
        );

        io.emit("online_students", students);
    });
});

// HTTP Endpoints for sending notification
app.post("/notify", (req, res) => {
    const data = req.body;

    const { notifications } = data;
    console.log(data);
    res.json({ success: true });

    // Send notfication to one user
    notifications.forEach((notification) => {
        const user = onlineUsers.get(notification.notifiable_id);
        if (user) {
            console.log(`SOCKET ID: ${user.socketId}`);
            io.to(user.socketId).emit("notification", { notification });
        }
    });
});

app.post("/backup", (req, res) => {
    const data = req.body;

    const { backup } = data;
    console.log(data);
    res.json({ success: true });

    const user = onlineUsers.get(backup.user_id);
    if (user) {
        console.log(`SOCKET ID: ${user.socketId}`);
        io.to(user.socketId).emit("backup", { backup });
    }
});

httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Socket.IO server running on port ${port}`);
});
