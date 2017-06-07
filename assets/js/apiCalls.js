let api = {
    callDictApi: function(word) {
        let baseURL = "https://api.pearson.com/v2/dictionaries/laad3/entries?headword="
        let apiKey = "&apikey=AJUxPAxRPBKVXZ8t2z79XYG2X1JnsEOW"
        let result = ""
        $.ajax({
            url: baseURL + word + apiKey,
        }).done(function(data) {
            if (data.results[0].senses[0].subsenses !== undefined) {
                result = data.results[0].senses[0].subsenses[0].definition;
                api.displayDef(result, word, 'Pearson')
            } else {
                result = data.results[0].senses[0].definition;
                api.displayDef(result, word, 'Pearson')
            }

        });
    },
    callUrbanApi: function(word) {
        let baseURL = "https://api.urbandictionary.com/v0/define?term="
        let result = '';
        $.ajax({
            url: baseURL + word,
        }).done(function(data) {
            result = data.list[0].definition;
            api.displayDef(result, word, 'Urban')
        });
    },
    checkCall: function(message) {
        let firstIndex = message.indexOf('"');
        let secondIndex = message.indexOf('"', firstIndex + 1);
        let word = message.slice(firstIndex + 1, secondIndex);
        let hasWord = (firstIndex !== -1 && secondIndex !== -1);
        console.log()

        if (message.startsWith("/Dict") && hasWord) {
            this.callDictApi(word);

        } else if (message.startsWith("/Urban") && hasWord) {
            this.callUrbanApi(word);
        } else {
            //display error
            toastr.error('Error: try (/Dict "word") or(/Urban "word")', '', {
                closeButton: true,
                timeout: 10000,
                positionClass: 'toast-bottom-right'
            });
            console.log('Error: try (/Dict "word") or(/Urban "word")')
        }
    },
    displayDef: function(def, word, dict) {
        // console.log(word + " : " + def)
        let newDiv = $("<div>");
        let newDef = $("<p>").text(def);
        let newWord = $("<strong>").text('(' + dict + ' Dict) - ' + word + ": ");
        newDef.prepend(newWord);
        newDiv.append(newDef);
        $('#chat').append(newDiv);
    }
}

// currentChatRef.on('child_added', function(snap) {
//     console.log(snap.val());
//     let newDiv = $("<div>");
//     let message = $("<p>").text(snap.val().message);
//     let name = $("<strong>").text(snap.val().displayName + ":");
//     message.prepend(name);
//     newDiv.append(message);
//     $("#chat").append(newDiv)
// });


////////////TESTING//////////
// api.checkCall('/Dict "cat"');
// api.checkCall('/Dict "dog"');
// api.checkCall('/Dict "asdafas')
// api.checkCall('/Dict asdafas"')

// api.checkCall('/Urban "cat"');
// api.checkCall('/Urban "dog"');
// api.checkCall('/Urban "asdafas')
// api.checkCall('/Urban asdafas"')
