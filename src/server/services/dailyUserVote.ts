import DailyUserVote from "../models/dailyUserVote";

class DailyUserVoteService {
    private async checkUserVote(user_id: number, category: string, date: string) {
        try {
            const vote = await DailyUserVote.findOne({ where: { user_id, category, date } });
            return vote;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async createUserVote(user_id: number, category: string, date: string) {
        try {
            const existingVote = await this.checkUserVote(user_id, category, date);
            if (existingVote) {
                throw new Error("You have already voted for this category today");
            }
            const vote = await DailyUserVote.create({ user_id, category, date });
            return vote;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteUserVote(id: number) {
        try {
            const vote = await DailyUserVote.findByPk(id);
            if (!vote) {
                throw new Error("Vote not found");
            }
            await vote.destroy();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getUserVoteById(id: number) {
        try {
            const vote = await DailyUserVote.findByPk(id);
            if (!vote) {
                throw new Error("Vote not found");
            }
            return vote;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getUserVotes() {
        try {
            const votes = await DailyUserVote.findAll();
            return votes;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getUserVotesByCondition(user_id: number, category: string, date: string) {
        try {
            const votes = await DailyUserVote.findOne({ where: { user_id, date, category } });

            console.log('getUserVotesByCondition-----------------', user_id, date, category, votes)

            if (votes) {
                return true;
            }

            return false;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateUserVote(id: number, category: string) {
        try {
            const vote = await DailyUserVote.findByPk(id);
            if (!vote) {
                throw new Error("Vote not found");
            }
            vote.category = category;
            await vote.save();
            return vote;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default DailyUserVoteService;