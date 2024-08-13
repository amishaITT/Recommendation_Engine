import MenuItem from "../models/notification";
import Notification from "../models/notification";
import EmployeePreferencesService from "./employeePreferences";
import MenuAttributesService from "./menuAttributes";
import MenuItemService from "./menuItem";

const menuItemService = new MenuItemService()
const employeePreferencesService = new EmployeePreferencesService()
const menuAttributesService = new MenuAttributesService()


class NotificationService {
    async createNotification(notification_type: 'new_breakfast_menu' | 'new_lunch_menu' | 'new_dinner_menu' | 'item_added' | 'item_status_change', notification_data: any, notification_timestamp: string) {
        try {
            const notification = await Notification.create({
                notification_type,
                notification_data,
                notification_timestamp,
            });
            return notification;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getNotifications() {
        try {
            const notifications = await Notification.findAll();
            return notifications;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getNotificationById(notification_id: number) {
        try {
            const notification = await Notification.findByPk(notification_id);
            if (!notification) {
                throw new Error("Notification not found");
            }
            return notification;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // async getNotificationByDate(notification_timestamp: string) {
    //     try {
    //         const notifications = await Notification.findAll({ where: { notification_timestamp } });

    //         if (!notifications) {
    //             throw new Error("Notification not found");
    //         }

    //         const menuItemIds = notifications.flatMap(notification => {
    //             console.debug("Menu item ids", notification.notification_data)
    //             return +notification.notification_data
    //         });


    //         console.log(menuItemIds)


    //         const menuItems = await Promise.all(
    //             menuItemIds.map(async (menuItemId) => {
    //                 return await menuItemService.getMenuItemById(menuItemId);
    //             })
    //         )

    //         // const menuItemMap = new Map(menuItems.map(item => [item.item_id, item]));


    //         const notificationsWithDetails = notifications.map(notification => {
    //             const detailedItems = (notification.notification_data as number[]).map(id => menuItems);
    //             return {
    //                 ...notification.get({ plain: true }),
    //                 notification_data: detailedItems
    //             };
    //         });

    //         console.log("---------Notification details", notificationsWithDetails)

    //         return notificationsWithDetails;
    //     } catch (error: any) {
    //         throw new Error(error.message);
    //     }
    // }

    async getNotificationByDate(user) {
        try {
            const notification_timestamp = new Date().toISOString().split('T')[0];
            const notifications = await Notification.findAll({ where: { notification_timestamp } });

            const notification_data = notifications.flatMap((notification: any) => 
                notification.notification_data.map(data => parseInt(data, 10))
            );

            console.log('notifications-------------------', notifications);

            if (!notifications || notifications.length === 0) {
                throw new Error('No notifications found');
            }

            const menuItemIds = notifications.flatMap(notification => { return +notification.notification_data });

            console.log('menuItemIds------------------', menuItemIds)

            const menuItems = await Promise.all(
                menuItemIds.map(async (menuItemId) => {
                    return await menuItemService.getMenuItemById(menuItemId);
                })
            )

            console.log('menuItems------------------', menuItems)


            const menuItemMap = new Map(menuItems.map(item => [item.item_id, item]));
            const employeePreferences = await employeePreferencesService.getEmployeePreference(user.id);

            console.log('Creating notification details', menuItemMap);
            console.log("Getting map element: ", menuItemMap.get(10))

            const notificationsWithDetails = await Promise.all(
                ['1'].map(async () => {
                    console.log('Creating detailedItems');

                    const notification = notifications[0] as any

                    const detailedItems = await Promise.all(
                        (notification_data as number[]).map(async id => {
                            const menuItem = menuItemMap.get(id) as any;

                            if (!menuItem) {
                                console.error(`MenuItem with id ${id} not found in menuItemMap`);
                                return null;
                            }

                            const menuAttributes = await menuAttributesService.getMenuAttribute(menuItem.item_id);

                            if (!menuAttributes) {
                                console.error(`MenuAttributes not found for menuItem with id ${menuItem.item_id}`);
                                return null;
                            }

                            console.log('menuItem----------', menuItem);
                            console.log('menuAttributes----------', menuAttributes);

                            return {
                                item_id: menuItem.item_id,
                                name: menuItem.name,
                                description: menuItem.description,
                                category: menuItem.category,
                                price: menuItem.price,
                                spiceLevel: menuAttributes.spiceLevel,
                                mealType: menuAttributes.mealType,
                                sweetTooth: menuAttributes.sweetTooth,
                                region: menuAttributes.category,
                            };
                        })
                    );

                    const filteredItems = detailedItems.filter(item => item !== null);

                    if (filteredItems.length === 0) {
                        console.error(`No valid detailedItems found for notification with id ${notification.id}`);
                        return null;
                    }

                    console.log('detailedItems---------------------', filteredItems);
                    return {
                        ...notification.get({ plain: true }),
                        notification_data: await this.sortPreferences(employeePreferences, filteredItems),
                        recommendation: `You might like ${filteredItems[0].name} as you like ${employeePreferences.spiceLevel} spicy food`,
                    };
                })
            );

            console.log('Returning after Creating notification details', notificationsWithDetails);

            return notificationsWithDetails.filter(notification => notification !== null).flatMap(item => item.notification_data);
        } catch (error) {
            console.error('Error in getNotificationByDate:', error.message);
            throw new Error(error.message);
        }
    }


    private sortPreferences(employeePreferences, menuItems) {

        console.log('--------------------employeePreferences', employeePreferences)
        console.log('--------------------menuItems', menuItems)


        return new Promise((resolve) => {
            const sortItems = (a, b) => {
                if (a.mealType !== b.mealType) {
                    console.log('Sorting by meal type');
                    if (a.mealType === employeePreferences.mealType) return -1;
                    if (b.mealType === employeePreferences.mealType) return 1;
                }
                if (a.spiceLevel !== b.spiceLevel) {
                    console.log('Sorting by spice level');
                    if (a.spiceLevel === employeePreferences.spiceLevel) return -1;
                    if (b.spiceLevel === employeePreferences.spiceLevel) return 1;
                }
                if (a.region !== b.region) {
                    console.log('Sorting by category');
                    if (a.region === employeePreferences.category) return -1;
                    if (b.region === employeePreferences.category) return 1;
                }
                if (a.sweetTooth !== b.sweetTooth) {
                    console.log('Sorting by sweet tooth');
                    if (a.sweetTooth === employeePreferences.sweetTooth) return -1;
                    if (b.sweetTooth === employeePreferences.sweetTooth) return 1;
                }
                return 0;
            };
            
            const sortedItems = menuItems.sort(sortItems);
            console.log('sortedItems----------', sortedItems)
            resolve(sortedItems);
        });
    }

    async updateNotification(notification_id: number, notification_type: 'new_breakfast_menu' | 'new_lunch_menu' | 'new_dinner_menu' | 'item_added' | 'item_status_change', notification_data: any, notification_timestamp: string) {
        try {
            const notification = await Notification.findByPk(notification_id);
            if (!notification) {
                throw new Error("Notification not found");
            }
            notification.notification_type = notification_type;
            notification.notification_data = notification_data;
            notification.notification_timestamp = notification_timestamp;
            await notification.save();
            return notification;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async deleteNotification(notification_id: number) {
        try {
            const notification = await Notification.findByPk(notification_id);
            if (!notification) {
                throw new Error("Notification not found");
            }
            await notification.destroy();
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}

export default NotificationService;