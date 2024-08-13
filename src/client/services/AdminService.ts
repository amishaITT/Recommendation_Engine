import { AdminRepository } from '../repositories/AdminRepository';
import { SocketController } from '../controllers/socketController';
import { askQuestion } from '../utils/inputUtils';

export class AdminService {
  private socketController: SocketController;
  private adminRepository: AdminRepository;

  constructor(socketController: SocketController) {
    this.socketController = socketController;
    this.adminRepository = new AdminRepository(socketController);
  }

  public async addMenu() {
    const itemID = await askQuestion('Enter Menu ID: ');
    const itemName = await askQuestion('Enter Menu Name: ');
    const itemCategory = await askQuestion('Enter Menu Category: ');
    const itemPrice = await askQuestion('Enter Menu Price: ');
    const itemAvailability = await askQuestion('Enter Menu Availability Status: ');

    console.log("Item:", { id: itemID, name: itemName, category: itemCategory, price: itemPrice, availability: itemAvailability });

    this.adminRepository.addMenu({ id: itemID, name: itemName, category: itemCategory, price: itemPrice, availability: itemAvailability });
    console.log("Item added after emit");
  }

  public async deleteMenu() {
    const menuId = await askQuestion('Enter Menu ID to delete: ');
    this.adminRepository.deleteMenu(parseInt(menuId));
  }

  public async updateMenu() {
    const menuId = await askQuestion('Enter Menu ID to update: ');
    const name = await askQuestion('Enter new name: ');
    const category = await askQuestion('Enter new category: ');
    const price = await askQuestion('Enter new price: ');
    const availability = await askQuestion('Enter new availability: ');

    this.adminRepository.updateMenu({ id: parseInt(menuId), name, category, price, availability });
  }

  public async viewMenu() {
    this.adminRepository.viewMenu();

    await new Promise((resolve) => {
      this.socketController.on("menuItemSuccess", (menuItem) => {
        console.table(menuItem);
        resolve(menuItem)
      });
    })
  }
}