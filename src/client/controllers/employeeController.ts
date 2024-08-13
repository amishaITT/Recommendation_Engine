import { EmployeeService } from '../services/EmployeeService';
import { SocketController } from './socketController';
import { askQuestion } from '../utils/inputUtils';

export class EmployeeController {
    private employeeService: EmployeeService;

    constructor(socketController: SocketController) {
        this.employeeService = new EmployeeService(socketController);
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
            6. Update profile
            7. Exit
            Enter action number: `);

            switch (action.trim()) {
                case '1':
                    console.log("Entering view menu");
                    await this.employeeService.viewMenu();
                    break;
                case '2':
                    await this.employeeService.viewNotification(user);
                    break;
                case '3':
                    await this.employeeService.chooseItem(user);
                    break;
                case '4':
                    await this.employeeService.giveFeedback(user);
                    break;
                case '5':
                    await this.employeeService.discardItemFeedback(user);
                    break;
                case '6':
                    await this.employeeService.updateProfile(user);
                    break;
                case '7':
                    console.log('Exiting Employee Panel');
                    exit = true;
                    break;
                default:
                    console.log('Invalid option');
            }
        }
    }
}