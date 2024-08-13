import { SocketController } from '../controllers/socketController';

export class EmployeeRepository {
    private socketController: SocketController;

    constructor(socketController: SocketController) {
        this.socketController = socketController;
    }

    public async updateEmployeePreference(id: string, mealType: string, spiceLevel: string, category: string, sweetTooth: string) {
        this.socketController.emit('updateEmployeePreference', { id, mealType, spiceLevel, category, sweetTooth });
    }

    public async getDiscardFeedbacksByCondition(item_id: string, user_id: string): Promise<boolean> {
        this.socketController.emit('getDiscardFeedbacksByCondition', { item_id, user_id });

        return new Promise((resolve) => {
            this.socketController.once('getDiscardFeedbacksByConditionSuccess', (data) => {
                resolve(data.isAlreadyProvidedFeedback);
            });
        });
    }

    // public async showDiscardMenuItem(): Promise<any> {
    //     this.socketController.emit('showDiscardMenuItem');

    //     return new Promise((resolve) => {
    //         this.socketController.once('showDiscardMenuItemSuccess', (data) => {
    //             resolve(data.discardRollOutItem);
    //         });
    //     });
    // }

    public async showDiscardMenuItem() {
        const discardRollOutItem = await this.getDiscardRollOutByDate() as any;
        console.log('--- This Month\'s Discard Roll Out Item ---');
        console.table([discardRollOutItem])

        return discardRollOutItem;
    }

    public async getDiscardRollOutByDate() {
        return new Promise((resolve, reject) => {
            this.socketController.emit('getDiscardRollOutByDate');

            this.socketController.on('getDiscardRollOutByDateSuccess', (data) => {
                resolve(data);
            });

            this.socketController.on('getDiscardRollOutByDateError', (error: any) => {
                reject(new Error(error.message || 'Failed to fetch discard rollouts by date'));
            });
        });
    }


    public async createDiscardFeedback(item_id: string, user_id: string, answers1: string, answers2: string, answers3: string) {
        this.socketController.emit('createDiscardFeedback', { item_id, user_id, answers1, answers2, answers3 });
    }

    public async getDailyMenuItemByDate(date: string): Promise<any[]> {
        this.socketController.emit('getDailyMenuItemByDate', { date });

        return new Promise((resolve) => {
            this.socketController.once('getDailyMenuItemByDateSuccess', (data) => {
                resolve(data);
            });
        });
    }

    public async isAlreadyProvidedFeedback(category: string, user: any): Promise<boolean> {
        this.socketController.emit('getUserFeedbacksByCondition', { category, user });

        return new Promise((resolve) => {
            this.socketController.once('getUserFeedbacksByConditionSuccess', (data) => {
                resolve(data);
            });
        });
    }

    public async createFeedback(item_id: string, user_id: string, rating: number, comment: string, feedback_date: string, category: string) {
        this.socketController.emit('createFeedback', { item_id, user_id, rating, comment, feedback_date, category });
    }

    public async isAlreadyVoted(category: string, user: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.socketController.emit('getUserVotesByCondition', { category, user });

            this.socketController.on('getUserVotesByConditionSuccess', (data: boolean) => {
                resolve(data);
            });

            this.socketController.on('getUserVotesByConditionError', (error: any) => {
                reject(new Error(error.message || 'Failed to check if already voted'));
            });
        });
    }

    public async vote(category: string, user: any, menu_id: string) {
        return new Promise((resolve, reject) => {
            this.socketController.emit('createUserVote', { category, menu_id, user });

            this.socketController.on('createUserVoteSuccess', (data) => {
                resolve(data);
            });

            this.socketController.on('createUserVoteError', (error: any) => {
                reject(new Error(error.message || 'Failed to vote'));
            });
        });
    }
}