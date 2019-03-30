/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score winningScores the game

*/

let scores, roundScore, activePlayer, gamePlaying, lastDice, lastDice2, winningScore, mode;

// Default values
mode = 1;
winningScore = 100;


init();

document.querySelector('.btn-roll').addEventListener('click', function() {
    if(gamePlaying) {
        if(mode === 1) {
            // 1. Random number
            const dice = Math.floor(Math.random() * 6) + 1;
                
            // Show infos in console
            console.log('Player' + activePlayer + ' dice = ' + dice + ' lastDice = ' + lastDice + ' lastDice2 = ' + lastDice2);

            //2. Display the result
            const diceDOM = document.querySelector('.dice');
            diceDOM.style.display = 'block';
            diceDOM.src = 'dice-' + dice + '.png';


            //3. Update the round score IF the rolled number was NOT a 1
            // AND NOT two 6 in a row
            if (dice === 1) {
                //Next player
                nextPlayer();
            }
            else if (dice === 6 && lastDice === 6) {
                scores[activePlayer] = 0;
                document.querySelector('#score-' + activePlayer).textContent = scores[activePlayer];
                nextPlayer();
            }
            else if (dice === lastDice && lastDice === lastDice2) {            
                Array.from(document.querySelectorAll('.dice-x')).forEach(function(img) {
                    img.src = 'dice-' + dice + '.png';
                });
                
                document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
                document.querySelector('.triple').style.display = 'block';
                activePlayer === 0 ? activePlayer = 1 : activePlayer = 0;
                winner();
            }
            else {
                if (lastDice === dice) {
                    lastDice2 = lastDice;
                }
                //Add score
                roundScore += dice;
                document.querySelector('#current-' + activePlayer).textContent = roundScore;
                // Store the roll
                lastDice = dice;
            }
        }
        if(mode === 2) {
            // 1. Random number
            let dice1 = Math.floor(Math.random() * 6) + 1;
            let dice2 = Math.floor(Math.random() * 6) + 1; 
            
            // Show infos in console
            console.log('Player' + activePlayer + ' dice1 = ' + dice1 + ' dice2 = ' + dice2);

            //2. Display the result
            document.querySelector('.dices').style.display = 'block';
            document.querySelector('.dice-1').src = `dice-${dice1}.png`;
            document.querySelector('.dice-2').src = `dice-${dice2}.png`;

            //3. Update the round score IF the rolled numberS was NOT a 1
            if (dice1 !== 1 && dice2 !== 1) {
                //Add score
                roundScore += dice1 + dice2;
                document.querySelector('#current-' + activePlayer).textContent = roundScore;           
            }
            else {
                //Next player
                nextPlayer();
            }            
        }
    }    
});


document.querySelector('.btn-hold').addEventListener('click', function() {
    if (gamePlaying) {
        // Add CURRENT score to GLOBAL score
        scores[activePlayer] += roundScore;

        // Update the UI
        document.querySelector('#score-' + activePlayer).textContent = scores[activePlayer];

        // Check if player won the game
        if (scores[activePlayer] >= winningScore) {
            winner();
        } else {
            //Next player
            nextPlayer();
        }
    }
});

function winner() {
    document.querySelector('#name-' + activePlayer).textContent = 'Winner!';
    document.querySelector('.dice').style.display = 'none';
    document.querySelector('.player-' + activePlayer + '-panel').classList.add('winner');
    document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
    gamePlaying = false;
}

function nextPlayer() {
    //Next player
    activePlayer === 0 ? activePlayer = 1 : activePlayer = 0;
    roundScore = 0;
    lastDice = 0;
    lastDice2 = 0;

    document.getElementById('current-0').textContent = '0';
    document.getElementById('current-1').textContent = '0';

    document.querySelector('.player-0-panel').classList.toggle('active');
    document.querySelector('.player-1-panel').classList.toggle('active');

    document.querySelector('.dice').style.display = 'none';
    document.querySelector('.dices').style.display = 'none';
}

document.querySelector('.btn-new').addEventListener('click', init);

function init() {
    scores = [0, 0];
    roundScore = 0;
    gamePlaying = true;
    lastDice = 0;
    lastDice2 = 0;
    
    /*activePlayer === 0 ? activePlayer = 1 : activePlayer = 0;*/
    activePlayer = 0;
    
    document.querySelector('.dice').style.display = 'none';
    document.querySelector('.dices').style.display = 'none';
    document.querySelector('.triple').style.display = 'none';

    document.getElementById('score-0').textContent = '0';
    document.getElementById('score-1').textContent = '0';
    document.getElementById('current-0').textContent = '0';
    document.getElementById('current-1').textContent = '0';
    document.getElementById('name-0').textContent = 'Player 1';
    document.getElementById('name-1').textContent = 'Player 2';
    document.querySelector('.player-0-panel').classList.remove('winner');
    document.querySelector('.player-1-panel').classList.remove('winner');
    document.querySelector('.player-0-panel').classList.remove('active');
    document.querySelector('.player-1-panel').classList.remove('active');
    document.querySelector('.player-' + activePlayer + '-panel').classList.add('active');
}

document.querySelector('.final-score').addEventListener('input', finalScore); 
                                                        
function finalScore() {
    // Update the winning score. Regarding to Mode !
    let input = document.querySelector('.final-score').value;
    if (input && input !== "0") {
        winningScore = input;
    }
    else if (mode === 1) {
        winningScore = 100;
    }
    else {
        winningScore = 200;
    }
}

document.querySelector('.btn-mode').addEventListener('click', function() {
    // Switch the mode
    mode === 1 ? mode = 2 : mode = 1;
    
    // Display the mode
    if (mode === 1) {
        document.querySelector('.mode').src = "dice-1.png";
    } else {
        document.querySelector('.mode').src = "dice-2.png";
    }
    
    // Set the winning score
    finalScore();
    
    // Restart the game
    init();
});

//document.querySelector('#current-' + activePlayer).textContent = dice;
//document.querySelector('#current-' + activePlayer).innerHTML = '<em>' + dice + '</em>';
//var x = document.querySelector('#score-0').textContent;

/*function showConfig() {
    let settings = document.querySelector('.setting-panel');
    let btnSet =  document.querySelector('.btn-apply');
    
    if (settings.style.display === 'none') {
        settings.style.display = 'block';   
        btnSet.style.display = 'block';
    }
    else {
        settings.style.display = 'none';
        btnSet.style.display = 'none';
    }        
}

document.querySelector('.btn-apply').addEventListener('click', function() {
    
    if (gamePlaying === false) {
    winningScore = document.getElementById('winningScore').value; 
    document.querySelector('.setting-panel').style.display = 'none';
    }
    else {
        alert('Finissez la partie avant de pouvoir appliquer les paramétres.');
    }
});*/








/*
YOUR 3 CHALLENGES
Change the game to follow these rules:

1. A player looses his ENTIRE score when he rolls two 6 in a row. After that, it's the next player's turn. (Hint: Always save the previous dice roll in a separate variable)
2. Add an input field to the HTML where players can set the winningScorening score, so that they can change the predefined score of 100. (Hint: you can read that value with the .value property in JavaScript. This is a good oportunity to use google to figure this out :)
3. Add another dice to the game, so that there are two dices now. The player looses his current score when one of them is a 1. (Hint: you will need CSS to position the second dice, so take a look at the CSS code for the first one.)
*/
