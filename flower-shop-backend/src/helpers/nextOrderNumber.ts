import db from "../db/db";

const nextOrderNumbers = async(amount: number) => {
    const lastOrderNumbers = (await db.query(`select id, order_number from orders order by id DESC limit 50`)).rows;
    
    if(!lastOrderNumbers.length) {
        let numbers = [];
        for (let i = 1; i <= amount; i++) {
            numbers.push('av-' + i.toString().padStart(4, '0'));
        }

        return numbers;
    };
    
    const orderNumbers: Array<number> = lastOrderNumbers.map(order => {
        return parseInt(order.order_number.slice(3))
    });
    
    const maxNumber = Math.max(...orderNumbers);
    
    let numbers = [];
    for (let i =1; i <= amount; i++) {
        numbers.push('av-' + (i+maxNumber).toString().padStart(4, '0'));
    }
    
    return numbers;
};

export default nextOrderNumbers;