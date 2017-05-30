// $(document).onReady(function() {
var config = {
    apiKey: "AIzaSyDAaxwFEqWX-vPiG5V8q_rTKZPLVir3UBk",
    authDomain: "testrepocah.firebaseapp.com",
    databaseURL: "https://testrepocah.firebaseio.com",
    projectId: "testrepocah",
    storageBucket: "testrepocah.appspot.com",
    messagingSenderId: "906450921448"
};
firebase.initializeApp(config);
let database = firebase.database();
let userRef = database.ref("/users");
let gameRef = database.ref("/games");
let cardRef = database.ref("/cards");
let playerRef = database.ref("/players");
let globalChat = database.ref("/globalChat");
let displayNameRef = database.ref("/users/displayNames");
let blackCardRef = cardRef.child("/blackCards");
let whiteCardRef = cardRef.child("/whiteCards");
let currentPlayerRef = "";
let currentGameRef = "";
let currentUid = "";
let currentGame = "";
let currentDisplayName = "";
let state = {
    open: 0,
    ready: 1,
    chooseBlack: 2,
    chooseWhite: 3,
    pickWhite: 4,
    showCards: 5,
    nextTurn: 6,
    gameOver: 7,
    quitGame: 8
}

fireObj = {

        signIn: function(email, password) {
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
            }).then(function() {
                currentUid = firebase.auth().currentUser.uid;
                userRef.child(currentUid).child("displayName").once("value", function(snap) {
                        currentDisplayName = snap.val();
                    })
                    //TODO: change to next screen
                console.log("signed in!")
            })

        },


        signUpCheck: function(email, password, passConfrim, displayName) {
            //TODO:must be called by function that takes the return and displays it
            let containsNumber = false;
            let containsLetter = false;

            if (password !== passConfrim) {
                //checks taht passwords match
                return "passwords dont match";
            } else if (!(password.length >= 6)) {
                //checks that it is at least 6 char long
                return "password is not long enough must be at least 6 characters long"
            } else {
                for (var i = 0; i < password.length; i++) {
                    //makes sure it has at least 1 number and letter
                    if (!containsNumber) {
                        for (var k = 0; k < 10; k++) {
                            if (password[i] === k.toString()) {
                                containsNumber = true;
                            } //if1
                        } //for2
                    } //if2
                    if (!containsLetter) {
                        let code = password[i].charCodeAt(0);
                        if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
                            containsLetter = true;
                        } //if2
                    } //if1
                } //for1

            } //else
            if (!containsNumber) {
                return "must contain at least one number";
            } else if (!containsLetter) {
                return "must contain at least one letter";
            }

            this.createAcct(password, displayName, email);
            return "Signing Up"
        }, //signUp()

        createAcct: function(password, displayName, email) {
            let nameExists = true;
            displayNameRef.child(displayName).once("value", function(snap) {
                //chceks to make sure display name isnt taken
                console.log(snap.val())
                if (snap.val() === null) {
                    nameExists = false;
                }
            }).then(function() {
                if (nameExists) {
                    // return "that displayName already exists try another"
                } else {
                    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                    }).then(function() {
                        //make obj with username set to true and add to displayNmae list in database
                        let name = {};
                        name[displayName] = true;
                        displayNameRef.update(name);
                        //sets current display name locally
                        currentDisplayName = displayName;
                        //set current UID locally
                        currentUid = firebase.auth().currentUser.uid;
                        //builds the user's obj in database
                        userRef.child(currentUid).set({
                                displayName: displayName,
                                joinedGame: "",
                                whiteCards: "",
                                blackCards: "",
                                winCount: "",
                                totalBlackCards: 0,
                                uid: currentUid,
                                profile: {
                                    info: "",
                                    pic: "http://api.adorable.io/avatar/125/" + currentUid
                                }
                            }) //set
                            //TODO: change to next screen


                    }); //then
                } //else
            })

        }, //createAcc()

        sendMsg: function(key, name, msg) {
            let message = {
                name: name,
                message: msg,
                timeStamp: firebase.database.ServerValue.TIMESTAMP
            }
            if (key === "globalChat") {
                globalChat.push().set(message);
            } else {
                gameRef.child(key).child("chat").push().set(message);
            }
        },
        globalChatOn: function() {
            globalChat.on("child_added", function(snap) {
                //TODO: call add new MSG with snap.val() to global chat
            })
        },
        gameChatOn: function(key) {
            gameRef.child(key).child("chat").on("child_added", function(snap) {
                //TODO: call add new MSG with snap.val() to game chat
            })
        },
        gameChatOff: function(key) {
            gameRef.child(key).child("chat").off();
        },
        createNewGame: function(playerCount, winlimit) {
            let newGameRef = gameRef.push();

            let newPlayerRef = playerRef.push();
            let playerKey = newPlayerRef.key
            let whiteCount = 0;
            let blackCount = 0;
            let tempArray = {
                white: [],
                black: []
            };
            let shuffledArray = {
                white: [],
                black: []
            };
            //grab the key to the enw game
            currentGame = newGameRef.key;
            //build the game obj for database
            let gameObj = {
                    host: currentDisplayName,
                    playerLimit: playerCount,
                    winLimit: winlimit,
                    totalPlayers: 1,
                    blackOrder: {
                        order: true
                    },
                    whiteOrder: {
                        order: true
                    },
                    players: playerKey,
                    currentTurn: "host",
                    blackCount: 0,
                    whiteCount: 0,
                    scores: "",
                    chat: {
                        chat: true
                    },
                    state: state.open
                }
                //build the player obj
            let playerObj = {
                host: {
                    hand: {
                        hand: false
                    },
                    blackCards: {
                        cards: true
                    },
                    chosenWhiteCard: "",
                    uid: currentUid,
                    displayName: currentDisplayName,
                    playerBlackCount: 0
                }
            }
            newPlayerRef.set(playerObj);
            cardRef.child("whiteCardCount").once("value", function(snap) {
                //grabs total white card count
                whiteCount = snap.val();
            }).then(function() {
                cardRef.child("blackCardCount").once("value", function(snap) {
                        //grabs total black card count
                        blackCount = snap.val();
                    }).then(function() {
                        //creats 2 arrays of all indexs
                        for (var i = 0; i < whiteCount; i++) {
                            tempArray.white.push(i);
                        }
                        for (var i = 0; i < blackCount; i++) {
                            tempArray.black.push(i);
                        }
                        //create shuffled arrays of indexs
                        for (var i = 0; i < blackCount; i++) {
                            let rand = Math.floor(Math.random() * tempArray.black.length);
                            shuffledArray.black.push(tempArray.black[rand]);
                            tempArray.black.splice(rand, 1);
                        }
                        for (var i = 0; i < whiteCount; i++) {
                            let rand = Math.floor(Math.random() * tempArray.white.length);
                            shuffledArray.white.push(tempArray.white[rand]);
                            tempArray.white.splice(rand, 1);
                        }
                    }) //then2
            }).then(function() { //then1
                //make new game and add shuffled arrays
                newGameRef.set(gameObj).then(function() {
                    let count = 0;
                    let set = 0;
                    //loops white total iterations are les sthat total count
                    while (count < blackCount) {
                        //loops thru 50 at a time
                        for (var i = 0; i < 50; i++) {
                            if (shuffledArray.black[count]) {

                                newGameRef.child("blackOrder").child(set).child(i).set(shuffledArray.black[count]);
                            } //if
                            count++;
                        } //for
                        set++;
                    } //while
                }).then(function() {
                    let count = 0;
                    let set = 0;
                    while (count < whiteCount) {
                        for (var i = 0; i < 50; i++) {

                            if (shuffledArray.white[count]) {
                                newGameRef.child("whiteOrder").child(set).child(i).set(shuffledArray.white[count]);
                            }
                            count++;
                        }
                        set++;
                    }
                    fireObj.gameState(currentGame);
                })
            })
        }, //createGame

        buildPlayerObj: function(key, playerKey) {
            //increase totalplayers by 1 and builds the playerObj
            gameRef.child(key + "/totalPlayers").transaction(function(snap) {
                playerCount = snap + 1;
                snap = playerCount;
                playerObj = {
                    hand: {
                        hand: false
                    },
                    blackCards: {
                        cards: true
                    },
                    chosenWhiteCard: "",
                    uid: currentUid,
                    displayName: currentDisplayName,
                    playerBlackCount: 0
                }
                playerRef.child(playerKey).child(currentUid).set(playerObj)
                    // snap.val().totalPlayers = playerCount;
                return snap;
            })
        },
        dealSevenCards: function(playerKey, whiteOrder, host) {
            currentGameRef.child("whiteCount").transaction(function(snap) {

                    let firstChild = Math.floor(snap / 50);
                    let secondChild = (snap % 50);
                    let cards = []
                    for (var i = 0; i < 7; i++) {
                        //checsk if second child is above 49 whichs means it stored in the nest
                        if (secondChild + i > 49) {
                            cards.push(whiteOrder[firstChild + 1][(secondChild + i) - 50])
                        } else {
                            cards.push(whiteOrder[firstChild][secondChild + i])
                        }

                    }
                    for (var i = 0; i < 7; i++) {
                        playerRef.child(playerKey + "/" + (host ? "host" : currentUid) + "/hand").child(i).set(cards[i]);
                    }
                    snap = snap + 7;
                    return snap;

                }).then(function() {
                    currentPlayerRef.child((host ? "host" : currentUid) + "/hand").once("value", function(snap) {
                            for (var i = 0; i < 7; i++) {
                                let num = snap.val()[i];
                                cardRef.child("whiteCards").child(Math.floor(num / 50)).child(num % 50).once("value", function(snap) {
                                        $("#cards").append($("<h2>").text(snap.val()))
                                    }) //card.once
                            } //for
                        }) //player.once
                }).then(function() {
                    currentGameRef.child('players').once('value').then(function(snap) {
                        // get playersKey from currentGameRef
                        var playersKey = snap.val();
                        database.ref('/players/' + playersKey).once('value').then(function(snap) {
                            // Initialize allHandsDealt to true
                            var allHandsDealt = true;
                            // loops through every player currentGameRef's players
                            snap.forEach(function(childSnap) {
                                // if the current player's hand.numChildren() < 8, set allHandsDealt to false.
                                // (8 because the initial 'hand' property in the 'hand' obj)
                                if (childSnap.child('hand').numChildren() < 8) {
                                    allHandsDealt = false;
                                };
                            });

                            // update the game state in currentGameRef to 2
                            if (allHandsDealt) {
                                currentGameRef.update({
                                    state: state.chooseBlack
                                });
                            }
                        })
                    });
                }) //then foreach all players checking for all card dealt out then change state

        },
        dealOneCard: function(playerKey, whiteOrder, host, card) {
            currentGameRef.child("whiteCount").transaction(function(snap) {
                let firstChild = Math.floor(snap / 50);
                let secondChild = (snap % 50);
                let newCard = whiteOrder[firstChild][secondChild];
                playerRef.child(key + "/" + (host ? "host" : currentUid) + "/hand").child(card).set(newCard)
                snap = snap + 1;
                return snap;
            });
        },

        gameState: function(key) {
                let host = false;
                let blackOrder = [];
                let whiteOrder = [];
                let winLimit = 0;
                let blackCount = 0;
                let whiteCount = 0;
                let playerKey = "";
                let playerOrder = [];
                let playerMax = 0;
                let playerTurnCount = 0;
                let totalPlayers = 0;

                currentGameRef = gameRef.child(key);
                currentGameRef.once("value", function(snap) {

                        //grab all data needed to have stored

                        blackOrder = snap.val().blackOrder;
                        whiteOrder = snap.val().whiteOrder;
                        winLimit = snap.val().winlimit;
                        playerKey = snap.val().players;
                        playerMax = snap.val().playerLimit;
                        if (snap.val().host.toString() === currentDisplayName) {
                            host = true;
                        }
                        $("#maxPlayers").text(playerMax);
                        playerRef.child(playerKey).child("host/displayName").once("value", function(snap) {

                            $("#hostName").text(snap.val())
                        })




                    }).then(function() {
                        currentPlayerRef = playerRef.child(playerKey);
                        currentGameRef.onDisconnect().remove();
                        currentPlayerRef.onDisconnect().remove();
                        currentGameRef.child("state").on("value", function(snap) {
                                let data = snap.val();
                                if (data === null) {
                                    //TODO: call quitgame functions
                                } else {
                                    /*state = {
														    open: 0,
														    ready: 1,
														    chooseBlack: 2,
														    chooseWhite: 3,
														    pickWhite: 4,
														    showCards: 5,
														    nextTurn: 6,
														    gameOver: 7,
														    quitGame: 8
														}*/
                                    switch (data) {
                                        case (state.open):

                                            //TODO: hide game list

                                            if (!host) {
                                                // if not the host build and add player object based on player uid
                                                fireObj.buildPlayerObj(key, playerKey)
                                            } else {
                                                let newBtn = $("<button>").attr("id", "hostStart");
                                                newBtn.text("start Game");
                                                $("#playerDisplay").prepend(newBtn);
                                                newBtn.on("click", function(event) {
                                                        event.preventDefault();
                                                        currentGameRef.child("state").update({
                                                            state: state.ready
                                                        })
                                                    })
                                                    // newBtn.hide();
                                            }
                                            currentGameRef.child("totalPlayers").on("value", function(snap) {
                                                    $("#currentPlay").text(snap.val());

                                                })
                                                //show waitng for game to start screen
                                            currentPlayerRef.on("child_added", function(snap) {
                                                //listen for players joining to update the screen
                                                //call update players screen
                                                if (host) playerOrder.push(snap.key);
                                                console.log(playerOrder)
                                                if (snap.key != "host") {

                                                    let newh1 = $("<h1>").text(snap.val().displayName);
                                                    $("#playerList").append(newh1);
                                                }

                                                if (host) {

                                                    if (playerOrder.length >= 4) {
                                                        $("#hostStart").show();
                                                        //if player count >= 4 allow host to start

                                                    }
                                                    // if the host listen for player count to playerLimit
                                                } //if

                                            }); //currentPlayerRef.on()


                                            //the host starts game and changes to next state
                                            break;
                                        case (state.ready):
                                            fireObj.dealSevenCards(playerKey, whiteOrder, host);

                                            // deal out cards
                                            // display cards their cards
                                            //call next state
                                            break;
                                        case (state.chooseBlack):

                                            currentGameRef.child("currentTurn").once("value", function(snap) {
                                                    //display black card
                                                    currentGameRef.child("blackCount").once("value", function(snap) {
                                                        let firstNum = 50 / snap.val();
                                                        let secondNum = 50 % snap.val();
                                                        //display(blackOrder[firstNum][secondNum])
                                                    })
                                                    if (snap.val() !== (host ? "host" : currentUid)) {
                                                        // set you as chooser of white card

                                                    } //if
                                                }) //currentGameRef
                                                //black card get pulled from cardRef
                                                //display black card to all
                                            break;
                                        case (state.chooseWhite):
                                            currentGameRef.child("currentTurn").once("value", function(snap) {
                                                    //display black card
                                                    if (snap.val() === (host ? "host" : currentUid)) {
                                                        // set you as chooser of white card
                                                        currentGameRef.child("blackCount").transaction(function(snap) {
                                                            return snap + 1
                                                        })
                                                    } //if
                                                }) //currentGameRef
                                            blackCount++;

                                            //setup card listen to add white card choice
                                            //add picked card to player object in currentGameRef
                                            //if host have count that increase by 1 everytime ad player chooses a card by listening to the player objects in database
                                            //once hosts count equals player cound-1 change state
                                            break;
                                        case (state.pickWhite):
                                            //display all choosed white cards to everyone in random order
                                            currentGameRef.child("currentTurn").once("value", function(snap) {
                                                    if (snap.val() === currentUid) {
                                                        // set you as chooser of white card
                                                    } //if
                                                }) //currentGameRef
                                                //current player turn chooses a white card to win
                                                // set min time or wait 5sec after pick
                                            break;
                                        case (state.showCards):
                                            // show owner of each white card
                                            //award black card to winner
                                            break;
                                        case (state.nextTurn):
                                            if (host) {
                                                playerTurnCount++;
                                                if (playerTurnCount === playerOrder.length) {
                                                    playerTurnCount = 0;
                                                }
                                                currentGameRef.update({
                                                    currentTurn: playerOrder[playerTurnCount]
                                                })
                                            }
                                            currentPlayerRef.forEach(function(snap) {
                                                    if (snap.val().playerBlackCount == winLimit) {
                                                        //winner(snap.key)
                                                        if (host) {
                                                            //change gamestate
                                                        }
                                                    }

                                                })
                                                //check if somebody had reached score limit
                                                //if not start from state.chooseBlack
                                                //else go to state.gameOver
                                            break;
                                        case (state.gameOver):
                                            //allow users to return to match making screen
                                            break;
                                        case (state.quitGame):
                                            break;
                                    } //switch
                                } //else

                            }) //currentgame.on
                    }) //then
            } //gamestate
    } //fireObj




gameRef.orderByChild('state').equalTo(state.open).on('child_added', function(snap) {
    var hostName = snap.val().host;
    var joinBtn = '<button class="btn btn-default" id="' + snap.key + '">Join</button>';

    var newGameData = $('<tr>').html('<td>' + hostName + '</td><td>' + snap.val().totalPlayers + '/' + snap.val().playerLimit + '</td><td>' + snap.val().winLimit + '</td><td>' + joinBtn + '</td>');
    $('#table-row').append(newGameData);

    $('#' + snap.key).on('click', function() {
        fireObj.gameState(snap.key);
    });
});


$("#create-game").on("click", function(event) {
    event.preventDefault();
    let playerCount = $("#numPlayers").val();
    let winCount = $("#numWin").val();
    fireObj.createNewGame(playerCount, winCount);
})
makeElement = {


    }
    // $('.flip-container').hide();

// $('.flip-container').on('click', function() {
//             // $('#card3').show();
//             $(this).addClass('flip');



//             // })
//ALL TEST ACCOUNT LOGINS
//fireObj.signIn("leelandmiller@gmail.com", "testUser1")
//fireObj.signIn("amelancon68@gmail.com", "testUser1");
//fireObj.signIn("test@gmail.com", "testUser1")
//fireObj.signIn("test2@gmail.com", "testUser1")
//fireObj.signIn("test3@gmail.com", "testUser1")
//fireObj.signIn("test4@gmail.com", "testUser1")
//fireObj.signIn("test5@gmail.com", "testUser1")
//fireObj.signIn("test6@gmail.com", "testUser1")
