import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Queue from "./services/Queue";

const PORT = process.env.PORT || 8000;

const queue = new Queue();

async function main() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connect", async (socket) => {
    console.log(`A new Socket joined the waiting queue : ${socket.id}`);
    //put this socket into the queue
    queue.push(socket);

    socket.on("disconnect", () => {
      console.log(`Scoket ${socket.id} disconnected!`);
      queue.findAndRemove(socket.id);
    });
  });

  httpServer.listen(PORT);
  console.log(`Server running on port ${PORT}`);
}

main();
