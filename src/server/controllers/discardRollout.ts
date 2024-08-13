import { Socket } from 'socket.io';
import DiscardRollOutService from '../services/discardRollout';

class DiscardRollOutController {
    private discardRollOutService: DiscardRollOutService;
    public canCreateDiscardRollOut = async (socket: Socket): Promise<void> => {
        try {
            const discardRollOut = await this.discardRollOutService.getDiscardRollOutByDate();
            !discardRollOut ? socket.emit('canCreateDiscardRollOutSuccess', true) : socket.emit('canCreateDiscardRollOutSuccess', false);
        } catch (error) {
            socket.emit('canCreateDiscardRollOutError', { error: error.message });
        }
    };
    public createDiscardRollOut = async (socket: Socket, data: any): Promise<void> => {
        console.log('entering createDiscardRollOut====================', data)
        const date = new Date().toISOString().slice(0, 7);
        const { id: item_id, name: item_name, price } = data.items;

        console.log('-----------------createDiscardRollOut-------', item_id, item_name, price, date);

        try {
            const discardRollOut = await this.discardRollOutService.createDiscardRollOut(item_id, item_name, price, date);
            socket.emit('createDiscardRollOutSuccess', discardRollOut);
        } catch (error) {
            socket.emit('createDiscardRollOutError', { message: error.message });
        }
    };
    public deleteDiscardRollOut = async (socket: Socket, data: any): Promise<void> => {
        const { id } = data;

        try {
            await this.discardRollOutService.deleteDiscardRollOut(id);
            socket.emit('deleteDiscardRollOutSuccess');
        } catch (error) {
            socket.emit('deleteDiscardRollOutError', { error: error.message });
        }
    };
    public getDiscardRollOutByDate = async (socket: Socket): Promise<void> => {
        try {
            const discardRollOut = await this.discardRollOutService.getDiscardRollOutByDate();
            socket.emit('getDiscardRollOutByDateSuccess', discardRollOut);
        } catch (error) {
            socket.emit('getDiscardRollOutByDateError', { error: error.message });
        }
    };
    public getDiscardRollOutById = async (socket: Socket, data: any): Promise<void> => {
        const { id } = data;

        try {
            const discardRollOut = await this.discardRollOutService.getDiscardRollOutById(id);
            socket.emit('getDiscardRollOutByIdSuccess', discardRollOut);
        } catch (error) {
            socket.emit('getDiscardRollOutByIdError', { error: error.message });
        }
    };
    public getDiscardRollOuts = async (socket: Socket): Promise<void> => {
        try {
            const discardRollOuts = await this.discardRollOutService.getDiscardRollOuts();
            socket.emit('getDiscardRollOutsSuccess', discardRollOuts);
        } catch (error) {
            socket.emit('getDiscardRollOutsError', { error: error.message });
        }
    };
    public updateDiscardRollOut = async (socket: Socket, data: any): Promise<void> => {
        const { id, item_id, item_name, price, date } = data;

        try {
            const discardRollOut = await this.discardRollOutService.updateDiscardRollOut(id, item_id, item_name, price, date);
            socket.emit('updateDiscardRollOutSuccess', discardRollOut);
        } catch (error) {
            socket.emit('updateDiscardRollOutError', { error: error.message });
        }
    };

    constructor() {
        this.discardRollOutService = new DiscardRollOutService();
    }
}

export default DiscardRollOutController;
