import EmployeePreferences from '../models/employeePreferences';

class EmployeePreferencesService {
    async createEmployeePreference(userId: number, mealType: 'vegetarian' | 'non-vegetarian' | 'eggetarian', spiceLevel: 'high' | 'medium' | 'low', category: 'north indian' | 'south indian' | 'other', sweetTooth: boolean) {
        try {
            const preference = await EmployeePreferences.create({ userId, mealType, spiceLevel, category, sweetTooth });
            return preference;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteEmployeePreference(userId: number) {
        try {
            const preference = await EmployeePreferences.findOne({ where: { userId } });
            if (!preference) {
                throw new Error('Employee preference not found');
            }
            await preference.destroy();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getAllEmployeePreferences() {
        try {
            const preferences = await EmployeePreferences.findAll();
            return preferences;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getEmployeePreference(userId: number) {
        try {
            const preference = await EmployeePreferences.findOne({ where: { userId } });
            if (!preference) {
                throw new Error('Employee preference not found');
            }
            return preference;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async initializePreferences(userId: number) {
        try {
            const preference = await EmployeePreferences.create({ userId });
            return preference;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateEmployeePreference(userId: number, mealType: 'vegetarian' | 'non-vegetarian' | 'eggetarian', spiceLevel: 'high' | 'medium' | 'low', category: 'north indian' | 'south indian' | 'other', sweetTooth: boolean) {
        try {
            const preference = await EmployeePreferences.findOne({ where: { userId } });
            if (!preference) {
                throw new Error('Employee preference not found');
            }
            preference.mealType = mealType;
            preference.spiceLevel = spiceLevel;
            preference.category = category;
            preference.sweetTooth = sweetTooth;
            await preference.save();

            console.log("New preferences-----------------------------------------------------",preference )
            return preference;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default EmployeePreferencesService;
