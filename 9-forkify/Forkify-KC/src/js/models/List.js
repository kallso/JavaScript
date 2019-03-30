import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }

    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);

        this.persistData();

        return item;
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id);
        // [2,4,8] splice(1, 2) -> returns [4, 8], original array is [2]
        // [2,4,8] slice(1, 2) -> returns 4, original array is [2,4,8]
        this.items.splice(index, 1);

        this.persistData();
    }

    deleteAllItems() {
        this.items = [];

        this.persistData();
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;

        this.persistData();
    }

    updateItem(id, type, value) {
        this.items.find(el => el.id === id)[type] = value;

        this.persistData();
    }

    persistData() {
        localStorage.setItem('shoppingList', JSON.stringify(this.items));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('shoppingList'));
        
        // Restoring likes from the localStorage
        if (storage && storage.length) this.items = storage;
    }
}