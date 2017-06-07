var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
// btn.onclick = function() {
//     modal.style.display = "block";
//     //buildBlackSelected("this is first word  this is the second right herer?", "bob", "word1", "word2");
// }

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//     if (event.target == modal) {
//         modal.style.display = "none";
//     }
// }

// args = blackCard, displayName, firstPick, secondPick, host
function buildBlackSelected(args) {
    //blackCard, player,  (whiteCard, whiteCard), host
    let text = ""
    let host = false;
    let displayName = args.displayName;
    let blackCard = args.currentBlack
    if (Object.keys(args).length === 4) {
        host = args.host;
        if (blackCard.indexOf("_") === -1) {
            text = blackCard + "<br>" + "<span class='white-text'>" + args.firstPick + "</span>"
        } else {
            text = blackCard.replace(/_/g, "<span class='white-text'>" + args.firstPick + "</span>")
        }
    } else if (Object.keys(args).length === 5) {
        host = args.host;
        if (blackCard.indexOf("_") === -1) {
            text = blackCard + "<br>" + "<span class='white-text'>" + args.firstPick + "</span>" + "<br>" + "<span class='white-text'>" + args.secondPick + "</span>"
        } else {
            text = blackCard.replace(/_/, "<span class='white-text'>" + args.firstPick + "</span>")
            text = text.replace(/_/, "<span class='white-text'>" + args.secondPick + "</span>")
        }
    }
    let cardContainer = $('<div>').addClass('col-md-3');

    let flipContainer = $('<div>').addClass('flip-container').attr("id", displayName);
    cardContainer.append(flipContainer);

    let flipper = $('<div>').addClass('flipper');
    flipContainer.append(flipper);

    let front = $('<div>').addClass('front front-black');
    flipper.append(front);
    let textFront = $('<p>').html('Coders<br>Against<br>Humanity')
    front.append(textFront);

    let back = $('<div>').addClass('back back-black');
    flipper.append(back);
    let textBack = $('<p>').html(text)
    back.append(textBack);
    let name = $("<p>").text(displayName).addClass("black-card-name")
    back.append(name)

    $('#selectedBlack').append(cardContainer);
    cardFlip(cardContainer)
    currentGameRef.child("currentTurn").once("value", function(snap) {
        if (snap.val() === (host ? "host" : currentUid)) {
            makeElement.blackCardClick(displayName)
        }
    })
}
