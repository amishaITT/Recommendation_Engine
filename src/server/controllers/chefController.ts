import { insertRolloutItem, getRolloutItmes } from "../repositories/chefRepository"


const addToRolloutMenu = async(item_id: number) => {
    return await insertRolloutItem(item_id)
}



const viewRolloutItems = async() => {
    return await getRolloutItmes()
}

export default {addToRolloutMenu, viewRolloutItems}