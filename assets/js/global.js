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
let currentChatRef = "";
let currentUid = "";
let currentGame = "";
let currentDisplayName = "";
let localWhiteOrder = "";
let newAvatar = avatarObj.genAvatarURL();
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

let globalChatCallback = function() {
    let message = $("#global-input").val().trim();
    $("#global-input").val("")
    if (message === "") {
        toastr.error('Your message was empty...maybe try typing something...', '', {
            closeButton: true,
            timeout: 10000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true,
        });
    } else {
        globalChat.push().set({
            message: message,
            displayName: currentDisplayName,
            timeStamp: firebase.database.ServerValue.TIMESTAMP
        })

    }
}

let chatCallback = function() {
    let message = $('#btn-input').val().trim();
    $('#btn-input').val('');
    if (message === '') {
        toastr.error('Your message was empty...maybe try typing something...', '', {
            closeButton: true,
            timeout: 10000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true,
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
}


toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "10000",
    "extendedTimeOut": "5000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
