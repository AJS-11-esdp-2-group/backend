import db from "../db/db";

const nextOrderNumbers = async(amount: number) => {
    const lastOrderNumber = (await db.query(`select id, order_number from orders order by id DESC limit 1`)).rows[0].order_number;
    
    if(!lastOrderNumber) {
        let numbers = [];
        for (let i = 1; i <= amount; i++) {
            numbers.push('av-' + i.toString().padStart(4, '0'));
        }

        return numbers;
    };
    
    const numberString = lastOrderNumber.slice(3);
    const number = parseInt(numberString);
    
    let numbers = [];
    for (let i =1; i <= amount; i++) {
        numbers.push('av-' + (i+number).toString().padStart(4, '0'));
    }

    return numbers;
};

export default nextOrderNumbers;