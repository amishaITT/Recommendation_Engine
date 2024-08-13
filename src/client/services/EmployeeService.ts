import { EmployeeRepository } from '../repositories/EmployeeRepository';
import { SocketController } from '../controllers/socketController';
import { askQuestion } from '../utils/inputUtils';

export class EmployeeService {
    private socketController: SocketController;
    private employeeRepository: EmployeeRepository;

    constructor(socketController: SocketController) {
        this.socketController = socketController;
        this.employeeRepository = new EmployeeRepository(socketController);
    }

    public async updateProfile(user: any) {
        const preferences = await this.promptPreferences();
        console.log('Preferences:------------------------', preferences);

        console.log('user-----',user)

        await this.employeeRepository.updateEmployeePreference(user.id, preferences.mealType, preferences.spiceLevel, preferences.category, preferences.sweetTooth);
    }

    private async promptPreferences() {
        const preferences = {
            mealType: '',
            spiceLevel: '',
            category: '',
            sweetTooth: ''
        };

        preferences.mealType = await askQuestion(
            'Please select meal type:\n1. System Default\n2. Vegetarian\n3. Non Vegetarian\n4. Eggetarian\nEnter your choice (1-4): '
        );
        preferences.mealType = this.mapChoiceToValue(preferences.mealType, ['system_default', 'vegetarian', 'non-vegetarian', 'eggetarian']);

        preferences.spiceLevel = await askQuestion(
            'Please select your spice level:\n1. System Default\n2. High\n3. Medium\n4. Low\nEnter your choice (1-4): '
        );
        preferences.spiceLevel = this.mapChoiceToValue(preferences.spiceLevel, ['system_default', 'high', 'medium', 'low']);

        preferences.category = await askQuestion(
            'What do you prefer most?\n1. System Default\n2. North Indian\n3. South Indian\n4. Other\nEnter your choice (1-4): '
        );
        preferences.category = this.mapChoiceToValue(preferences.category, ['system_default', 'north indian', 'south indian', 'other']);

        preferences.sweetTooth = await askQuestion(
            'Do you have a sweet tooth?\n1. System Default\n2. Yes\n3. No\nEnter your choice (1-3): '
        );
        preferences.sweetTooth = this.mapChoiceToValue(preferences.sweetTooth, [false, true, false]);

        return preferences;
    }

    private mapChoiceToValue(choice: string, values: any[]) {
        const index = parseInt(choice, 10) - 1;
        if (index >= 0 && index < values.length) {
            return values[index];
        }
        return values[0]; // Default to the first option if the input is invalid
    }

    public async discardItemFeedback(user: any) {
        const discardRollOutItem = await this.employeeRepository.showDiscardMenuItem();

        if (!discardRollOutItem) {
            console.log('No discard items to provide feedback for.');
            return;
        }
        const isAlreadyProvidedFeedback = await this.employeeRepository.getDiscardFeedbacksByCondition(discardRollOutItem.item_id, user.id);

        if (isAlreadyProvidedFeedback) {
            console.log(`You have already provided feedback for ${discardRollOutItem.item_name}`);
            return;
        }

        const answers = await this.promptDiscardItemFeedback(discardRollOutItem);

        console.log('answers----------', answers)
        await this.employeeRepository.createDiscardFeedback(discardRollOutItem.item_id, user.id, answers.answers1, answers.answers2, answers.answers3);
    }

    private async promptDiscardItemFeedback(discardRollOutItem: any) {
        const answers1 = await askQuestion(`Q1. What didn’t you like about ${discardRollOutItem.item_name}?\n>`);
        const answers2 = await askQuestion(`Q2. How would you like ${discardRollOutItem.item_name} to taste?\n>`);
        const answers3 = await askQuestion(`Q3. Share your mom’s recipe.\n>`);

        return {
            answers1, answers2, answers3
        };
    }

    public async giveFeedback(user: any) {
        try {
            const currentDate = new Date().toISOString().split('T')[0];
            const dailyMenuItems = await this.employeeRepository.getDailyMenuItemByDate(currentDate) as any;

            if (!dailyMenuItems || dailyMenuItems?.length === 0) {
                console.log('No menu items found for today');
                return null;
            }

            console.table(dailyMenuItems);

            const item_id = await this.promptUserForFeedbackItems();
            const selectedItem = dailyMenuItems.filter((item: any) => item.id == item_id)[0];

            const isAlreadyProvidedFeedback = await this.employeeRepository.isAlreadyProvidedFeedback(selectedItem.category, user);

            if (isAlreadyProvidedFeedback) {
                console.log(`You have already voted for ${selectedItem.name}`);
                return null;
            }

            const employeeFeedback = await this.promptFeedback();

            const feedback = {
                item_id: parseInt(selectedItem.id),
                user_id: parseInt(user.id),
                rating: +employeeFeedback.rating,
                comment: employeeFeedback.comment,
                feedback_date: new Date().toISOString().split('T')[0],
            };

            await this.employeeRepository.createFeedback(feedback.item_id + '', feedback.user_id + '', feedback.rating, feedback.comment, feedback.feedback_date, selectedItem.category);
            console.log('Feedback submitted successfully');
            return true;
        } catch (error: any) {
            console.error('Error submitting feedback:', error.message);
            throw error;
        }
    }

    private async promptFeedback(): Promise<{ rating: number, comment: string }> {
        const rating = await askQuestion('Enter rating (1-5): ');
        const comment = await askQuestion('Enter comment: ');

        return { rating: +rating, comment };
    }

    private async promptUserForFeedbackItems() {
        const selectedItem = await askQuestion('Enter item ID: ');
        return selectedItem;
    }

    public async chooseItem(user: any) {
        const date = new Date().toISOString().split('T')[0];

        this.socketController.emit('getNotificationByDate', { user });

        const data = await new Promise((resolve) => {
            this.socketController.on('getNotificationByDateSuccess', (data) => {
                resolve(data.notification);
            });
        }) as any;

        const firstNotificationData = data;
        console.log('data--------------------------', data);
        console.table(firstNotificationData);

        await this.getUserInput(firstNotificationData, user);
    }

    private async getUserInput(firstNotificationData: any, user: any) {
        try {
            const action = await askQuestion('Enter item ID: ');
            const selectedItem = firstNotificationData.filter((item: any) => item.item_id == action)[0];
            const category = selectedItem.category;

            const isAlreadyProvidedFeedback = await this.employeeRepository.isAlreadyVoted(selectedItem.category, user);

            if (isAlreadyProvidedFeedback) {
                console.log(`You have already voted for ${selectedItem.category}`);
                return;
            }

            await this.employeeRepository.vote(category, user, selectedItem.item_id);
            console.log('Voted successfully');
        } catch (error) {
            console.error('Error getting user input:', error);
            throw error;
        }
    }

    public async viewMenu() {
        this.socketController.emit("viewMenu");

        await new Promise((resolve) => {
            this.socketController.on("menuItemSuccess", (menuItem) => {
                console.table(menuItem);
                resolve(menuItem)
            });
        })
    }

    public async viewNotification(user) {
        this.socketController.emit('getNotificationByDate', { user });

        const data = await new Promise((resolve) => {
            this.socketController.on('getNotificationByDateSuccess', (data) => {
                resolve(data.notification);
            });
        }) as any;

        console.table(data);
    }
}