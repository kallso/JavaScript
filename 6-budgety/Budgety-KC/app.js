/**
 * LIST ITEM(s) INPUT NUMBER HANDLER
 *
 * Applies on an <input type='text'> and mimic the behaviour of a google chrome's <input type='number'> with some 
 * custom adjustments.
 **/

window.listInputNumberHandler = {
    
    // Check if the clipboard contains a numerical value and only a numerical value
    clipboardIsNumeric: function (event) {
        event = (event) ? event : window.event;
        var clipboardData = (event.clipboardData) ? event.clipboardData.getData('Text') : window.clipboardData.getData('Text');
        var isNumber = /^[0-9.,]+$/.test(clipboardData);  // original pattern    /^\d+$/
        return (isNumber);
    },

    // Is the event's character a digit ?
    eventKeyIsDigit: function (event) {
        event = (event) ? event : window.event;
        var keyCode = (event.which) ? event.which : event.keyCode;
        return (this.codeIsADigit(keyCode) || this.charCodeIsAllowed(event));
    },

    // Is a given keyboard event code (charCode or keyCode) a digit ?
    codeIsADigit: function (code) {
        var stringCode = String.fromCharCode(code);
        return /^\d$/.test(stringCode);
    },

    /**
     * Is the charCode of this event allowed?
     *
     * Some browsers already filter keys for input of type number which means some `onkeypress` event will never get
     * triggered. For other browsers (e.g. Firefox) we need to filter which keys are pressed to only allow digits and
     * any other non typeable keys. There are 3 types of keys we want to let go through:
     *
     * - Digits.
     * - Non typeable characters (moving arrows, backspace, del, tab, etc.).
     * - Key combinations (alt, ctrl, shift, etc) - used for copy paste and other functionalities.
     **/
    
    charCodeIsAllowed: function (event) {
        event = (event) ? event : window.event;
        var charCode = event.charCode;
        var keyCode = (event.which) ? event.which : event.keyCode;
        charCode = (typeof charCode === 'undefined') ? keyCode : charCode; // IE8 fallback.

        if (charCode === 0 || charCode === 44 || charCode === 46) {
            // Non typeable characters and '.' and ',' are allowed.
            return true;
        } else if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
            // All combinations are allowed.
            return true;
        } else if (!this.codeIsADigit(charCode)) {
            // Any other character that is not a digit will be blocked.
            return false;
        }

        // The only characters left are numeric, so we let them through.
        return true;
    },
    
    // Set and check the validity of the element value. If not valid : add a red background and throw a warning message.
    showItemValidity: function (item, itemValue) {     
        item.setCustomValidity('');

        if (itemValue > 999999.99) {
            item.setCustomValidity('Cette valeur doit être inférieure à 1 million.');
        }
        else if (itemValue < 0.01 && itemValue !== -1) {
            item.setCustomValidity('Cette valeur doit être supérieure ou égale à 0,01. (1 centime)');
        }
        else if (isNaN(itemValue) || itemValue === -1) {
            item.setCustomValidity('Veuillez saisir un nombre.')
        }
        /*e.target.checkValidity()*/
        if (!item.checkValidity()) {
            event.target.parentNode.parentNode.classList.remove("uncomplete");
            event.target.parentNode.parentNode.classList.add("uncomplete");
        } else {
            event.target.parentNode.parentNode.classList.remove("uncomplete");
        }

        item.reportValidity();
    },
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
            
            /*if (this.percentage > 999) {
               this.percentage = -1;    
            }*/
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
        
        
        editItemValue: function(type, id, newValue) {
            if (newValue.indexOf('.') !== -1 && newValue.indexOf(',') !== -1) {
                newValue = newValue.replace(/,/g, '');
            } else {
                newValue = newValue.replace(/,/g, ".");
            }
                       
            newValue = Math.abs(newValue);
            newValue = newValue.toFixed(2);
            newValue = Number(newValue);
        
            data.allItems[type][id].value = newValue;        
        },
        
        
        editItemDescription: function(type, id, newValue) {
            data.allItems[type][id].description = newValue;
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
        
        
        getDataItemValue: function(type, id) {
            return data.allItems[type][id].value;
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
        inputDescriptionDotless: 'add__description',
        inputValue: '.add__value',
        inputValueDotless: 'add__value',
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
        clearExpBtn: '.exp__delete--btn',
        formLabel: 'add__container',
        itemValLabel: 'item__value',
        itemDesLabel: 'item__description'
    };
    
     
    var formatNumber = function(num) {
        var numSplit, int, dec;
        
        if (typeof(num) === 'number') {
            num = num.toString();
        }
        
        /*num = num.replace(/,/g, '.');*/  
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510.00
        }

        dec = numSplit[1];
        
        return int + '.' + dec;    
    };
       
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    var nodeListForEachDescending = function(list, callback) {    
        let i = 0, c = list.length - 1;
        
        while (i < list.length && c > -1) {
            callback(list[c], i);
            i++;
            c--;
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
                
                html = '<div class="item clearfix" id="inc-%id%"><input type="text" class="item__description" value=%description%><div class="right clearfix"><span class="item__operator">+&nbsp</span><input type="text" class="item__value" value=%value%><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><input type="text" class="item__description" value=%description%><div class="right clearfix"><span class="item__operator">-&nbsp</span><input type="text" class="item__value" value=%value%><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));
                
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('afterbegin', newHtml);
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
        
        
        editListItem: function(dataValue, event) {
            event.target.value = formatNumber(dataValue);
            event.target.parentNode.parentNode.classList.remove("uncomplete");
            event.target.setCustomValidity('');
        },
        
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
            
            // Disabled the submit button and therefore the submit fonction of the formular (form.submit())
            document.querySelector(DOMstrings.inputBtn).disabled = true;
        },
        
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = '+ ' : type = '- ';
            
            if(obj.budget === 0) {
                document.querySelector(DOMstrings.budgetLabel).textContent = '0.00';
            } else {
                document.querySelector(DOMstrings.budgetLabel).textContent = type + formatNumber(obj.budget);
            }
            
            document.querySelector(DOMstrings.incomeLabel).textContent = '+ ' + formatNumber(obj.totalInc);
            document.querySelector(DOMstrings.expensesLabel).textContent = '- ' + formatNumber(obj.totalExp);
            
            if (obj.percentage > 0 && obj.percentage < 999) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }      
        },
        
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEachDescending(fields, function(current, index) {
                
                if (percentages[index] > 0 && percentages[index] < 999) {
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
    var DOM = UICtrl.getDOMstrings();
    
    var setupEventListeners = function() {
        
        document.addEventListener('click', function(event)  {
            if (event.target.classList.value === 'ion-ios-checkmark-outline') {
                ctrlAddItem();
            }
        });
                
        document.addEventListener('keydown', function(event) {
            if ((event.keyCode === 13 || event.which === 13) && (event.target.classList.value !== DOM.itemValLabel)) {
                ctrlAddItem();
            }
            
            if ((event.keyCode === 13 || event.which === 13) && (event.target.className === DOM.itemValLabel || event.target.className === DOM.itemDesLabel)) {
                ctrlEditItem(event);
            }
            
            if (event.keyCode === 16 || event.which === 16) {
                switchType();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('mousedown', function(event) {
            event.preventDefault();
        });
        
        document.querySelector(DOM.inputType).addEventListener('click', switchType);
        
        document.querySelector(DOM.clearIncBtn).addEventListener('click', ctrlDeleteAllItems);
        
        document.querySelector(DOM.clearExpBtn).addEventListener('click', ctrlDeleteAllItems);
        
        document.addEventListener('blur', function(event) {
            if (event.target.className === DOM.itemValLabel || event.target.className === DOM.itemDesLabel) {
                ctrlEditItem(event);
            }
        }, true);
        
        // Specific events handlers for list items input number
        document.addEventListener('keypress', function (event) {
            if (event.target.className === DOM.itemValLabel) {
                if (!listInputNumberHandler.eventKeyIsDigit(event)) {
                    event.preventDefault();
                }
            }       
        });

        document.addEventListener('paste', function (event) {
            if (event.target.className === DOM.itemValLabel) {
                if (!listInputNumberHandler.clipboardIsNumeric(event)) {
                    event.preventDefault();
                }
            }         
        });
        
        document.addEventListener('input', function (event) {
            if (event.target.className === DOM.itemValLabel) {
                        
                // suppressCommas and keeps the caret in the same position before and after the comma suppression 
                if (event.target.value.indexOf('.') !== -1 && event.target.value.indexOf(',') !== -1) {
                    var position = event.target.selectionStart; // Capture initial position
                    event.target.value = event.target.value.replace(/,/g, '');
                    if (event.target.value.length > 6 && position < 3) {
                        event.target.selectionEnd = position;    // Set the cursor back to the initial position.
                    } else if (event.target.value.length === 6 && position < 2) {
                        event.target.selectionEnd = position;       
                    } else {
                        event.target.selectionEnd = position - 1;    // Set the cursor back to the initial position with -1 for the comma.
                    }
                }
                
                // stringNumberToFormalNumber
                let compareValue;
                
                if (event.target.value === '') {
                    compareValue = -1;
                } else {
                    compareValue = event.target.value; // Get the input value and stores it in a separate variable to not change the input value.           
                    compareValue = compareValue.replace(/,/g, "."); // All commas replaced by dots
                    compareValue = Number(compareValue);
                }
                    
                listInputNumberHandler.showItemValidity(event.target, compareValue);
            }        
        });
        
        document.addEventListener('focus', function (event) {
            if (event.target.className === DOM.itemValLabel) {
                // suppressCommas
                if (event.target.value.indexOf('.') !== -1 && event.target.value.indexOf(',') !== -1) {
                    event.target.value = event.target.value.replace(/,/g, '');
                } 
            }   
        }, true);
    };
    
    
    var switchType = function() {
      let typeBtn = document.querySelector(DOM.inputType);
            
        if (typeBtn.value === 'inc') {
            typeBtn.value = 'exp';
            typeBtn.innerHTML = '-';
            
        } else {
            typeBtn.value = 'inc';
            typeBtn.innerHTML = '+';            
        }

        if (document.activeElement.classList[0] !== DOM.inputValueDotless && document.activeElement.classList[0] !== DOM.inputDescriptionDotless) {
            document.querySelector(DOM.inputDescription).focus();          
        }
        
        UICtrl.changedType();
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
        
        // Enabled the submit button and therefore the submit fonction of the formular (form.submit())
        document.querySelector(DOM.inputBtn).disabled = false;
        
        // 1. Get the field input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value >= 0.01 && input.value <= 999999.99) {
            
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
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
            
            // for exemple : "inc-1" "exp-2"
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
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
        let type, btnClass, splitClass, r, fullType;
        
        btnClass = event.target.parentNode.className;
        splitClass = btnClass.split('__');
        type = splitClass[0];
        type === 'inc' ? fullType = 'incomes' : fullType = 'expenses';
        
        // 1. Let user confirm he wants to delete all items
        r = confirm('Do you really want to delete all ' + fullType + ' ?');
        
        if (r) {
            // 2. Delete the items from the data structure
            budgetCtrl.deleteAllItems(type);

            // 3. Delete the items from the UI and hide the Clear button
            UICtrl.deleteAllListItems(type);
            UICtrl.hideClearBtn(type);

            // 4. Update and show the new budget
            updateBudget();

            // 5. Calculate and update percentages
            updatePercentages();
        }     
    };
    
    
    var ctrlEditItem = function(event) {
        let newValue, dataValue, itemID, splitID, type, ID;
        
        newValue = event.target.value;
        
        if (event.target.className === DOM.itemValLabel) {
            itemID = event.target.parentNode.parentNode.id;
        } else if (event.target.className === DOM.itemDesLabel) {
            itemID = event.target.parentNode.id;
        }
        
        if (itemID) {
            
            // 0. Retrieve the type and the id of the item. for exemple : "inc-1" "exp-2".
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            if (event.target.className === DOM.itemValLabel) {
                // 1. Update the item value in the data structure if the number is valid
                if (event.target.checkValidity() && event.target.value !== '') {
                    budgetCtrl.editItemValue(type, ID, newValue);
                }

                // 2. Retrieve the data structure value of the item, format it, and displays it in the UI.
                dataValue = budgetCtrl.getDataItemValue(type, ID);
                UICtrl.editListItem(dataValue, event);         

                // 3. Update and show the new budget
                updateBudget();

                // 4. Calculate and update percentages
                updatePercentages();
            } else if (event.target.className === DOM.itemDesLabel) {
                // 1. Update the item description in the data structure
                budgetCtrl.editItemDescription(type, ID, newValue);
                if (event.type === 'keydown') {
                    event.target.blur();
                }
            }       
        }
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