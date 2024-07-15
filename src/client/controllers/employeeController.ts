import { askQuestion } from '../utils/inputUtils';
import { SocketController } from './socketController';

export class EmployeeController {
    private socketController: SocketController;

    constructor(socketController: SocketController) {
        this.socketController = socketController;
    }

    public async handleUser(user: any) {
        console.log(`Welcome ${user.name}!`);

        let exit = false;
        while (!exit) {
            const action = await askQuestion(`
        Choose an action:
        1. View Menu
        2. View notification
        3. Choose item for next day
        4. Give feedback
        5. Give feedback to discard item
        6. Exit
        Enter action number: `);

            switch (action.trim()) {
                case '1':
                    console.log("Entering view menu");
                    await this.viewMenu();
                    break;
                case '2':
                    this.socketController.emit('getRolloutItems');
                    break;
                case '3':
                    await this.chooseItem(user);
                    break;
                case '4':
                    await this.giveFeedback(user);
                    break;
                case '5':
                    await this.discardItemFeedback(user);
                    break;
                case '6':
                    console.log('Exiting Employee Panel');
                    exit = true;
                    break;
                default:
                    console.log('Invalid option');
            }
        }
    }

    private async discardItemFeedback(user: any) {
        const discardRollOutItem = await this.showDiscardMenuItem();
        const isAlreadyProvidedFeedback = await this.getDiscardFeedbacksByCondition(discardRollOutItem.item_id, user.id);

        if (isAlreadyProvidedFeedback) {
            console.log(`You have already provided feedback for ${discardRollOutItem.item_name}`);
            return;
        }

        const answers = await this.promptDiscardItemFeedback(discardRollOutItem);
        await this.createDiscardFeedback(discardRollOutItem.item_id, user.id, answers.answers1, answers.answers2, answers.answers3);
    }

    public async createDiscardFeedback(item_id: number, user_id: number, answer1: string, answer2: string, answer3: string){
        return new Promise((resolve, reject) => {
            this.socketController.emit('createDiscardFeedback', { item_id, user_id, answer1, answer2, answer3 });

            this.socketController.on('createDiscardFeedbackSuccess', (data) => {
                resolve(data);
            });

            this.socketController.on('createDiscardFeedbackError', (error: any) => {
                reject(new Error(error.message || 'Failed to create discard feedback'));
            });
        });
    }

    private async promptDiscardItemFeedback(discardRollOutItem: any) {
        const answers1 = await askQuestion(`Q1. What didn’t you like about ${discardRollOutItem.item_name}?\n>`)
        const answers2 = await askQuestion(`Q2. How would you like ${discardRollOutItem.item_name} to taste?\n>`)
        const answers3 = await askQuestion(`Q3. Share your mom’s recipe.\n>`)

        return {
            answers1, answers2,answers3
        }
    }

    public async getDiscardFeedbacksByCondition(item_id: number, user_id: number) {
        return new Promise((resolve, reject) => {
            this.socketController.emit('getDiscardFeedbacksByCondition', { item_id, user_id });

            this.socketController.on('getDiscardFeedbacksByConditionSuccess', (data) => {
                resolve(data);
            });

            this.socketController.on('getDiscardFeedbacksByConditionError', (error: any) => {
                reject(new Error(error.message || 'Failed to fetch discard feedbacks by condition'));
            });
        });
    }

    

    private async showDiscardMenuItem() {
        const discardRollOutItem = await this.getDiscardRollOutByDate() as any;
        console.log('--- This Month\'s Discard Roll Out Item ---', discardRollOutItem);
        console.table([discardRollOutItem])

        return discardRollOutItem;
    }

    public async getDiscardRollOutByDate(){
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

    async giveFeedback(user: any) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentDate = new Date().toISOString().split('T')[0];
                const dailyMenuItems = await this.getDailyMenuItemByDate(currentDate) as any;

                if (dailyMenuItems.length === 0) {
                    console.log('No menu items found for today');
                    resolve(null);
                }

                console.log('--- Daily Menu Items ---', dailyMenuItems);

                console.table(dailyMenuItems)

                const item_id = await this.promptUserForFeedbackItems();

                const selectedItem = dailyMenuItems.filter((item: any) => item.id == item_id)[0];

                console.log('selectedItem:', selectedItem.category)

                const isAlreadyProvidedFeedback = await this.isAlreadyProvidedFeedback(selectedItem.category, user);

                if (isAlreadyProvidedFeedback) {
                    console.log(`You have already voted for ${selectedItem.name}`);
                    resolve(null);
                }

                const employeeFeedback = await this.promptFeedback();

                console.log('selectedItem:', selectedItem)


                const feedback = {
                    item_id: parseInt(selectedItem.id),
                    user_id: parseInt(user.id),
                    rating: +employeeFeedback.rating,
                    comment: employeeFeedback.comment,
                    feedback_date: new Date().toISOString().split('T')[0],
                };

                await this.createFeedback(feedback.item_id, feedback.user_id, feedback.rating, feedback.comment, feedback.feedback_date, selectedItem.category);
                console.log('Feedback submitted successfully');
                resolve(true);
            } catch (error: any) {
                console.error('Error submitting feedback:', error.message);
                reject(error);
            }
        })
    }

    public async createFeedback(item_id: number, user_id: number, rating: number, comment: string, feedback_date: string, category: string) {
        return new Promise((resolve, reject) => {
            this.socketController.emit('createFeedback', { item_id, user_id, rating, comment, feedback_date, category });

            this.socketController.on('createFeedbackSuccess', (data) => {
                resolve(data);
            });

            this.socketController.on('createFeedbackError', (error: any) => {
                reject(new Error(error.message || 'Failed to create feedback'));
            });
        });
    }

    private async promptFeedback(): Promise<{ rating: number, comment: string }> {
        const rating = await askQuestion('Enter rating (1-5): ');
        const comment = await askQuestion('Enter comment: ');

        return { rating: +rating, comment };
    }

    private async isAlreadyProvidedFeedback(category: string, user: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.socketController.emit('getUserFeedbacksByCondition', { category, user });

            this.socketController.on('getUserFeedbacksByConditionSuccess', (data: boolean) => {
                resolve(data);
            });

            this.socketController.on('getUserFeedbacksByConditionError', (error: any) => {
                reject(new Error(error.message || 'Failed to check if already voted'));
            });
        });
    }

    private async promptUserForFeedbackItems() {
        const selectedItem = await askQuestion('Enter item ID: ');
        return selectedItem;
    }

    private async getDailyMenuItemByDate(date: string) {
        return new Promise((resolve, reject) => {
            this.socketController.emit('getDailyMenuItemByDate', { date });

            this.socketController.on('getDailyMenuItemByDateSuccess', (data) => {
                resolve(data);
            });

            this.socketController.on('getDailyMenuItemByDateError', (error: any) => {
                reject(new Error(error.message || 'Failed to fetch daily menu item'));
            });
        });
    }


    private async chooseItem(user: any) {
        const date = new Date().toISOString().split('T')[0];

        this.socketController.emit('getNotificationByDate', { date });

        const data = await new Promise((resolve) => {
            this.socketController.once('getNotificationByDateSuccess', (data) => {
                resolve(data.notification);
            });
        }) as any;

        const firstNotificationData = data[0].notification_data[0];

        console.table(firstNotificationData);

        await this.getUserInput(firstNotificationData, user);
    }

    private async getUserInput(firstNotificationData, user) {
        try {
            return new Promise(async (resolve) => {
                const action = await askQuestion('Enter item ID: ');

                const selectedItem = firstNotificationData.filter((item: any) => item.item_id == action)[0];
                const category = selectedItem.category;

                const isAlreadyProvidedFeedback = await this.isAlreadyVoted(selectedItem.category, user);

                if (isAlreadyProvidedFeedback) {
                    console.log(`You have already voted for ${selectedItem.category}`);
                    return;
                }

                await this.vote(category, user, selectedItem.item_id)

                console.log('Voted successfully');
                resolve(true)
            });
        } catch (error) {
            console.error('Error getting user input:', error);
            throw error;
        }
    }

    public async vote(category, user, menu_id) {
        return new Promise((resolve, reject) => {
            this.socketController.emit('createUserVote', { category, user, menu_id });

            this.socketController.on('createUserVoteSuccess', (data) => {
                resolve(data);
            });

            this.socketController.on('createUserVoteError', (error: any) => {
                reject(new Error(error.message || 'Failed to vote'));
            });
        });
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

    private async viewMenu() {
        this.socketController.emit("viewMenu");
    }
}
