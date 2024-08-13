import { Socket } from 'socket.io';
import EmployeePreferencesService from '../services/employeePreferences';

class EmployeePreferencesController {
    private employeePreferencesService: EmployeePreferencesService;

    public createEmployeePreference = async (socket: Socket, data: any): Promise<void> => {
        const { userId, mealType, spiceLevel, category, sweetTooth } = data;
        try {
            const preference = await this.employeePreferencesService.createEmployeePreference(userId, mealType, spiceLevel, category, sweetTooth);
            socket.emit('createEmployeePreferenceSuccess', preference);
        } catch (error) {
            socket.emit('createEmployeePreferenceError', { error: error.message });
        }
    };

    public deleteEmployeePreference = async (socket: Socket, data: any): Promise<void> => {
        const { userId } = data;
        try {
            await this.employeePreferencesService.deleteEmployeePreference(userId);
            socket.emit('deleteEmployeePreferenceSuccess');
        } catch (error) {
            socket.emit('deleteEmployeePreferenceError', { error: error.message });
        }
    };
    public getAllEmployeePreferences = async (socket: Socket): Promise<void> => {
        try {
            const preferences = await this.employeePreferencesService.getAllEmployeePreferences();
            socket.emit('getAllEmployeePreferencesSuccess', preferences);
        } catch (error) {
            socket.emit('getAllEmployeePreferencesError', { error: error.message });
        }
    };
    public getEmployeePreference = async (socket: Socket, data: any): Promise<void> => {
        const { userId } = data;
        try {
            const preference = await this.employeePreferencesService.getEmployeePreference(userId);
            socket.emit('getEmployeePreferenceSuccess', preference);
        } catch (error) {
            socket.emit('getEmployeePreferenceError', { error: error.message });
        }
    };
    public updateEmployeePreference = async (socket: Socket, data: any): Promise<void> => {
        const { id: userId, mealType, spiceLevel, category, sweetTooth } = data;

        console.log("Got the preferences--------------",  userId, mealType, spiceLevel, category, sweetTooth)
        try {
            const preference = await this.employeePreferencesService.updateEmployeePreference(userId, mealType, spiceLevel, category, sweetTooth);
            socket.emit('updateEmployeePreferenceSuccess', preference);
        } catch (error) {
            socket.emit('updateEmployeePreferenceError', { error: error.message });
        }
    };

    constructor() {
        this.employeePreferencesService = new EmployeePreferencesService();
    }
}

export default EmployeePreferencesController;
