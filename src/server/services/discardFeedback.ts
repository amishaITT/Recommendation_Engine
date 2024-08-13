import DiscardFeedback from '../models/discardFeedback';

class DiscardFeedbackService {
    private async checkDiscardFeedback(user_id: number, item_id: number, date: string) {
        try {
            const feedback = await DiscardFeedback.findOne({ where: { user_id, item_id, date } });
            return feedback;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async createDiscardFeedback(user_id: number, item_id: number, date: string, question1: string, question2: string, question3: string) {
        try {

            console.log("item_id, user_id, answers1, answers2, answers3------------------", question1, question2, question3 )
            const existingFeedback = await this.checkDiscardFeedback(user_id, item_id, date);
            console.log("existingFeedback----------", existingFeedback)
            if (existingFeedback) {
                throw new Error('You have already provided feedback for this item today');
            }
            const feedback = await DiscardFeedback.create({ user_id, item_id, date, question1, question2, question3 });
            return feedback;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteDiscardFeedback(id: number) {
        try {
            const feedback = await DiscardFeedback.findByPk(id);
            if (!feedback) {
                throw new Error('Feedback not found');
            }
            await feedback.destroy();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getDiscardFeedbackById(id: number) {
        try {
            const feedback = await DiscardFeedback.findByPk(id);
            if (!feedback) {
                throw new Error('Feedback not found');
            }
            return feedback;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getDiscardFeedbacks() {
        try {
            const feedbacks = await DiscardFeedback.findAll();
            return feedbacks;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getDiscardFeedbacksByCondition(user_id: number, item_id: number, date: string) {
        try {
            const feedback = await DiscardFeedback.findOne({ where: { user_id, item_id, date } });

            if (feedback) {
                return true;
            }

            return false;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getMonthlyDiscardFeedbacks() {
        const date = new Date().toISOString().slice(0, 7);
        try {
            const feedbacks = await DiscardFeedback.findAll({ where: { date } });

            return feedbacks.map((feedback) => {
                return {
                    id: feedback.id,
                    user_id: feedback.user_id,
                    item_id: feedback.item_id,
                    date: feedback.date,
                    question1: feedback.question1,
                    question2: feedback.question2,
                    question3: feedback.question3,
                };
            });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateDiscardFeedback(id: number, question1: string, question2: string, question3: string) {
        try {
            const feedback = await DiscardFeedback.findByPk(id);
            if (!feedback) {
                throw new Error('Feedback not found');
            }
            feedback.question1 = question1;
            feedback.question2 = question2;
            feedback.question3 = question3;
            await feedback.save();
            return feedback;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default DiscardFeedbackService;
