let buildList = function(key) {
    playerRef.child(key).on("child_added", function(snap) {
        //listen for players joining to update the screen
        //call update players screen
        let displayName = snap.val().displayName
        makeElement.buildPlayerList(key, snap.key, displayName);


    });
}
let showHand = function(key, whiteOrder) {
    $("#waiting").hide();
    $("#hideCards").show();
    gameRef.child(key).child("players").once("value", function(snap) {
        playerRef.child(snap.val()).child(currentUid).child("hand").once("value", function(snap) {
            for (let i = 0; i < 7; i++) {
                let cardNum = snap.val()[i]
                let firstChild = Math.floor(cardNum / 50);
                let secondChild = cardNum % 50
                whiteCardRef.child(firstChild).child(secondChild).once("value", function(snap) {
                    makeElement.newWhiteCard("card" + (i + 1), snap.val(), cardNum)
                })
            }
        })
    })


}



let getCurrentTurn = function() {
    return currentGameRef.once("value").then(function(snap) {
        let returnObj = {};
        returnObj.currentTurn = snap.val().currentTurn;
        returnObj.blackCount = snap.val().blackCount
        currentPlayerRef.child(returnObj.currentTurn).once("value", function(snap) {
            $("#current-turn-name").text(snap.val().displayName)
        })
        return returnObj
    })
}
let newGetBlackCard = function(blackOrder) {

    let returnObj = {}
    let info = Promise.resolve(getCurrentTurn())
    let result = info.then(function(result) {
        returnObj.currentTurn = result.currentTurn;

        let firstNum = Math.floor(result.blackCount / 50);
        let secondNum = result.blackCount % 50;
        blackNum = blackOrder[firstNum][secondNum]
            //find card location
        let firstChild = Math.floor(blackNum / 50)
        let secondChild = blackNum % 50
        return blackCardRef.child(firstChild).child(secondChild).once("value").then(function(snap) {
            returnObj.pick = snap.val().pick;
            returnObj.currentBlack = snap.val().text;
            makeElement.newWhiteCard("black", returnObj.currentBlack);
            return returnObj
        })
    })
    return result
}
let reJoin = {
    buildList: buildList,
    showHand: showHand,
    newGetBlackCard: newGetBlackCard
}
let setBadgeColor = function() {

    currentPlayerRef.on("value", function(snap) {

        let first = 0;
        let second = 0;
        let third = 0;
        let firstId = "";
        let secondId = "";
        let thirdId = "";
        snap.forEach(function(childSnap) {
                let blackCount = childSnap.val().playerBlackCount
                if (blackCount > first) {
                    third = second;
                    thirdId = secondId;
                    second = first;
                    secondId = firstId;
                    first = blackCount;
                    firstId = childSnap.key;
                } else if (blackCount > second) {
                    third = second;
                    thirdId = secondId;
                    second = blackCount;
                    secondId = childSnap.key
                } else if (blackCount > third) {
                    third = blackCount;
                    thirdId = childSnap.key
                }

            }) //forEach
        snap.forEach(function(childSnap) {
            let blackCount = childSnap.val().playerBlackCount
            if (childSnap.key === firstId) {
                $("#" + firstId + "blackCount").parent(".badge").css("background", "gold")
            } else if (childSnap.key === secondId) {
                if (second === first && first !== 0) {
                    $("#" + secondId + "blackCount").parent(".badge").css("background", "gold")
                } else {
                    $("#" + secondId + "blackCount").parent(".badge").css("background", "silver")
                }
            } else if (childSnap.key === thirdId) {
                if (third === first && first !== 0) {
                    $("#" + thirdId + "blackCount").parent(".badge").css("background", "gold")
                } else if (third === second && second !== 0) {
                    $("#" + thirdId + "blackCount").parent(".badge").css("background", "silver")
                } else {
                    $("#" + thirdId + "blackCount").parent(".badge").css("background", "darkgoldenrod")
                }
            } else {
                if (blackCount === first && first !== 0) {
                    $("#" + childSnap.key + "blackCount").parent(".badge").css("background", "gold")
                } else if (blackCount === second && second !== 0) {
                    $("#" + childSnap.key + "blackCount").parent(".badge").css("background", "silver")
                } else if (blackCount === third && third !== 0) {
                    $("#" + childSnap.key + "blackCount").parent(".badge").css("background", "darkgoldenrod")
                } else {
                    $("#" + childSnap.key + "blackCount").parent(".badge").css("background", "black")
                }

            }
        })


    })
}

//if on chooseBlack or picjWhite have host check for disconnected players and 
//id give host option to remove the
// remove player for playersref delete from playerOrder and jump to showCards
