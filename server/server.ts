import { Socket, Server } from "socket.io";
import express from "express";
import gamestate from "./gamestate";

const server = express();

const http = server.listen(6660);

const io = new Server(http, {
  cors: {
    origin: ["*"],
    methods: ["GET", "POST"],
  },
});

const rooms: { [id: string]: Game } = {};

rooms["room1"] = gamestate();

io.on("connection", (socket: Socket) => {
  socket.join("room1");
});
