import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class RoomController {

    @OnMessage("join_game")
    public async joinGame(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any) {
        console.log("new user join room:", message);

        const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);

        if (socketRooms.length > 0 || connectedSockets && connectedSockets.size === 2) {
            socket.emit("room_join_error", {
                error: "Oda dolu, Lütfen başka bir oda'ya giriniz veya yeni bir oluşturunuz."
            });
        } else {
            await socket.join(message.roomId);
            socket.emit("room_joined");
            if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
                socket.emit("start_game", { start: true, symbol: "X" });
                socket.to(message.roomId).emit("start_game", { start: false, symbol: "O" });
            }
        }
    }

}