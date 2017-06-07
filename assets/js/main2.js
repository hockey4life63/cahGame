fireObj = {

        signIn: function(email, password) {
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                toastr.error(errorMessage, errorCode, { positionClass: "toast-top-center" })
            })

        },


        signUpCheck: function(email, password, passConfrim, displayName) {
            //TODO:must be called by function that takes the return and displays it
            let containsNumber = false;
            let containsLetter = false;

            if (password !== passConfrim) {
                //checks taht passwords match
                toastr.error("Passwords don't match", "Error", { positionClass: "toast-top-center" })
                return
            } else if (!(password.length >= 6)) {
                //checks that it is at least 6 char long
                toastr.error("Password is not long enough to satisfy anyone. Must be at least 6 characters long", "Error", { positionClass: "toast-top-center" })

                return
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
                toastr.error("Must contain at least one number", "Error", { positionClass: "toast-top-center" })
                return;
            } else if (!containsLetter) {
                toastr.error("Must contain at least one letter", "Error", { positionClass: "toast-top-center" })
                return;
            }

            this.createAcct(password, displayName, email);
            return "Signing Up"
        }, //signUp()

        createAcct: function(password, displayName, email) {
            let nameExists = true;
            displayNameRef.child(displayName).once("value", function(snap) {
                //chceks to make sure display name isnt taken
                if (snap.val() === null) {
                    nameExists = false;
                }
            }).then(function() {
                if (nameExists) {
                    toastr.error("That display name already exists", "Error", { positionClass: "toast-top-center" })
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
                                    pic: newAvatar
                                }
                            }) //set
                            // 


                    }); //then
                } //else
            })

        }, //createAcc()

        sendMsg: function(key, name, msg) {
            console.log(key, name, msg)

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
            $("#global-chat").html("");
            globalChat.on("child_added", function(snap) {
                if (moment().valueOf() - snap.val().timeStamp >= 3600000) {
                    globalChat.child(snap.key).remove()
                } else if (moment().valueOf() - snap.val().timeStamp <= 300000) {
                    console.log(moment(snap.val().timeStamp).format("h:mm"))
                    let newDiv = $("<div>");
                    let message = $("<p>").text(snap.val().message);
                    let name = $("<strong>").text(snap.val().displayName + ":");
                    message.prepend(name);
                    newDiv.append(message);
                    $("#global-chat").append(newDiv)
                }

            })
        },

        globalChatOff: function(key) {
            globalChat.off();
        },
        joinGameEvent: function() {
            gameRef.orderByChild("state").equalTo(state.open).on("child_added", function(snap) {
                if (snap.val().totalPlayers !== parseInt(snap.val().playerLimit)) {
                    makeElement.buildOpenGame(snap.key, snap.val().host, snap.val().winLimit, snap.val().playerLimit);
                }

            })
            gameRef.on("child_changed", function(snap) {
                if (snap.val().state !== state.open || snap.val().totalPlayers === parseInt(snap.val().playerLimit)) {

                    $("#" + snap.key + "Open").remove()

                }

            })
            gameRef.on("child_removed", function(snap) {
                $("#" + snap.key + "Open").remove()

            })

        },
        joinGameOff: function() {
            gameRef.off("child_added");
            gameRef.off("child_changed")
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
            gameRef.child(newGameRef.key).onDisconnect().remove()
            playerRef.child(newPlayerRef.key).onDisconnect().remove()
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
                    winner: "",
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
                    chosenWhiteCard1: "",
                    chosenWhiteCard2: "",
                    uid: currentUid,
                    playerState: {
                        connected: true,
                        timeStamp: 0
                    },
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
                        console.log("black:" + blackCount + " white:" + whiteCount)
                        let count = 0;
                        //creats 2 arrays of all indexs
                        for (var i = 0; i < whiteCount; i++) {
                            tempArray.white.push(i);
                        }
                        for (var i = 0; i < blackCount; i++) {
                            tempArray.black.push(i);
                        }

                        while (count <= blackCount) {
                            let newArray = [];
                            for (var i = 0; i < 50; i++) {
                                let rand = Math.floor(Math.random() * tempArray.black.length);
                                if (tempArray.black[rand] !== undefined) {

                                    newArray.push(tempArray.black[rand]);
                                    tempArray.black.splice(rand, 1);

                                }
                                count++
                            }
                            shuffledArray.black.push(newArray);
                        }
                        tempCOunt = 0;
                        count = 0;
                        while (count <= whiteCount) {
                            let newArray = [];
                            for (var i = 0; i < 50; i++) {
                                let rand = Math.floor(Math.random() * tempArray.white.length);
                                if (tempArray.white[rand] !== undefined) {

                                    newArray.push(tempArray.white[rand]);
                                    tempArray.white.splice(rand, 1);
                                }
                                count++
                            }
                            shuffledArray.white.push(newArray);
                        }
                    }) //then2
            }).then(function() { //then1
                //make new game and add shuffled arrays
                newGameRef.set(gameObj).then(function() {
                    newGameRef.child("blackOrder").set(shuffledArray.black)

                }).then(function() {
                    newGameRef.child("whiteOrder").set(shuffledArray.white)

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
                    chosenWhiteCard1: "",
                    chosenWhiteCard2: "",
                    uid: currentUid,
                    playerState: {
                        connected: true,
                        timeStamp: 0
                    },
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
                    // get first card location
                    let firstChild = Math.floor(snap / 50);
                    let secondChild = (snap % 50);
                    let cards = []
                        //deal out 7 cards
                    for (var i = 0; i < 7; i++) {
                        //checsk if second child is above 49 whichs means it stored in the next firstchild
                        if (secondChild + i > 49) {
                            cards.push(whiteOrder[firstChild + 1][(secondChild + i) - 50])
                        } else {
                            cards.push(whiteOrder[firstChild][secondChild + i])
                        }

                    }
                    //put them into you hand in database
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
                            //display all the cards
                            for (let i = 0; i < 7; i++) {
                                let newCard = snap.val()[(host ? "host" : currentUid)].hand[i]
                                let firstNum = Math.floor(snap.val()[(host ? "host" : currentUid)].hand[i] / 50);
                                let secondNum = snap.val()[(host ? "host" : currentUid)].hand[i] % 50;
                                whiteCardRef.child(firstNum).child(secondNum).once("value", function(snap) {}).then(function(snap) {
                                    makeElement.newWhiteCard(("card" + (i + 1)).toString(), snap.val(), newCard)
                                })

                            }

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
        dealOneCard: function(whiteOrder, host, card) {
            currentGameRef.child("whiteCount").transaction(function(snap) {

                //grab whitecount
                let firstChild = Math.floor(snap / 50);
                let secondChild = (snap % 50);
                let newCard = whiteOrder[firstChild][secondChild];
                //find auctally card location
                let firstNum = Math.floor(newCard / 50)
                let secondNum = newCard % 50
                currentPlayerRef.child((host ? "host" : currentUid) + "/hand").child(card).set(newCard).then(function(snap) {
                    whiteCardRef.child(firstNum).child(secondNum).once("value", function(snap) {}).then(function(snap) {
                        makeElement.newWhiteCard(card, snap.val(), newCard)
                    })
                })
                snap = snap + 1;
                return snap;
            });
        },
        showAllChoices: function(currentBlack, currentTurn, pick, host) {
            //display modal
            modal.style.display = "block";
            toastr.clear();
            currentPlayerRef.once("value", function(snap) {
                //create a obj to sotre all teh cards
                let blackCards = {};
                snap.forEach(function(childSnap) {
                        //make sure it isn this users turn
                        if (currentTurn !== childSnap.key) {
                            let key = childSnap.key
                            blackCards[key] = {}
                                //add display name
                            blackCards[key].name = childSnap.val().displayName;
                            blackCards[key].firstPick = childSnap.val().chosenWhiteCard1;
                            blackCards[key].secondPick = childSnap.val().chosenWhiteCard2;
                            //get first pick text

                        }
                    })
                    //get a array of all the players
                let players = Object.keys(blackCards)
                let total = players.length
                for (var i = 0; i < total; i++) {
                    //get random player
                    let randNum = Math.floor(Math.random() * players.length)
                    let rand = players[randNum]

                    if (pick === 1) {
                        //find white card text
                        let firstPick = blackCards[rand].firstPick
                        let firstNum = Math.floor(firstPick / 50)
                        let secondNum = firstPick % 50
                        whiteCardRef.child(firstNum).child(secondNum).once("value", function(card) {
                            blackCards[rand].firstPick = card.val()


                        }).then(function() {
                            let args = {
                                    currentBlack: currentBlack,
                                    displayName: blackCards[rand].name,
                                    firstPick: blackCards[rand].firstPick,
                                    host: host
                                }
                                //build display black card with white card text
                            buildBlackSelected(args)
                        })

                    }
                    //second picks text
                    if (pick === 2) {
                        let firstPick = blackCards[rand].firstPick
                        let firstNum = Math.floor(firstPick / 50)
                        let secondNum = firstPick % 50
                        whiteCardRef.child(firstNum).child(secondNum).once("value", function(card) {
                            blackCards[rand].firstPick = card.val()


                        }).then(function() {
                            let secondPick = blackCards[rand].secondPick
                            let firstNum = Math.floor(secondPick / 50)
                            let secondNum = secondPick % 50
                            whiteCardRef.child(firstNum).child(secondNum).once("value", function(card) {
                                blackCards[rand].secondPick = card.val()
                                console.log("second pick:", blackCards[rand].secondPick, card.val())

                            }).then(function() {
                                let args = {
                                    currentBlack: currentBlack,
                                    displayName: blackCards[rand].name,
                                    firstPick: blackCards[rand].firstPick,
                                    secondPick: blackCards[rand].secondPick,
                                    host: host
                                }
                                buildBlackSelected(args)
                            })
                        })
                    }
                    players.splice(randNum, 1)

                }
                if (currentTurn === (host ? "host" : currentUid)) {
                    toastr.warning("<h1>Pick a Winner</h1>", "", { positionClass: "toast-top-full-width", preventDuplicates: true, timeOut: 0, extendedTimeOut: 0 })
                }

            })
        }

    } //fireObj

fireObj.gameState = gameState;
