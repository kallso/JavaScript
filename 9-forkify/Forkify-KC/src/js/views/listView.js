import { elements } from './base';

// Make text area of ingredient description auto-size
const textareaAutoSize = () => {
    const textarea = elements.shoppingList.lastElementChild.querySelector('textarea');
    
    textarea.setAttribute('style', `height: ${textarea.scrollHeight}px; overflow-y: hidden;`);
    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
};

export const renderItem = item => {
    const markup = `
        <li class="shopping__item" draggable="true" data-itemid=${item.id}>
            <div class="shopping__count">
                <input type="number" value="${item.count}" step="${item.count}" min="0" class="shopping__count-value">
                <input type="text" class="shopping__unit-value" value="${item.unit}">
            </div>
            <textarea class="shopping__description" spellcheck="false">${item.ingredient}</textarea>
            <button class="shopping__delete btn-tiny">
                <svg>
                    <use href="img/icons.svg#icon-circle-with-cross"></use>
                </svg>
            </button>
        </li>
    `;
    elements.shoppingList.insertAdjacentHTML('beforeend', markup);
    textareaAutoSize();
};

export const deleteItem = id => {
    const item = document.querySelector(`[data-itemid="${id}"]`);
    if (item) item.parentElement.removeChild(item);
};

export const clearShopping = () => {
    elements.shoppingList.innerHTML = '';
};

export const hideClearBtn = () => {
    elements.shoppingClearBtn.style.display = 'none';
};

export const showClearBtn = () => {
    elements.shoppingClearBtn.style.display = 'inline-block';
};