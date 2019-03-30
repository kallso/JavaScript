let bills = [124, 48, 268];

function calculateTip (array) {
    let tips = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] < 50) {
            tips[i] = array[i] * 0.2;
        }
        else if (array[i] > 50 && array[i] < 200) {
            tips[i] = array[i] * 0.15;
        }
        else {
            tips[i] = array[i] * 0.1;
        }
    }
    return tips;
}

function calculateTotal (array1, array2) {
    let total = [];
    for (let i = 0; i < array1.length; i++) {
        total[i] = array1[i] + array2[i];   
    }
    return total;
}

let tips = calculateTip(bills);
console.log(tips);

console.log(calculateTotal(bills,tips));