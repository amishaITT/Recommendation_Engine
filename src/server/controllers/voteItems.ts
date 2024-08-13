import { Socket } from 'socket.io';
import VoteItemService from '../services/voteItem';
import MenuItemService from '../services/menuItem';

class VoteItemController {
    private voteItemService: VoteItemService;

    constructor() {
        this.voteItemService = new VoteItemService();
    }

    public createVoteItem = async (socket: Socket, data: any): Promise<void> => {
        const { menu_id, category } = data;
        const date = new Date().toISOString().split('T')[0]
        try {
            const voteItem = await this.voteItemService.createVoteItem(menu_id, category, date);
            socket.emit('createVoteItemSuccess', voteItem);
        } catch (error) {
            socket.emit('createVoteItemError', { error: error.message });
        }
    };

    public getVoteItems = async (socket: Socket, data): Promise<void> => {
        const menuItemService = new MenuItemService();


        const { category } = data;
        const date = new Date().toISOString().split('T')[0];
        try {
            const voteItems = await this.voteItemService.getVoteItemsByDateAndCategory(date, category);

            const items = await Promise.all(voteItems.map(async (item) => {
                const menuItem = await menuItemService.getMenuItemById(item.menu_id);
                return {
                    id: item.id,
                    item_name: menuItem.name,
                    date: item.date,
                    category: item.category,
                    votes: item.votes,
                }
            }));

            console.log('items', items)

            socket.emit('getVoteItemsSuccess', items);
        } catch (error) {
            socket.emit('getVoteItemsError', { message: error.message });
        }
    };

    public getVoteItemById = async (socket: Socket, data: any): Promise<void> => {
        const { id } = data;
        try {
            const voteItem = await this.voteItemService.getVoteItemById(+id);
            socket.emit('getVoteItemByIdSuccess', voteItem);
        } catch (error) {
            socket.emit('getVoteItemByIdError', { error: error.message });
        }
    };

    public updateVoteItem = async (socket: Socket, data: any): Promise<void> => {
        const id = data.id;
        const { menu_id, date, votes } = data.voteItem;

        try {
            const voteItem = await this.voteItemService.updateVoteItem(+id, { menu_id, date, votes });
            socket.emit('updateVoteItemSuccess', voteItem);
        } catch (error) {
            socket.emit('updateVoteItemError', { error: error.message });
        }
    };

    public deleteVoteItem = async (socket: Socket, data: any): Promise<void> => {
        const { id } = data;
        try {
            await this.voteItemService.deleteVoteItem(+id);
            socket.emit('deleteVoteItemSuccess');
        } catch (error) {
            socket.emit('deleteVoteItemError', { error: error.message });
        }
    };

    public vote = async (socket: Socket, data: any): Promise<void> => {
        console.log('vote event', data)
        const menu_id = data.item_id;
        const category = data.category;
        const date = new Date().toISOString().split('T')[0];

        try {
            const voteItem = await this.voteItemService.vote(menu_id, category, date);
            socket.emit('voteSuccess', voteItem);
        } catch (error) {
            socket.emit('voteError', { error: error.message });
        }
    };

    public getVoteItemsByDate = async (socket: Socket, data): Promise<void> => {
        const menuItemService = new MenuItemService();
        const { category, date } = data;
        try {
            const voteItems = await this.voteItemService.getVoteItemsByDateAndCategory(date, category);

            console.log('voteItems', voteItems)

            const items = await Promise.all(voteItems.map(async (item) => {
                const menuItem = await menuItemService.getMenuItemById(item.menu_id);
                return {
                    id: item.menu_id,
                    name: menuItem.name,
                    date: item.date,
                    category: item.category,
                    votes: item.votes,
                }
            }));

            console.log('items', items)

            socket.emit('getVoteItemsByDateSuccess', items);
        } catch (error) {
            socket.emit('getVoteItemsByDateError', { message: error.message });
        }
    };
}

export default VoteItemController;