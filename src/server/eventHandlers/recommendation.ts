import { Socket } from "socket.io";
import RecommendationSocketHandler from "../controllers/recommendation";

const recommendationSocketHandler = new RecommendationSocketHandler();


export default class RecommendationEventHandler {
    private socket

    constructor(socket: Socket) {
        this.socket = socket
    }

    listen() {
        this.socket.on("getRecommendedItems", async (data) => {
            const { menu_type } = data
            await recommendationSocketHandler.getRecommendedMenuItems(this.socket, menu_type);
        });

        this.socket.on("getDiscardableItems", async (data) => {
            console.log("Event getDiscardableItems---------------", data)
            const { menu_type } = data
            await recommendationSocketHandler.getDiscardableMenuItems(this.socket, menu_type);
        });

        this.socket.on("discardItem", async (data) => {
            console.log('Item to be discarded----------------------------qwer',data)
            await recommendationSocketHandler.discardMenuItems(this.socket, data);
        });
    }
}

