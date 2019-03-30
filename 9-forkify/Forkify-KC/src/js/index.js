import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import { addDnDHandlers } from './dnd-handler/dndList';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

// TESTING
window.getState = () => state;
window.getListItems = () => state.list.items;
// Eval() replacement
window.evalr = obj => Function(`'use strict';return (${obj})`)();

/** 
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            const error = await state.search.getResults();
    
            // 5) Promise is settled. Clear the loader
            clearLoader();

            // 6) Render results on UI
            if (error) {
                if (error.message === 'Network Error') {
                    searchView.renderNetworkError();
                }
            } else if (state.search.result.length) {
                searchView.renderResults(state.search.result);
            } else {
                searchView.renderNoResults(query);
            }
        } catch (err) {
            console.log(`The Error is : ${err}`);
            console.log('-------------------------------------------');           
            console.log(`The Error MESSAGE is : ${err.message}`);
            console.log('-------------------------------------------');
            console.log(`The Error NAME is : ${err.name}`);
            console.log('-------------------------------------------');
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/** 
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Create new recipe object
        state.recipe = new Recipe(id);

        if (state.search && state.search.result && state.search.recipeIsInSearch(id)) {
            // Highlight selected search item
            searchView.highlightSelected(id);

            try {
                // Get recipe data from state.search and parse ingredients
                state.recipe.getRecipeFromSearch(state.search.result);
                state.recipe.parseIngredients();
    
                // Calculate servings and time
                state.recipe.calcTime();
        
                // Render recipe
                clearLoader();
                recipeView.renderRecipe(
                    state.recipe,
                    state.likes.isLiked(id)
                );
    
            } catch (err) {
                console.log('Error on getting recipe from the search results :', err);
            }
        } else {
            try {
                // Get recipe data from edamam and parse ingredients
                const error = await state.recipe.getRecipe();

                // Promise is settled. Clear the loader
                clearLoader();

                // Render recipe
                if (error) {
                    if (error.message === 'Network Error') {
                        recipeView.renderNetworkError();
                    }
                } else {
                    // Parse ingredients
                    state.recipe.parseIngredients();
        
                    // Calculate servings and time
                    state.recipe.calcTime();
            
                    // Render recipe
                    recipeView.renderRecipe(
                        state.recipe,
                        state.likes.isLiked(id)
                    );
                }
            } catch (err) {
                console.log('Error on getting recipe from Edamam :', err);
            }
        }
    }
};
 
//['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', () => window.location.hash = '');


/** 
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
        listView.showClearBtn();
    });
}

// Handle add, delete and update list item events
elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);
        if (!state.list.items.length) listView.hideClearBtn();
    } 
});

elements.shoppingTopBtn.addEventListener('click', e => {
    // Handle the clear button
    if (e.target.matches('.shopping__clear, .shopping__clear *')) {
        const check = confirm('Do you want to clear the shopping list ?');
        if (check) {
            // Clear the state
            state.list.deleteAllItems();
    
            // Clear the UI
            listView.clearShopping();
            listView.hideClearBtn();
        }
    // Handle the add button
    } else if (e.target.matches('.shopping__add, .shopping__add *')) {
        // Add item to state (without any data)
        const item = state.list.addItem('', '', '');

        // Add item to the UI
        listView.renderItem(item);
        listView.showClearBtn();
    }
});

elements.shoppingList.addEventListener('input', e => {   
    // Handle item update
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if (e.target.matches('.shopping__count-value')) {
        if (e.target.value > 0) {    
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val);           
        } else if (e.target.value === '') {
            state.list.updateCount(id, e.target.value);          
        }
        if (e.composed) e.target.step = e.target.value;
    } else if (e.target.matches('.shopping__unit-value')) {
        state.list.updateItem(id, 'unit', e.target.value);
    } else if (e.target.matches('.shopping__description')) {
        state.list.updateItem(id, 'ingredient', e.target.value);
        // Make text area of ingredient description auto-resize on input
        e.target.style.height = '0px';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }
}, false);


/** 
 * LIKE CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Handle clearing the likes
elements.likesHeartBtn.addEventListener('click', () => {
    const check = confirm('Do you want to clean the likes ?');

    if (check) {
        // IF there is a recipe displayed AND IF this recipe is in the likes list THEN toggle the like button of the recipe
        if (state.recipe && state.likes.isLiked(state.recipe.id)) {
            likesView.toggleLikeBtn(false);
        }
        
        // Remove likes from the state
        state.likes.deleteAllLikes();
    
        // Toggle heart button
        likesView.toggleLikeMenu(state.likes.getNumLikes());
    
        // Remove likes from UI
        likesView.cleanLikelist();
    }
});

// Restore liked recipes and shopping list on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.list = new List();
    
    // Restore likes and shopping list
    state.likes.readStorage();
    state.list.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
    state.list.items.forEach(item => listView.renderItem(item));
    if (state.list.items.length) listView.showClearBtn();
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});


/** 
 * SHOPPING LIST DRAG AND DROP CONTROLLER
 */
window.addEventListener('load', () => {
    Array.from(document.querySelectorAll('.shopping__item')).forEach(addDnDHandlers);
});
