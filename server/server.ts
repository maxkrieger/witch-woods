import { Socket, Server } from "socket.io";
import express from "express";
import gamestate, {
  Facing,
  GameState,
  makePlayer,
  Team,
} from "../src/gamestate";
import { stringify } from "uuid";

const server = express();

const http = server.listen(6660);

const io = new Server(http, {
  cors: {
    origin: ["http://localhost:8080"],
    methods: ["GET", "POST"],
  },
  serveClient: false,
});

console.log(`server running on 6660`);

const rooms: { [id: string]: GameState } = {};

rooms["room1"] = gamestate();

io.on("connection", (socket: Socket) => {
  socket.on("join", ({ name, team }: { name: string; team: Team }) => {
    const playerInit = makePlayer(name, team);
    rooms["room1"].players[playerInit.id] = playerInit;
    socket.join("room1");
    socket.emit("myPlayer", playerInit);
    io.to("room1").emit("gameState", rooms["room1"]);
    socket.on(
      "move",
      ({
        x,
        y,
        facing,
        moving,
      }: {
        x: number;
        y: number;
        facing: Facing;
        moving: boolean;
      }) => {
        rooms["room1"].players[playerInit.id].x = x;
        rooms["room1"].players[playerInit.id].y = y;
        rooms["room1"].players[playerInit.id].moving = moving;
        rooms["room1"].players[playerInit.id].facing = facing;
        io.to("room1").emit("gameState", rooms["room1"]);
      }
    );
    socket.on("disconnect", () => {
      delete rooms["room1"].players[playerInit.id];
      io.to("room1").emit("removePlayer", playerInit.id);
    });
  });
});
