window.inputTypeNumberPolyfill = {

    /**
     * Does the clipboard contain a numerical value?
     *
     * @private
     *
     * @param {Event} event - The paste event triggering this method.
     */
    clipboardIsNumeric: function (event) {
        event = (event) ? event : window.event;
        var clipboardData = (event.clipboardData) ? event.clipboardData.getData('Text') : window.clipboardData.getData('Text');
        var isNumber = /^\d+$/.test(clipboardData);
        return (isNumber);
    },

    /**
     * Is the clipboard data bigger than the element's maximum length?
     *
     * @private
     *
     * @param {Event} event - The paste event triggering this method.
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     */
    eventIsBlockedByMaxWhenPasting: function (event, element) {
        var maximumValueLength = this.getMaxValueLength(element);
        if (maximumValueLength) {
            event = (event) ? event : window.event;
            var clipboardData = (event.clipboardData) ? event.clipboardData.getData('Text') : window.clipboardData.getData('Text');
            var clipboardDataLength = (typeof clipboardData == 'undefined') ? 0 : clipboardData.length;
            var selectedTextLength = this.getSelectedTextLength(event, element);
            return ((element.value.length + clipboardDataLength - selectedTextLength) > maximumValueLength);
        }
        return false;
    },

    /**
     * Get the selected text length.
     *
     * @private
     *
     * There are multiple bugs linked to selection in all major current browsers. This method works around the
     * documented problems mentioned below:
     *
     * - Chrome: http://stackoverflow.com/questions/21177489/selectionstart-selectionend-on-input-type-number-no-longer-allowed-in-chrome
     * - Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=85686
     *
     * @param {Event|KeyboardEvent} event - The event triggering this method.
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     *
     * @returns {Number} Returns the selected text length or 0 when unable to get it.
     */
    getSelectedTextLength: function (event, element) {
        var selectionLength = 0;

        try {
            // Used by Firefox and modern IE (using a Chrome workaround).
            selectionLength = (element.selectionEnd - element.selectionStart);
            selectionLength = (typeof selectionLength == 'number' && !isNaN(selectionLength)) ? selectionLength : 0;
        } catch (error) {
        }

        if (!selectionLength) {
            if (window.getSelection) {
                // Used by Chrome.
                var selection = window.getSelection();
                selectionLength = (selection == 'undefined') ? 0 : selection.toString().length;
            } else if (document.selection && document.selection.type != 'None') {
                // Used IE8.
                var textRange = document.selection.createRange();
                selectionLength = textRange.text.length;
            }
        }

        return selectionLength;
    },

    /**
     * Is the next typed character blocked by element's maximum length?
     *
     * @private
     *
     * @param {KeyboardEvent} event - The Keyboard event triggering this method.
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     */
    eventIsBlockedByMaxWhenTyping: function (event, element) {
        var maximumValueLength = this.getMaxValueLength(element);
        if (maximumValueLength) {
            event = (event) ? event : window.event;
            var selectedTextLength = this.getSelectedTextLength(event, element);
            var characterLength = this.getCharCodeLength(event);
            return ((element.value.length - selectedTextLength + characterLength) > maximumValueLength);
        }
        return false;
    },

    /**
     * Does the element have a max attribute set? And if it is valid, what is its length.
     *
     * @private
     *
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     */
    getMaxValueLength: function (element) {
        var maximumValue = element.getAttribute('max');
        if (!maximumValue || !/^\d+$/.test(maximumValue)) {
            return 0;
        } else {
            return maximumValue.length;
        }
    },

    /**
     * Is the event's character a digit?
     *
     * @private
     *
     * @param {KeyboardEvent} event - The Keyboard event triggering this method.
     */
    eventKeyIsDigit: function (event) {
        event = (event) ? event : window.event;
        var keyCode = (event.which) ? event.which : event.keyCode;
        return (this.codeIsADigit(keyCode) || this.charCodeIsAllowed(event));
    },

    /**
     * Is a given keyboard event code (charCode or keyCode) a digit?
     *
     * @private
     *
     * @param {Number|Object} code - The Keyboard event key code.
     */
    codeIsADigit: function (code) {
        var stringCode = String.fromCharCode(code);
        return /^\d$/.test(stringCode);
    },

    /**
     * Is the charCode of this event allowed?
     *
     * @private
     *
     * Some browsers already filter keys for input of type number which means some `onkeypress` event will never get
     * triggered. For other browsers (e.g. Firefox) we need to filter which keys are pressed to only allow digits and
     * any other non typeable keys. There are 3 types of keys we want to let go through:
     *
     * - Digits.
     * - Non typeable characters (moving arrows, backspace, del, tab, etc.).
     * - Key combinations (alt, ctrl, shift, etc) - used for copy paste and other functionalities.
     *
     * @param {KeyboardEvent} event - The Keyboard event triggering this method.
     */
    charCodeIsAllowed: function (event) {
        event = (event) ? event : window.event;
        var charCode = event.charCode;
        var keyCode = (event.which) ? event.which : event.keyCode;
        charCode = (typeof charCode === 'undefined') ? keyCode : charCode; // IE8 fallback.

        if (charCode === 0) {
            // Non typeable characters are allowed.
            return true;
        } else if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
            // All combinations are allowed.
            return true
        } else if (!this.codeIsADigit(charCode)) {
            // Any other character that is not a digit will be blocked.
            return false;
        }

        // The only characters left are numeric, so we let them through.
        return true;
    },

    /**
     * Get the character code length.
     *
     * @private
     *
     * @param {KeyboardEvent} event - The Keyboard event triggering this method.
     */
    getCharCodeLength: function (event) {
        event = (event) ? event : window.event;
        var charCode = event.charCode;
        var keyCode = (event.which) ? event.which : event.keyCode;
        charCode = (typeof charCode === 'undefined') ? keyCode : charCode; // IE8 fallback.

        if (charCode === 0) {
            // Non typeable characters have no length.
            return 0;
        } else if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
            // All combinations have no length.
            return 0
        } else if (!this.codeIsADigit(charCode)) {
            // All non-allowed characters have 0 length (because they will be blocked).
            return 0;
        }

        return 1; // By default a character has a length of 1.
    },

    /**
     * Polyfill a given element.
     *
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     */
    polyfillElement: function (element) {

        element.addEventListener('keypress', function (event) {
            if (!inputTypeNumberPolyfill.eventKeyIsDigit(event) ||
                inputTypeNumberPolyfill.eventIsBlockedByMaxWhenTyping(event, element)) {
                event.preventDefault();
            }
        });

        element.addEventListener('paste', function (event) {
            if (!inputTypeNumberPolyfill.clipboardIsNumeric(event) ||
                inputTypeNumberPolyfill.eventIsBlockedByMaxWhenPasting(event, element)) {
                event.preventDefault();
            }
        });

    }
};



// BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        
        deleteItem: function(type, id) {
            var /*ids,*/ index;
            
            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3
            
            /*ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }*/
            
            for (let i = 0; i < data.allItems[type].length; i++ ) {
                if (data.allItems[type][i].id === id) {
                    index = i;
                }  
            }
            
            if (typeof index !== undefined) {
                data.allItems[type].splice(index, 1);
            } 
            
        },
        
        deleteAllItems: function(type) {
            data.allItems[type].splice(0, data.allItems[type].length);
        },
        
        
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }            
            
            // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
        },
        
        calculatePercentages: function() {
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        checkIfLastItem: function(type) {
            if(data.allItems[type].length === 0) {
                return true;            
            }
            return false;
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();




// UI CONTROLLER
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        clearIncBtn: '.inc__delete--btn',
        clearExpBtn: '.exp__delete--btn'
    };
    
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        
    };
    
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <input type="text" class="item__description" value=%description%><div class="right clearfix"><input type="number" class="item__value" value=%value%><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        
        deleteAllListItems: function(type) {
            let el;
                        
            if (type === 'inc') {
                el = document.querySelector(DOMstrings.incomeContainer);
            } else {
                el = document.querySelector(DOMstrings.expensesContainer);
            }
            
            while (el.hasChildNodes()) {
                el.removeChild(el.lastChild);
            }
            
        },
        
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            if(obj.budget === 0) {
                document.querySelector(DOMstrings.budgetLabel).textContent = '0.00';
                
            } else {
                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            }
            
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
        },
        
        
        displayClearBtn: function(type) {
          if(type === 'inc') {
              document.querySelector(DOMstrings.clearIncBtn).style.display = 'inline-block';
          } else {
              document.querySelector(DOMstrings.clearExpBtn).style.display = 'inline-block';
          }
        },
        
        
        hideClearBtn: function(type) {
           if(type === 'inc') {
              document.querySelector(DOMstrings.clearIncBtn).style.display = 'none';
          } else {
              document.querySelector(DOMstrings.clearExpBtn).style.display = 'none';
          } 
        },
        
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
        document.querySelector(DOM.clearIncBtn).addEventListener('click', ctrlDeleteAllItems);
        
        document.querySelector(DOM.clearExpBtn).addEventListener('click', ctrlDeleteAllItems);
    };
    
    
    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
           /* console.log(newItem.id, newItem.type, newItem.description, newItem.value);*/
            

            // 3. Add the item to the UI and display the DeleteAllItems button
            UICtrl.addListItem(newItem, input.type);
            UICtrl.displayClearBtn(input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Delete the Clear button IF this is the last item
            if (budgetCtrl.checkIfLastItem(type)) {
                UICtrl.hideClearBtn(type);
            };
            
            // 4. Update and show the new budget
            updateBudget();
            
            // 5. Calculate and update percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteAllItems = function(event) {
        let type, btnClass, splitClass;
        
        btnClass = event.target.parentNode.className;
        splitClass = btnClass.split('__');
        type = splitClass[0];
            
        // 1. Delete the items from the data structure
        budgetCtrl.deleteAllItems(type);

        // 2. Delete the items from the UI and hide the Clear button
        UICtrl.deleteAllListItems(type);
        UICtrl.hideClearBtn(type);

        // 3. Update and show the new budget
        updateBudget();

        // 4. Calculate and update percentages
        updatePercentages();
    };
    
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);


controller.init();