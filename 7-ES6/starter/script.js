function Person(name) {
    this.name = name;
}


// ES6
Person.prototype.myfriends6 = function(friends) {
    
    let arr = friends.map(el => `${this.name} is friends with ${el}`);
    
    console.log(arr);
}

const friends = ['Bob', 'Jane', 'Mark'];
new Person('Francis').myfriends6(friends);