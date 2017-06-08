gameState = function(key, rejoined) {
    let host = false;
    let reJoined = rejoined
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
    let pick = 0;
    let currentTurn = "";
    let currentBlack = "";
    let blackNum = 0;
    let haveDisconnect = false;
    let disconnectTO = "";
    $(".hide-create").hide();
    $(".hide-waiting").show();

    currentGameRef = gameRef.child(key);
    currentChatRef = currentGameRef.child('chat');
    currentChatRef.on('child_added', function(snap) {
        if (snap.key === 'chat') {} else {
            let newDiv = $("<div>");
            let message = $("<p>").text(snap.val().message);
            let name = $("<strong>").text(snap.val().displayName + ": ");
            message.prepend(name);
            newDiv.append(message);
            $("#chat").append(newDiv)
        }
    });
    currentGameRef.once("value", function(snap) {

            //grab all data needed to have stored
            blackOrder = snap.val().blackOrder;
            localWhiteOrder = snap.val().whiteOrder;
            whiteOrder = localWhiteOrder;
            winLimit = snap.val().winLimit;
            playerKey = snap.val().players;
            playerMax = snap.val().playerLimit;
            if (snap.val().host.toString() === currentDisplayName) {
                //set true if you are the host
                host = true;
            }
            //add host name to top of waiting for players
            let newTr = $("<tr>");
            let name = $("<td>").text(snap.val().host);
            let player = $("<td>").html("<span id ='waitPlayers'>1</span>/" + playerMax);
            player.addClass('text-center');
            let win = $("<td>").text(winLimit);
            win.addClass('text-center');
            newTr.append(name);
            newTr.append(player);
            newTr.append(win);
            $("#waiting-host-table").html("<tr><th>Host</th><th class='text-center'>Players Joined</th><th class='text-center'>Cards</th></tr>")
            $("#waiting-host-table").append(newTr);
            //update total player count
            currentGameRef.child("totalPlayers").on("value", function(snap) {
                $("#waitPlayers").text(snap.val());
            })




        }).then(function() {
            currentPlayerRef = playerRef.child(playerKey);
            if (!host) {
                currentPlayerRef.child(currentUid).onDisconnect().update({
                    playerState: {
                        connected: 0,
                        timeStamp: firebase.database.ServerValue.TIMESTAMP
                    }
                })
            }
            if (reJoined) {
                currentPlayerRef.child(currentUid).child("playerState").update({
                    connected: 1,
                    timeStamp: 0
                })
            }
            currentGameRef.child("state").on("value", function(snap) {
                    let data = snap.val();
                    if (data === null) {
                        //TODO: call quitgame functions
                        currentPlayerRef.child(currentUid).onDisconnect().cancel()
                        modal.style.display = "none";
                        $("#hideCards").unwrap()
                        userRef.child(currentUid).update({
                            joinedGame: ""
                        })
                        if (host) {
                            currentGameRef.remove()
                            currentPlayerRef.remove()
                            currentPlayerRef.onDisconnect().cancel()
                            currentGameRef.onDisconnect().cancel()
                        }
                        toastr.clear();
                        currentPlayerRef.child(currentUid).onDisconnect().cancel()
                        currentGameRef.child("state").off()
                        fireObj.globalChatOn();
                        $("#waiting").hide();
                        $(".hide-waiting").hide();
                        $(".hide-create").show();
                        $("#hideCards").hide();
                        currentChatRef.off();
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

                                fireObj.globalChatOff();
                                //TODO: hide game list
                                $("#current-turn-name").text("");
                                for (var i = 0; i < 4; i++) {
                                    $("#row" + i).html("");
                                }
                                $("#waiting-player-table").html("<tbody><tr> <th>Players</th></tr></tbody>");
                                if (!host && !reJoined) {
                                    // if not the host build and add player object based on player uid
                                    fireObj.buildPlayerObj(key, playerKey)
                                    userRef.child(currentUid).update({
                                        joinedGame: key
                                    })
                                }
                                // ---- QUIT GAME LISTENER ---- //
                                $('body').on('click', '#quit-game-confirm', function() {
                                    $('.cd-popup').removeClass('is-visible');
                                    if (!host) {
                                        currentPlayerRef.child(currentUid).remove();
                                        userRef.child(currentUid).update({
                                            joinedGame: ''
                                        })
                                    }
                                });

                                // currentGameRef.child("totalPlayers").on("value", function(snap) {
                                //         $("#currentPlay").text(snap.val());

                                //     })

                                //show waitng for game to start screen
                                currentPlayerRef.on("child_added", function(snap) {
                                    //listen for players joining to update the screen
                                    //call update players screen
                                    let displayName = snap.val().displayName
                                    makeElement.buildPlayerList(playerKey, snap.key, displayName);
                                    if (host) playerOrder.push(snap.key);
                                    let newPlayer = $("<th>").text(displayName);
                                    let newTr = $("<tr>");
                                    newTr.append(newPlayer);
                                    $("#waiting-player-table tbody").append(newTr);
                                    if (host) {

                                        if (playerOrder.length >= 4) {
                                            $("#loading-gif").hide();
                                            $("#forceStart").show();

                                            //if player count >= 4 allow host to start

                                        }
                                        // if the host listen for player count to playerLimit
                                    } //if

                                }); //currentPlayerRef.on()


                                //the host starts game and changes to next state
                                break;
                            case (state.ready):
                                currentGameRef.child("totalPlayers").off()
                                currentPlayerRef.off()
                                setBadgeColor()
                                fireObj.dealSevenCards(playerKey, whiteOrder, host);
                                $("#waiting").hide();
                                $("#hideCards").show();

                                // deal out cards
                                // display cards their cards
                                //call next state
                                break;
                            case (state.chooseBlack):
                                if (rejoined) {
                                    reJoin.showHand(key, whiteOrder);
                                    reJoin.buildList(playerKey);
                                    reJoined = false;
                                }
                                toastr.clear();
                                if (host) {
                                    let timeOutCount = 0;
                                    disconnectTO = setInterval(function() {
                                        currentPlayerRef.once("value", function(snap) {
                                            let playerDisconnected = false;
                                            let disconnectedKey = "";
                                            let disconnectCount = 0;
                                            snap.forEach(function(childSnap) {
                                                    //check for disconnect
                                                    if (childSnap.val().playerState.connected === 2) {
                                                        currentPlayerRef.child(childSnap.key).remove()
                                                        let index = playerOrder.indexOf(childSnap.key);
                                                        playerOrder.splice(index, 1)
                                                    } else if (!childSnap.val().playerState.connected) {
                                                        //grab player key and increase count
                                                        playerDisconnected = true;
                                                        disconnectedKey = childSnap.key;
                                                        console.log(disconnectedKey)
                                                        disconnectCount++
                                                    } //if
                                                }) //forEach
                                            if (disconnectCount > 1) {
                                                //if more than one disconnect quit game
                                                currentGameRef.remove();
                                            } else if (playerDisconnected) {
                                                clearInterval(disconnectTO);
                                                //if player disconnected check ever second for 30 secions if the reconnected yet
                                                let counter = 0;
                                                let interval = setInterval(function() {
                                                    currentPlayerRef.child(disconnectedKey).once("value", function(snap) {
                                                        counter++
                                                        if (counter >= 10) {
                                                            //at 30 cehcks delete player from playersred and playerorder adn proceed to nect state
                                                            currentPlayerRef.child(disconnectedKey).remove()
                                                            clearInterval(interval)
                                                            let index = playerOrder.indexOf(disconnectedKey);
                                                            playerOrder.splice(index, 1)
                                                            if (disconnectedKey === currentTurn) {
                                                                //if their turn skip to nect turn
                                                                currentPlayerRef.once("value", function(snap) {
                                                                    if (snap.numChildren() < 4) {
                                                                        currentGameRef.update({
                                                                            state: state.quitGame
                                                                        })
                                                                    } else {
                                                                        currentGameRef.update({
                                                                            state: state.nextTurn
                                                                        })
                                                                    }
                                                                })

                                                            } else {
                                                                //if not their turn skip to pickWhite
                                                                let allPicked = true;
                                                                currentPlayerRef.once("value", function(snap) {
                                                                    snap.forEach(function(snap) {
                                                                        if (snap.key != currentTurn && allPicked) {
                                                                            if (snap.val().chosenWhiteCard1 === "") {
                                                                                allPicked = false;
                                                                            } //if2
                                                                        } //if1
                                                                    })
                                                                    if (allPicked) {
                                                                        currentPlayerRef.once("value", function(snap) {
                                                                            if (snap.numChildren() < 4) {
                                                                                currentGameRef.update({
                                                                                    state: state.quitGame
                                                                                })
                                                                            } else {
                                                                                currentGameRef.update({
                                                                                    state: state.pickWhite
                                                                                })
                                                                            }
                                                                        })

                                                                    } else { //if
                                                                        currentPlayerRef.once("value", function(snap) {
                                                                            if (snap.numChildren() < 4) {
                                                                                currentGameRef.update({
                                                                                    state: state.quitGame
                                                                                })
                                                                            } else {
                                                                                currentGameRef.update({
                                                                                    state: state.pickWhite
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                    //then
                                                                })

                                                            }
                                                        }
                                                        if (snap.val().playerState.connected) {
                                                            //if reconnect do nothing because if their turn it will go to nect state anyway
                                                            //if isnth thier turn wont change til they select
                                                            clearInterval(interval);
                                                        } //if
                                                    })
                                                }, 500)
                                            }

                                        })
                                    }, 1000)
                                }

                                currentGameRef.child("currentTurn").once("value", function(snap) {
                                    //display black card
                                    currentTurn = snap.val()
                                    currentPlayerRef.child(currentTurn).once("value", function(snap) {
                                        $("#current-turn-name").text(snap.val().displayName)
                                    })

                                })
                                currentGameRef.child("blackCount").once("value", function(snap) {
                                    //find blackCOunt
                                    let firstNum = Math.floor(snap.val() / 50);
                                    let secondNum = snap.val() % 50;
                                    blackNum = blackOrder[firstNum][secondNum]
                                        //find card location
                                    let firstChild = Math.floor(blackNum / 50)
                                    let secondChild = blackNum % 50
                                    blackCardRef.child(firstChild).child(secondChild).once("value", function(snap) {
                                        pick = snap.val().pick;
                                        currentBlack = snap.val().text;
                                        makeElement.newWhiteCard("black", currentBlack);
                                    }).then(function() {
                                        if (currentTurn !== (host ? "host" : currentUid)) {
                                            toastr.warning("<h1>Pick " + pick + (pick === 2 ? " cards" : " card" + "</h1>"), "", { positionClass: "toast-top-full-width", preventDuplicates: true, timeOut: 0, extendedTimeOut: 0 })
                                                // set you as chooser of white card
                                                // need to deal with 1 or 2 clicks
                                            makeElement.mainClick(pick, host, currentTurn);

                                        } //if
                                    })
                                })

                                break;

                                // break;
                            case (state.pickWhite):
                                if (host) {
                                    clearInterval(disconnectTO);
                                }
                                if (reJoined) {
                                    reJoin.showHand(key, whiteOrder);
                                    let playerReJoin = Promise.resolve(reJoin.newGetBlackCard(blackOrder))
                                    playerReJoin.then(function(result) {

                                            reJoin.buildList(playerKey);
                                            currentBlack = result.currentBlack;
                                            currentTurn = result.currentTurn;
                                            pick = result.pick;
                                            console.log(result)
                                            reJoined = false;
                                            fireObj.showAllChoices(currentBlack, currentTurn, pick, host);
                                        })
                                        // reJoin.buildList(playerKey);
                                        // currentBlack = playerReJoin.currentBlack;
                                        // currentTurn = playerReJoin.currentTurn;
                                        // pick = playerReJoin.pick;
                                        // console.log(playerReJoin)
                                        // reJoined = false;
                                }
                                //prevent it getting stuck on state change
                                $(".shBtn").hide();
                                //display all choosed white cards to everyone in random order
                                if (!reJoined) fireObj.showAllChoices(currentBlack, currentTurn, pick, host);
                                if (host) {
                                    let timeOutCount = 0;
                                    disconnectTO = setInterval(function() {
                                        currentPlayerRef.once("value", function(snap) {
                                            let playerDisconnected = false;
                                            let disconnectedKey = "";
                                            let disconnectCount = 0;
                                            snap.forEach(function(childSnap) {
                                                    //check for disconnect
                                                    if (childSnap.val().playerState.connected === 2) {
                                                        currentPlayerRef.child(childSnap.key).remove()
                                                        let index = playerOrder.indexOf(childSnap.key);
                                                        playerOrder.splice(index, 1)
                                                    } else if (!childSnap.val().playerState.connected) {
                                                        //grab player key and increase count
                                                        playerDisconnected = true;
                                                        disconnectedKey = childSnap.key;
                                                        console.log(disconnectedKey)
                                                        disconnectCount++
                                                    } //if
                                                }) //forEach
                                            if (disconnectCount > 1) {
                                                //if more than one disconnect quit game
                                                currentGameRef.remove();
                                            } else if (playerDisconnected) {
                                                clearInterval(disconnectTO);
                                                //if player disconnected check ever second for 30 secions if the reconnected yet
                                                let counter = 0;
                                                let interval = setInterval(function() {
                                                    currentPlayerRef.child(disconnectedKey).once("value", function(snap) {
                                                        counter++
                                                        if (counter >= 10) {
                                                            //at 30 cehcks delete player from playersred and playerorder adn proceed to nect state
                                                            currentPlayerRef.child(disconnectedKey).remove()
                                                            clearInterval(interval)
                                                            let index = playerOrder.indexOf(disconnectedKey);
                                                            playerOrder.splice(index, 1)
                                                            if (disconnectedKey === currentTurn) {
                                                                //if their turn skip to nect turn
                                                                currentPlayerRef.once("value", function(snap) {
                                                                    if (snap.numChildren() < 4) {
                                                                        currentGameRef.update({
                                                                            state: state.quitGame
                                                                        })
                                                                    } else {
                                                                        currentGameRef.update({
                                                                            state: state.nextTurn
                                                                        })
                                                                    }
                                                                })

                                                            } else {

                                                                currentPlayerRef.once("value", function(snap) {
                                                                    if (snap.numChildren() < 4) {
                                                                        currentGameRef.update({
                                                                            state: state.quitGame
                                                                        })
                                                                    } else if (disconnectedKey === currentTurn) {
                                                                        currentGameRef.update({
                                                                            state: state.nextTurn
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        }
                                                        if (snap.val().playerState.connected) {
                                                            //if reconnect do nothing because if their turn it will go to nect state anyway
                                                            //if isnth thier turn wont change til they select
                                                            clearInterval(interval);
                                                        } //if
                                                    })
                                                }, 500)
                                            }

                                        })
                                    }, 1000)
                                }

                                // if (currentTurn === (host ? "host" : currentUid)) {
                                //     currentGameRef.child("blackCount").transaction(function(snap) {
                                //             return snap + 1
                                //         })
                                //         // set you as chooser of white card
                                // } //if

                                //currentGameRef
                                //current player turn chooses a white card to win
                                // set min time or wait 5sec after pick
                                break;
                            case (state.showCards):
                                clearInterval(disconnectTO);
                                if (reJoined) {
                                    console.log(blackOrder)
                                    let playerReJoin = Promise.resolve(reJoin.newGetBlackCard(blackOrder))
                                    playerReJoin.then(function(result) {

                                        reJoin.buildList(playerKey);
                                        currentBlack = result.currentBlack;
                                        currentTurn = result.currentTurn;
                                        pick = result.pick;
                                        console.log(result)
                                        reJoined = false;
                                        fireObj.showAllChoices(currentBlack, currentTurn, pick, host);
                                    })
                                }
                                $(".black-card-name").show()
                                currentGameRef.child("winner").once("value", function(snap) {
                                    currentPlayerRef.child(snap.val()).once("value", function(snap) {
                                        $("#" + snap.val().displayName + " .flipper .back").css("background", "gold");
                                    })
                                    if (snap.val() === (host ? "host" : currentUid)) {
                                        currentPlayerRef.child((host ? "host" : currentUid)).child("blackCards").child(blackNum).set(true)
                                        currentPlayerRef.child((host ? "host" : currentUid)).child("playerBlackCount").transaction(function(snap) {
                                                return snap + 1
                                            })
                                            //ad black card to user's profile totals
                                        userRef.child(currentUid).child("blackCards").once("value", function(snap) {
                                            let firstChild = Math.floor(blackNum / 50);
                                            let secondChild = blackNum % 50;
                                            if (snap.child(firstChild).child(secondChild).exists()) {
                                                userRef.child(currentUid + "/blackCards").child(firstChild).child(secondChild).transaction(function(snap) {
                                                    return snap + 1;
                                                })
                                            } else {
                                                userRef.child(currentUid + "/blackCards").child(firstChild).child(secondChild).set(1)
                                            }
                                        })
                                    }

                                })
                                if (host) {
                                    currentPlayerRef.once("value", function(snap) {
                                        playerDisconnected = false;
                                        discconnectedKey = "";
                                        let disconnectCount = 0;
                                        snap.forEach(function(childSnap) {
                                            //check for disconnect
                                            if (childSnap.val().playerState.connected === 2) {
                                                currentPlayerRef.child(childSnap.key).remove()
                                                let index = playerOrder.indexOf(childSnap.key);
                                                playerOrder.splice(index, 1)
                                            } else if (!childSnap.val().playerState.connected) {
                                                //grab player key and increase count
                                                playerDisconnected = true;
                                                discconnectedKey = snap.key;
                                                disconnectCount++
                                            }
                                        })
                                        if (disconnectCount > 1) {
                                            //if more than one disconnect quit game
                                            currentGameRef.remove()
                                        } else if (playerDisconnected) {
                                            //if player disconnected check ever second for 30 secions if the reconnected yet
                                            let counter = 0;
                                            let interval = setInterval(function() {
                                                currentPlayerRef.child(discconnectedKey).once("value", function(snap) {
                                                    counter++
                                                    if (counter >= 30) {
                                                        //at 30 cehcks delete player from playersred and playerorder adn proceed to nect state
                                                        currentPlayerRef.child(discconnectedKey).remove()
                                                        clearInterval(interval)
                                                        let index = playerOrder.indexOf(discconnectedKey);
                                                        playerOrder.splice(index, 1)
                                                        currentPlayerRef.once("value", function(snap) {
                                                            if (snap.numChildren() < 4) {
                                                                currentGameRef.update({
                                                                    state: state.quitGame
                                                                })
                                                            } else {
                                                                currentGameRef.update({
                                                                    state: state.nextTurn
                                                                })
                                                            }
                                                        })

                                                    }
                                                    if (snap.val().playerState.connected) {
                                                        //if the reconnect go to nect state;
                                                        setTimeout(function() {
                                                            currentGameRef.update({
                                                                state: state.nextTurn
                                                            })
                                                        }, 5000)

                                                        clearInterval(interval);
                                                    } //if
                                                })
                                            }, 1000)
                                        } else {
                                            //if none disconnected move to next state
                                            setTimeout(function() {
                                                currentGameRef.update({
                                                    state: state.nextTurn
                                                })
                                            }, 5000)
                                        }

                                    })

                                }
                                // show owner of each white card
                                //award black card to winner
                                break;
                            case (state.nextTurn):
                                modal.style.display = "none";
                                $("#hideCards").unwrap()
                                currentPlayerRef.child((host ? "host" : currentUid)).update({
                                    chosenWhiteCard1: "",
                                    chosenWhiteCard2: "",
                                })
                                if (currentTurn === (host ? "host" : currentUid)) {
                                    currentGameRef.child("blackCount").transaction(function(snap) {
                                            return snap + 1
                                        })
                                        // set you as chooser of white card
                                } //if
                                $('#selectedBlack').html("")
                                if (host) {
                                    playerTurnCount++;
                                    if (playerTurnCount === playerOrder.length) {
                                        playerTurnCount = 0;
                                    }
                                    currentGameRef.update({
                                        currentTurn: playerOrder[playerTurnCount]
                                    })
                                }
                                if (host) {
                                    currentPlayerRef.once("value", function(snap) {

                                        let winner = false;
                                        snap.forEach(function(snap) {
                                            if (snap.val().playerBlackCount === parseInt(winLimit)) {
                                                //winner(snap.key)

                                                winner = true;

                                            }

                                        })
                                        if (winner) {
                                            currentGameRef.update({
                                                state: state.gameOver
                                            })
                                        } else {
                                            currentGameRef.update({
                                                state: state.chooseBlack
                                            })
                                        }
                                    })
                                }
                                //check if somebody had reached score limit
                                //if not start from state.chooseBlack
                                //else go to state.gameOver
                                break;
                            case (state.gameOver):
                                toastr.clear()
                                currentPlayerRef.once("value", function(snap) {
                                    snap.forEach(function(childSnap) {
                                        currentPlayerRef.child(childSnap.key).child("blackCount").off()
                                    })
                                })
                                let gameWinner = ""
                                let amWinner = false;
                                currentPlayerRef.once("value", function(snap) {
                                        snap.forEach(function(childSnap) {
                                            if (childSnap.val().playerBlackCount === parseInt(winLimit)) {

                                                if (childSnap.key === (host ? "host" : currentUid)) {
                                                    amWinner = true;
                                                }
                                                gameWinner = childSnap.key
                                                let isSet = false;
                                                for (var i = 0; i < 4; i++) {
                                                    if ($("#winnerRow" + i).children().length < 2 && !isSet) {
                                                        let newTd = $("<td>").text(childSnap.val().displayName + " - ");
                                                        let badgeSpan = $('<span>').addClass('badge').css("background", "gold");
                                                        let newSpan = $("<span>").text(childSnap.val().playerBlackCount);
                                                        let newGlyph = $("<span>").addClass("glyphicon glyphicon-stop");
                                                        badgeSpan.append(newSpan).append(newGlyph);
                                                        newTd.append(badgeSpan);
                                                        $("#winnerRow" + i).append(newTd);
                                                        isSet = true;

                                                    }

                                                }
                                            } else {
                                                let isSet = false;
                                                for (var i = 0; i < 4; i++) {
                                                    if ($("#winnerRow" + i).children().length < 2 && !isSet) {
                                                        let newTd = $("<td>").text(childSnap.val().displayName + " - ");
                                                        let badgeSpan = $('<span>').addClass('badge');
                                                        let newSpan = $("<span>").text(childSnap.val().playerBlackCount);
                                                        let newGlyph = $("<span>").addClass("glyphicon glyphicon-stop");
                                                        badgeSpan.append(newSpan).append(newGlyph);
                                                        newTd.append(badgeSpan);
                                                        $("#winnerRow" + i).append(newTd);
                                                        isSet = true;

                                                    }

                                                }
                                            }
                                        })
                                        if (amWinner) {
                                            $("#winner-animation").show();
                                            setTimeout(function() {
                                                $("#winner-animation").fadeOut();
                                            }, 4000)
                                            $("#loser").hide()
                                            $("#winner").show()
                                        } else {
                                            $("#sad-face-animation").show();
                                            setTimeout(function() {
                                                $("#sad-face-animation").fadeOut();
                                            }, 4000)
                                        }
                                        currentChatRef.off("child_added")
                                        currentChatRef.on('child_added', function(snap) {
                                            if (snap.key === 'chat') {} else {
                                                let newDiv = $("<div>");
                                                let message = $("<p>").text(snap.val().message);
                                                let name = $("<strong>").text(snap.val().displayName + ": ");
                                                message.prepend(name);
                                                newDiv.append(message);
                                                $("#results-chat-body").append(newDiv)
                                            }
                                        });
                                        $('#btn-result-chat').on('click', function() {
                                            let message = $('#btn-result-input').val().trim();
                                            $('#btn-result-input').val('');
                                            if (message === '') {
                                                toastr.error('Your message was empty...maybe try typing something...', '', {
                                                    closeButton: true,
                                                    timeout: 10000,
                                                    positionClass: 'toast-bottom-right'
                                                });
                                            } else if (message.startsWith('/')) {
                                                api.checkCall(message);
                                            } else {
                                                // check if searchQuery starts with '/', for api call error
                                                currentGameRef.child('chat').push().set({
                                                    message: message,
                                                    displayName: currentDisplayName,
                                                    timeStamp: firebase.database.ServerValue.TIMESTAMP
                                                });
                                            }
                                        });
                                        $('#endModal').show();
                                        $("#main-view").wrap("<div class='blur'></div>");
                                        $("#btn-quit-game").on("click", function() {
                                            userRef.child(currentUid).update({
                                                joinedGame: ""
                                            })
                                            toastr.clear();
                                            currentPlayerRef.child(currentUid).onDisconnect().cancel()
                                            currentChatRef.off();
                                            currentGameRef.child("state").off()
                                            fireObj.globalChatOn();
                                            if (host) {
                                                currentPlayerRef.onDisconnect().cancel()
                                                currentGameRef.onDisconnect().cancel()
                                            }
                                            $('#btn-result-chat').off()
                                            $("#waiting").hide();
                                            $(".hide-waiting").hide();
                                            $(".hide-create").show();
                                            $("#hideCards").hide();
                                            $('#endModal').hide();
                                            $("#main-view").unwrap();
                                            $("btn-quit-game").off();
                                            currentPlayerRef.once("value", function(snap) {
                                                if (snap.numChildren() < 2) {
                                                    currentGameRef.remove()
                                                    currentPlayerRef.remove()
                                                } else {
                                                    currentPlayerRef.child((host ? "host" : currentUid)).remove()
                                                }
                                            })
                                        })
                                    })
                                    //allow users to return to match making screen
                                break;
                            case (state.quitGame):
                                modal.style.display = "none";
                                $("#hideCards").unwrap()
                                userRef.child(currentUid).update({
                                    joinedGame: ""
                                })
                                if (host) {
                                    currentGameRef.remove()
                                    currentPlayerRef.remove()
                                    currentPlayerRef.onDisconnect().cancel()
                                    currentGameRef.onDisconnect().cancel()
                                }
                                toastr.clear();
                                currentPlayerRef.child(currentUid).onDisconnect().cancel()
                                currentChatRef.off();
                                currentGameRef.child("state").off()
                                fireObj.globalChatOn();
                                $("#waiting").hide();
                                $(".hide-waiting").hide();
                                $(".hide-create").show();
                                $("#hideCards").hide();

                                break;
                        } //switch
                    } //else

                }) //currentgame.on
        }) //then
}
