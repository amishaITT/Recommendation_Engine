import { Socket } from 'socket.io';
import DailyMenuItemService from '../services/dailyMenuItems';

class DailyMenuItemController {
    private dailyMenuItemService: DailyMenuItemService;
    public createDailyMenuItem = async (socket: Socket, data: any): Promise<void> => {
        const menu_date = new Date().toISOString().split('T')[0];
        const { item_id, quantity } = data;
        try {
            const dailyMenuItem = await this.dailyMenuItemService.createDailyMenuItem(item_id, quantity, menu_date);
            socket.emit('createDailyMenuItemSuccess', dailyMenuItem);
        } catch (error) {
            socket.emit('createDailyMenuItemError', { message: error.message });
        }
    };
    public deleteDailyMenuItem = async (socket: Socket, data: any): Promise<void> => {
        const { id } = data;
        try {
            await this.dailyMenuItemService.deleteDailyMenuItem(+id);
            socket.emit('deleteDailyMenuItemSuccess');
        } catch (error) {
            socket.emit('deleteDailyMenuItemError', { error: error.message });
        }
    };
    public getDailyMenuItemByDate = async (socket: Socket, data: any): Promise<void> => {
        const { date } = data;

        console.log("getDailyMenuItemByDate date", date)
        try {
            const dailyMenuItem = await this.dailyMenuItemService.getDailyMenuItemByDate(date);

            console.log('dailyMenuItem-------------------', dailyMenuItem)
            socket.emit('getDailyMenuItemByDateSuccess', dailyMenuItem);
        } catch (error) {
            socket.emit('getDailyMenuItemByDateError', { error: error.message });
        }
    };
    public getDailyMenuItemById = async (socket: Socket, data: any): Promise<void> => {
        const { id } = data;
        try {
            const dailyMenuItem = await this.dailyMenuItemService.getDailyMenuItemById(+id);
            socket.emit('getDailyMenuItemByIdSuccess', dailyMenuItem);
        } catch (error) {
            socket.emit('getDailyMenuItemByIdError', { error: error.message });
        }
    };
    public getDailyMenuItems = async (socket: Socket): Promise<void> => {
        try {
            const dailyMenuItems = await this.dailyMenuItemService.getDailyMenuItems();
            socket.emit('getDailyMenuItemsSuccess', dailyMenuItems);
        } catch (error) {
            socket.emit('getDailyMenuItemsError', { error: error.message });
        }
    };
    public updateDailyMenuItem = async (socket: Socket, data: any): Promise<void> => {
        const { id, menu_id, item_id, quantity_prepared } = data;
        try {
            const dailyMenuItem = await this.dailyMenuItemService.updateDailyMenuItem(+id, menu_id, item_id, quantity_prepared);
            socket.emit('updateDailyMenuItemSuccess', dailyMenuItem);
        } catch (error) {
            socket.emit('updateDailyMenuItemError', { error: error.message });
        }
    };

    constructor() {
        this.dailyMenuItemService = new DailyMenuItemService();
    }
}

export default DailyMenuItemController;
