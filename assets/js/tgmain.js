///////////////// TESTING BELOW ////////////////////


// CHAT TESTING //
// var sentMessageText = 'This is the Song that never ends...';
// var player1 = 'Tanner';
// var timeSent = '49 mins ago';
//
// var receivedMessageText = '... it just goes on and on again!';
// var player2 = 'Danny';
// var timeReceived = '23 mins ago';
//
// $('#btn-chat').on('click', function() {
//
//     sentMessageText = $('#btn-input').val().trim();
//     console.log(sentMessageText)
//
//     makeElement.buildSentMessage(player1, sentMessageText, timeSent);
//
//     makeElement.buildReceivedMessage(player2, receivedMessageText, timeReceived);
//     $('#btn-input').val('');
// })

/// FLIP CONTAINER TEST //

// Modal Card Listener //
$('#selectedBlack').on('click', '.flip-container', function() {
    cardFlip(this);

    console.log('flip container', this);
});


function cardFlip(el) {

    if ($(el).hasClass('flip')) {
        $(el).removeClass('flip');
    } else {
        $(el).addClass('flip');
    }

}


// Game Card Listener //
$('.flip-container').on('click', function() {

    if ($(this).hasClass('flip')) {
        $(this).removeClass('flip');
    } else {
        $(this).addClass('flip');
    }

})

// NEW WHITE CARD TEST //
// var card = 'card2'; //data from obj
// var whiteCard = 'My humps.'; //data from obj

// $('#' + card).on('click', function() {
//     makeElement.newWhiteCard()
// })
function setCaretPosition(elemId, caretPos) {
    var elem = document.getElementById(elemId);

    if (elem != null) {
        if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else {
            if (elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            } else
                elem.focus();
        }
    }
}

$('.chat_input').on('focusin', function() {
    // chatCallback
    $('#btn-input').on('keyup', function(event) {
        if (event.keyCode === 13) {
            chatCallback();
        }
    });

    $('#global-input').on('keyup', function(event) {
        if (event.keyCode === 13) {
            globalChatCallback();
        }
    });
});

$('.chat_input').on('focusout', function() {
    $('#global-input').off('keyup');
    $('#btn-input').off('keyup');
});

$('#urbanDict').on('click', function() {
    $('.chat_input').val('/Urban ""');
    setCaretPosition('btn-input', 8);
    $('.urbantip .tooltiptext').hide();
})

$('#pearsonDict').on('click', function() {
    $('.chat_input').val('/Dict ""');
    setCaretPosition('btn-input', 7);
    $('.urbantip .tooltiptext').hide();
})


$('.urbantip').hover(function() {
    $('.urbantip .tooltiptext').show();
}, function() {
    $('.urbantip .tooltiptext').hide();
})

////// Modals //////
// Show Results Modal
$('#myBtn').on('click', function() {
    // CODE NEED FOR PROJECT BELOW
    $('#endModal').show();
    $("#main-view").wrap("<div class='blur'></div>");
});
// Hide Results Modal
// $('#btn-quit-game').on('click', function() {
            //     // CODE NEED FOR PROJECT BELOW
            //     $('#main-view').unwrap();
            //     $('#endModal').hide();

            // });



// Show Black Card Modal
$('#myBtn2').on('click', function() {
    $('.game-center').hide(); // TESTING
    $('#hideCards').show(); // TESTING
    $('.hide-waiting').show(); // TESTING
    $('#waiting').hide(); // TESTING

    // CODE NEED FOR PROJECT BELOW
    $('#myModal').show();
    $("#hideCards").wrap("<div class='blur'></div>");


});


// Quit Game
$('#nav-quit-game').on('click', function() {
    $('.cd-popup').addClass('is-visible')

})



//////////////////////// TESTING ABOVE //////////////////////////
