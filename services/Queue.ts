//create a Queue class
import { nanoid } from "nanoid";
import { Socket } from "socket.io";

export default class Queue {
  private queue: Socket[] = [];
  private minPlayers: number = 2;

  constructor() {
    this.queue = [];
  }

  push(element: Socket) {
    this.queue.push(element);

    this.allotRoom();
  }

  private dequeue() {
    return this.queue.shift();
  }

  findAndRemove(id: string) {
    this.queue = this.queue.filter((player) => player.id !== id);
  }

  hasEnoughPlayers() {
    return this.queue.length >= this.minPlayers;
  }

  /**
   * This function checks if there are enough active players to allot a room.
   * If there are, it dequeues two players and generates a unique roomId.
   * It then returns an object with 'alloted' set to true, the dequeued players,
   * and the roomId. If there are not enough active players, it returns an object
   * with 'alloted' set to false, 'players' set to null, and 'roomId' set to null.
   *
   * @return {object} object with 'alloted' boolean, 'players' array, and 'roomId' string
   */
  allotRoom() {
    console.log("here at allot room");

    // Remove inactive players
    this.removeInacivePlayer();

    // Check if there are enough active players
    if (this.hasEnoughPlayers()) {
      // Dequeue two players
      const player1 = this.dequeue();
      const player2 = this.dequeue();

      if (!player1 || !player2) {
        console.log("players dequed are undefined");
        return;
      }

      // Generate a unique roomId
      const roomId = nanoid(12);

      this.broadcastToAllotedPlayers({
        event: eventType.roomAlloted,
        data: { roomId },
        players: [player1, player2],
      });

      return true;
    } else {
      return false;
    }
  }

  /**
   * Sends a specified event with data to the allotted players.
   *
   * @param {string} event - the event to be sent
   * @param {any} data - the data to be sent with the event
   * @param {Socket[]} players - the players to whom the event will be sent
   */
  private broadcastToAllotedPlayers({
    event,
    data,
    players,
  }: {
    event: string;
    data: any;
    players: Socket[];
  }) {
    console.log("emitting, ", event, data);
    players.forEach((player) => player.emit(event, data));
    // this.disconnectPlayers(players);
  }

  private disconnectPlayers(players: Socket[]) {
    players.forEach((player) => player.disconnect(true));
  }

  /**
   * Remove inactive player from the queue.
   */
  private removeInacivePlayer() {
    this.queue = this.queue.filter((player) => player.connected);
  }
}

interface Event {
  type: eventType.roomAlloted;
  data: {
    roomId: string;
  };
}

enum eventType {
  "roomAlloted" = "room-alloted",
}
