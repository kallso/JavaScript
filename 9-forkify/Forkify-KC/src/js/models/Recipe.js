import axios from 'axios';
import wordsToNumbers from 'words-to-numbers';
import { key, id } from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    getRecipeFromSearch(result) {
        const recipeIndex = result.findIndex(el => el.uri.includes(this.id));
        const recipe = result[recipeIndex];

        this.title = recipe.label;
        this.author = recipe.source;
        this.img = recipe.image;
        this.url = recipe.url;
        this.ingredients = recipe.ingredientLines;
        this.servings = recipe.yield;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://api.edamam.com/search?r=http%3A%2F%2Fwww.edamam.com%2Fontologies%2Fedamam.owl%23recipe_${this.id}&app_id=${id}&app_key=${key}`);
            
            if (res && res.data) {
                /* this.title = res.data[0].label;
                this.author = res.data[0].source;
                this.img = res.data[0].image;
                this.url = res.data[0].url;
                this.ingredients = res.data[0].ingredientLines;
                this.servings = res.data[0].yield; */
                
                // TESTING RECPIE
                this.title = 'TEST';
                this.author = 'TEST';
                this.img = res.data[0].image;
                this.url = res.data[0].url;
                this.ingredients = [
                    "3*1/2 ounces. olive oil, 2 teaspoons of honey", 
                    "1+15 g sliced Spanish onion , 3/4 g sliced", 
                    "three medium potatoes , 2azex and thinly sliced", 
                    "200.0teaspoon ounces pack pizza dough mix (from supermarkets)", 
                    "150.0g taleggio cheese , sliced (or mozzarella)",
                    "2 1/2 big honey butt", 
                    "2,5 teaspoon sprigs rosemary , 10cups chopped", 
                    "2.5teaspoon garlic cloveslb , 3teaspoon crushed"
                ];
                this.servings = res.data[0].yield;
            }
        } catch (error) {
            return error;
        }
    }

    calcTime() {
        // Assuming that we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    parseIngredients() {
        const unitsTranslation = new Map();
        unitsTranslation
        .set('tablespoons', 'tbsp')
        .set('tablespoon', 'tbsp')
        .set('ounces', 'oz')
        .set('teaspoons', 'tsp')
        .set('teaspoon', 'tsp')
        .set('ounce', 'oz')
        .set('cups', 'cup')
        .set('scoops', 'scoop')
        .set('pounds', 'pound')
        .set('tins', 'tin')
        .set('bags', 'bag')
        .set('pints', 'pint')
        .set('bottles', 'bottle')
        .set('packs', 'pack')
        .set('millilitre', 'ml')
        .set('package', 'pack')
        .set('packages', 'pack')
        .set('packet', 'pack')
        .set('packets', 'pack')
        .set('bundles', 'bundle')
        .set('parcels', 'parcel')
        .set('batchs', 'batch')
        .set('kilos', 'kilo')
        .set('milligram', 'mg')
        .set('kilogram', 'kg')
        .set('balls', 'ball');

        const units = new Set([...unitsTranslation.values(),'g','mlg','litre','lb','Lb','LB']);

        console.log(this.ingredients);  
          
        const newIngredients = this.ingredients.map(el => {
            // 1) Uniform units                    
            let ingredient = el.toLowerCase();

            let regexp;
            // 200 teaspoons => 200 tsp
            for (const [key, value] of unitsTranslation.entries()) {
                regexp = new RegExp(key, 'g');
                ingredient = ingredient.replace(regexp, value);
            }
            // 200g => 200 g
            for (const value of units) {
                regexp = new RegExp(`(?<=\\d)${value}`, 'g');
                ingredient = ingredient.replace(regexp, ` ${value}`);
            }
            
            // 2) Remove parentheses and 'x' if present after a number : 12x tomatoes / 12 x tomatoes => 12 tomatoes
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ').replace(/(?<=\d)\s*x\s+/g, ' ');
                 
            // 3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');

            // Find index of the first unit in the ingredient AND remove all non lowercase letters caracters (.^$&% etc ...) on it.
            const unitIndex = arrIng.findIndex((el2,i) => {el2 = el2.replace(/[^a-z]/, ''); if (units.has(el2)) {arrIng[i] = el2; return true;} return false;});

            let objIng;
            if (unitIndex > -1) {
                // There is a unit             
                // Ex. 4 1/2 cups, arrCount is [4, 1/2] --> eval("4+1/2") --> 4.5
                // Ex. 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);
                            
                // TODO : check if there is a number after the count and do the math if yes : 2 1/2 potatoes => 2.5 potatoes. 2 * 5 cup => 10 cup
                let count;
                if (arrCount.length === 1) {
                    // Remove all but digits and mathematical operators (/*-+) in the first element
                    arrIng[0] = arrIng[0].replace(/[^\d\-\+\/\*\.\,]/g, '');
                    try {
                        count = evalr(arrIng[0].replace('-', '+').replace(',', '.'));
                    } catch (err) {
                        console.log(err);
                        console.log(arrIng[0], arrIng[0].replace('-', '+'), 'There is a unit in second element. count = ' + count);
                    }
                } else {
                    arrIng.splice(1, unitIndex - 1); 
                    try {
                        count = evalr(arrIng.slice(0, unitIndex - 1).join('+'));
                    } catch (err) {
                        console.log(err);
                        console.log(`Eval : ${arrIng.slice(0, unitIndex - 1).join('+')}`)
                        console.log('There is a unit somewhere. count = ' + count);
                        console.log(`unitIndex = ${unitIndex}`);
                        console.log(arrIng);
                    }
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            } else if (parseInt(arrIng[0], 10) || typeof(wordsToNumbers(arrIng[0])) === 'number') {
                // There is NO unit, but 1st element is number : 3 oranges / three oranges
                objIng = {
                    count: parseInt(arrIng[0], 10) || wordsToNumbers(arrIng[0]),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // There is NO unit and NO number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}