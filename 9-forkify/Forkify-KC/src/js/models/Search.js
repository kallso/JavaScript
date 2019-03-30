import axios from 'axios';
import { key, id, to } from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        try {
            const res = await axios(`https://api.edamam.com/search?q=${this.query}&app_id=${id}&app_key=${key}&to=${to}`);
            
            if (res) this.result = [];
            if (res.data.hits) {
                res.data.hits.forEach(el => this.result.push(el.recipe));
            }
        } catch (error) {
            return error;
        }
    }

    recipeIsInSearch(id) {
        if (this.result) return this.result.some(recipe => recipe.uri.includes(id));
    }
}
