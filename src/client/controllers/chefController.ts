import { ChefService } from '../services/ChefService';
import { askQuestion } from '../utils/inputUtils';
import { SocketController } from './socketController';

export class ChefController {
  private chefService: ChefService;


  constructor(socketController: SocketController) {
    this.chefService = new ChefService(socketController);
  }

  public async handleUser(user: any) {
    console.log(`Welcome chef ${user.name}!`);
    while (true) {
      const action = await askQuestion(`
        Choose an action:
        1. View Menu
        2. Add rollout item
        3. View rollout item
        4. Submit daily menu 
        5. View discardable items
        6. View discard item feedback
        Enter action number: `);

      switch (action.trim()) {
        case '1':
          await this.chefService.viewMenu();
          break;
        case '2':
          await this.chefService.rolloutItems(await askQuestion(`
            Enter category to add to rollout: 
              1> Breakfast
              2> Lunch
              3> Dinner
            `));
          break;
        case '3':
          await this.chefService.getRolloutItems();
          break;
        case '4':
          await this.chefService.submitDailyMenu(await askQuestion(`
            Enter category to submit menu: 
              1> Breakfast
              2> Lunch
              3> Dinner
            `));
          break;
        case '5':
          await this.chefService.viewDiscardableItems(await askQuestion(`
            Enter category to view discardable items: 
              1> Breakfast
              2> Lunch
              3> Dinner
            `));
          break;
        case '6':
          await this.chefService.viewDiscardItemFeedback();
          break;
        default:
          console.log('Invalid option');
      }
    }
  }
}