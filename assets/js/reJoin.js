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
            console.log(returnObj)
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

//if on chooseBlack or picjWhite have host check for disconnected players and 
//id give host option to remove the
// remove player for playersref delete from playerOrder and jump to showCards
