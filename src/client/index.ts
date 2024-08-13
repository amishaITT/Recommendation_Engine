import { askQuestion } from './utils/inputUtils';
import { SocketController } from './controllers/socketController';
import { EmployeeController } from './controllers/employeeController';
import { ChefController } from './controllers/chefController';
import { AdminController } from './controllers/adminController';

const socketController = new SocketController();

socketController.on('connect', async () => {
  console.log('Connected to server');
  const employeeID = await askQuestion('Enter employee ID: ');
  const password = await askQuestion('Enter password: ');
  socketController.emit("login", { id: parseInt(employeeID), password });
});

socketController.on("login", (user) => {
  console.log("Login Successful");
  console.log(`Welcome ${user.name} to our system`);
  console.log(`Welcome ${user.role} to our system`);

  switch (user.role) {
    case "employee":
      new EmployeeController(socketController).handleUser(user);
      break;
    case "admin":
      new AdminController(socketController).handleUser(user);
      break;
    case 'chef':
      new ChefController(socketController).handleUser(user);
      break;
    default:
      console.log("Unknown role");
  }
});

socketController.on("itemAdded", (menuItem) => {
  console.log("Item added", menuItem);
});

socketController.on('getRecommendedItemsSuccess', (menuItems) => {
  console.table(menuItems);
});