import { SocketController } from '../controllers/socketController';
import { ChefRepository } from '../repositories/ChefRepository';
import { askQuestion } from '../utils/inputUtils';

export class ChefService {
  private chefRepository: ChefRepository;
  private socketController: SocketController;

  constructor(socketController: SocketController) {
    this.socketController = socketController;
    this.chefRepository = new ChefRepository(socketController);
  }

  public async viewMenu() {
    this.chefRepository.viewMenu();

    await new Promise((resolve) => {
      this.socketController.on("menuItemSuccess", (menuItem) => {
        console.table(menuItem);
        resolve(menuItem)
      });
    })
  }

  public async rolloutItems(category: string) {
    await this.chefRepository.getTopRecommendations(category);

    const rolloutItemId = await askQuestion("Enter ID to add to rollout: ");
    this.chefRepository.addRolloutItem(category, rolloutItemId);
  }

  public async getRolloutItems() {
    await this.chefRepository.getRolloutItems();
  }

  public async submitDailyMenu(category: string) {
    const menu_type = this.mapCategoryToMenuType(category);
    const menu_date = new Date().toISOString().split('T')[0];

    const alreadyExists = await this.chefRepository.checkExistingDailyMenu(menu_date, menu_type);

    console.log("alreadyExists-----------", alreadyExists)

    if (!alreadyExists.create && !alreadyExists.modify) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const vote_date = yesterday.toISOString().split('T')[0];

    const topVotedItems = await this.chefRepository.getVoteItemsByDate(menu_type, vote_date);

    if (!topVotedItems.length) {
      console.log("No one has voted yet, please wait!");
      return;
    }

    console.table(topVotedItems);

    const dailyMenuItem = await this.promptDailyMenu();

    if (alreadyExists.create) {
      this.chefRepository.createDailyMenuSubmission(menu_date, menu_type, dailyMenuItem.item_id, dailyMenuItem.quantity);
    } else if (alreadyExists.modify) {
      this.chefRepository.updateDailyMenuSubmission(menu_date, menu_type, dailyMenuItem.item_id, dailyMenuItem.quantity);
    }
  }

  public async viewDiscardableItems(category: string) {
    const menu_type = this.mapCategoryToMenuType(category);
    const choice = await this.promptDiscardChoice(menu_type);
    console.log('choice--------------------',choice)
    if (choice === 'Exit') {
      return;
    }

    const selectedItem = await this.chefRepository.promptDiscardItems(menu_type);

    console.log('selectedItem-------------', selectedItem)

    if (!selectedItem) {
      console.log('No discardable items found');
      return;
    }

    if (choice === 'Discard Item') {
      this.chefRepository.discardItem(selectedItem);
    } else if (choice === 'Ask employees for feedback') {
      await this.chefRepository.discardRollout(selectedItem);
    }

    return
  }

  public async viewDiscardItemFeedback() {
    const discardItemFeedbacks = await this.chefRepository.getMonthlyDiscardFeedbacks();
    console.log('Discard item feedbacks are:');
    console.table(discardItemFeedbacks);
  }

  private mapCategoryToMenuType(category: string): string {
    return category === '1' ? 'breakfast' : category === '2' ? 'lunch' : 'dinner';
  }

  private async promptDailyMenu(): Promise<{ item_id: number, quantity: number }> {
    const item_id = await askQuestion('Enter item ID: ');
    const quantity = await askQuestion('Enter quantity: ');
    return { item_id: +item_id, quantity: +quantity };
  }

  private async promptDiscardChoice(menu_type: string): Promise<string> {
    const choice = await askQuestion(`
      1> Discard Item
      2> Ask employees for feedback
      3> Exit`);

    return choice === '1' ? 'Discard Item' : choice === '2' ? 'Ask employees for feedback' : 'Exit';
  }
}