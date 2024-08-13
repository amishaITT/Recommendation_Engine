import { SocketController } from '../controllers/socketController';
import { askQuestion } from '../utils/inputUtils';

export class ChefRepository {
  private socketController: SocketController;

  constructor(socketController: SocketController) {
    this.socketController = socketController;
  }

  public viewMenu() {
    this.socketController.emit("viewMenu");
  }

  public async getRolloutItems() {
    this.socketController.emit('getRolloutItems');

    await new Promise((resolve) => {
      this.socketController.on("getRolloutItemsSuccess", (menuItem) => {
        console.table(menuItem);
        resolve(menuItem)
      });
    })
  }

  public async getTopRecommendations(menu_type: string) {
    return new Promise((resolve, reject) => {
      this.socketController.emit('getRecommendedItems', { menu_type });

      this.socketController.on('getRecommendedItemsSuccess', resolve);
      this.socketController.on('getRecommendedItemsError', error => reject(new Error(error.message || 'Failed to fetch recommended menu items')));
    });
  }

  public addRolloutItem(category: string, rolloutItemId: string) {
    this.socketController.emit('createNotification', { category, rolloutItemId });

    this.socketController.on('createNotificationSuccess', () => {
      this.socketController.emit('addRolloutItem', { rolloutItemId });
    });
  }

  public async checkExistingDailyMenu(date: string, menu_type: string) {
    return new Promise<{ create: boolean, modify: boolean }>((resolve, reject) => {
      this.socketController.emit('getDailyItemSubmissionByDate', { date });

      this.socketController.once('getDailyItemSubmissionByDateSuccess', (response) => {
        if (!response) {
          resolve({ create: true, modify: false });
        } else if (response[menu_type]) {
          resolve({ create: false, modify: false });
        } else {
          resolve({ create: false, modify: true });
        }
      });

      this.socketController.once('getDailyItemSubmissionByDateError', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  public createDailyMenuSubmission(menu_date: string, menu_type: string, item_id: number, quantity: number) {
    this.socketController.emit('createDailyItemSubmission', { date: menu_date, menu_type });

    this.createItemSubmissionListener(item_id, quantity);
  }

  public updateDailyMenuSubmission(menu_date: string, menu_type: string, item_id: number, quantity: number) {
    this.socketController.emit('updateDailyItemSubmission', { date: menu_date, menu_type });

    this.updateItemSubmissionListener(item_id, quantity);
  }

  private async createItemSubmissionListener(item_id: number, quantity: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const successHandler = () => {
        this.socketController.emit('createDailyMenuItem', { item_id, quantity });
        resolve();
      };

      const errorHandler = (error: any) => {
        reject(error);
      };

      this.socketController.once('createDailyItemSubmissionSuccess', successHandler);
      this.socketController.once('createDailyItemSubmissionError', errorHandler);
    });
  }

  private async updateItemSubmissionListener(item_id: number, quantity: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const successHandler = () => {
        this.socketController.emit('createDailyMenuItem', { item_id, quantity });
        resolve();
      };

      const errorHandler = (error: any) => {
        reject(error);
      };

      this.socketController.once('updateDailyItemSubmissionSuccess', successHandler);
      this.socketController.once('updateDailyItemSubmissionError', errorHandler);
    });
  }

  public async getVoteItemsByDate(category: string, date: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.socketController.emit('getVoteItemsByDate', { category, date });

      this.socketController.once('getVoteItemsByDateSuccess', resolve);
      this.socketController.once('getVoteItemsByDateError', (error) => {
        reject(new Error(error.message || 'Failed to fetch voted items'));
      });
    });
  }

  public async getMonthlyDiscardFeedbacks(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.socketController.emit('getMonthlyDiscardFeedbacks');

      this.socketController.once('getMonthlyDiscardFeedbacksSuccess', resolve);
      this.socketController.once('getMonthlyDiscardFeedbacksError', (error) => {
        reject(new Error(error.message || 'Failed to fetch discard feedback'));
      });
    });
  }

  public async promptDiscardItems(menu_type: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socketController.emit('getDiscardableItems', { menu_type });

      this.socketController.on('getDiscardableItemsSuccess', async (menuItems)=>{
        if (!menuItems.length) {
          return null;
          }
          
          console.log('Discardable items for', menu_type, 'are:')
          console.table(menuItems);
          
          const selectedItems = await askQuestion('Select Item ID:\n');
          
          resolve(menuItems.filter((menuItem)=>{
            return menuItem.id == +selectedItems;
          })[0]);
      });
      this.socketController.on('getDiscardableItemsError', reject);
    });
  }

  public discardItem(selectedItem: any) {
    this.socketController.emit('discardItem', selectedItem);
  }

  async discardRollout(selectedItem) {
    return new Promise<void>((resolve) => {
      this.socketController.off('canCreateDiscardRollOutSuccess')

      this.socketController.emit('canCreateDiscardRollOut')

      this.socketController.on('canCreateDiscardRollOutSuccess', async (canCreateDiscardRollOut) => {
        if (canCreateDiscardRollOut) {
          this.socketController.emit('createDiscardRollOut', { items: selectedItem });
          console.log('Discard rollout created successfully');
        } else {
          console.log('Cannot create discard rollout as it has already been created for this month');
        }
        resolve();
      })
    })
  }
}