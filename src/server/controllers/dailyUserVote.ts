import { Socket } from 'socket.io';
import DailyUserVoteService from '../services/dailyUserVote';
import VoteItemService from '../services/voteItem';

class DailyUserVoteController {
    private DailyUserVoteService: DailyUserVoteService;
    private voteItemService: VoteItemService;
    
    public createUserVote = async (socket: Socket, data: any): Promise<void> => {
        const { category } = data;
        const { id: user_id } = data.user
        const date = new Date().toISOString().split('T')[0];

        try {
            const vote = await this.DailyUserVoteService.createUserVote(user_id, category, date);
            await this.voteItemService.vote(data.menu_id, category, date);

            socket.emit('createUserVoteSuccess', vote);
        } catch (error) {
            socket.emit('createUserVoteError', { message: error.message });
        }
    };
    public deleteUserVote = async (socket: Socket, data: any): Promise<void> => {
        const { id } = data;
        try {
            await this.DailyUserVoteService.deleteUserVote(id);
            socket.emit('deleteUserVoteSuccess');
        } catch (error) {
            socket.emit('deleteUserVoteError', { error: error.message });
        }
    };
    public getUserVoteById = async (socket: Socket, data: any): Promise<void> => {
        const { id } = data;
        try {
            const vote = await this.DailyUserVoteService.getUserVoteById(id);
            socket.emit('getUserVoteByIdSuccess', vote);
        } catch (error) {
            socket.emit('getUserVoteByIdError', { error: error.message });
        }
    };
    public getUserVotes = async (socket: Socket): Promise<void> => {
        try {
            const votes = await this.DailyUserVoteService.getUserVotes();
            socket.emit('getUserVotesSuccess', votes);
        } catch (error) {
            socket.emit('getUserVotesError', { error: error.message });
        }
    };
    public getUserVotesByCondition = async (socket: Socket, data: any): Promise<void> => {
        const { category } = data;
        const { id: user_id } = data.user;
        const date = new Date().toISOString().split('T')[0];
        try {
            const isAlreadVoted = await this.DailyUserVoteService.getUserVotesByCondition(user_id, category, date);
            socket.emit('getUserVotesByConditionSuccess', isAlreadVoted);
        } catch (error) {
            socket.emit('getUserVotesByConditionError', { message: error.message });
        }
    };
    public updateUserVote = async (socket: Socket, data: any): Promise<void> => {
        const { id, category } = data;
        try {
            const vote = await this.DailyUserVoteService.updateUserVote(id, category);
            socket.emit('updateUserVoteSuccess', vote);
        } catch (error) {
            socket.emit('updateUserVoteError', { error: error.message });
        }
    };

    constructor() {
        this.DailyUserVoteService = new DailyUserVoteService();
        this.voteItemService = new VoteItemService();
    }
}

export default DailyUserVoteController;