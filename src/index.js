(function () {
    var MAIN_TEXT_AREA = document.getElementById('inputTextArea');
    var PARTS_QUANTITY_ELEMENT = document.getElementById('partsQuantity');
    var CHARACTERS_QUANTITY_ELEMENT = document.getElementById('charactersQuantity');
    var PARTS_CARDS_CONTAINER_ELEMENT = document.getElementById('partsCardsContainer');
    var MAX_CHARACTERS_QUANTITY = 500;
    addEventListeners();
    var textareaText = '';
    var partsArray = new Array();
    var sentencesArray = new Array;
    function addEventListeners() {
        'change keyup'.split(' ').forEach(function (event) {
            MAIN_TEXT_AREA.addEventListener(event, function () {
                if (!getDataFromTextArea()) {
                    setCharactersQuantity(0);
                    setPartsQuantity(0);
                    clearPartsCards();
                    return;
                }
                textareaText = getDataFromTextArea();
                partsArray = splitTextForParts(MAX_CHARACTERS_QUANTITY);
                setCharactersQuantity(textareaText.length);
                setPartsQuantity(partsArray.length);
                clearPartsCards();
                setPartsToCards(partsArray);
            });
        });
    }
    function getDataFromTextArea() {
        return MAIN_TEXT_AREA.value;
    }
    function splitTextForParts(maxCharactersQuantity) {
        if (maxCharactersQuantity === void 0) { maxCharactersQuantity = MAX_CHARACTERS_QUANTITY; }
        var partsArray = [];
        if (textareaText.length < maxCharactersQuantity) {
            partsArray.push(textareaText);
            return partsArray;
        }
        sentencesArray = splitForSentences(textareaText);
        for (var i = 0, charactersCounter = 0, neededLengthPart = ''; i < sentencesArray.length; i++) {
            charactersCounter += sentencesArray[i].length;
            if (charactersCounter >= maxCharactersQuantity) {
                partsArray.push(neededLengthPart);
                charactersCounter = 0;
                neededLengthPart = '';
            }
            else {
                neededLengthPart += sentencesArray[i];
            }
            if (i === sentencesArray.length - 1) { // for last iteration
                partsArray.push(neededLengthPart);
            }
        }
        return partsArray;
    }
    function splitForSentences(text) {
        var sentencesFinishSymbols = '? !'.split(' ');
        var textAsSentencesArray = text.trim().split('.').filter(Boolean).map(function (sentence) { return sentence + '.'; });
        sentencesFinishSymbols.forEach(function (symbol) {
            textAsSentencesArray = textAsSentencesArray.map(function (sentence) {
                var tempString = sentence.replace(symbol, "".concat(symbol, "_"));
                return tempString.split('_');
            }).flat(Infinity);
        });
        return textAsSentencesArray;
    }
    function setPartsQuantity(quantity) {
        PARTS_QUANTITY_ELEMENT.innerText = String(quantity);
    }
    function setCharactersQuantity(quantity) {
        CHARACTERS_QUANTITY_ELEMENT.innerText = quantity.toString();
    }
    function clearPartsCards() {
        PARTS_CARDS_CONTAINER_ELEMENT.innerHTML = '';
    }
    function setPartsToCards(partsArray) {
        partsArray.forEach(function (part, index) {
            var partCard = document.createElement('div');
            partCard.classList.add('part-card');
            partCard.id = 'partCard' + index;
            partCard.innerHTML = "\n          <div class=\"additional-inform-container\">\n             <div class=\"additional-inform\">\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432: ".concat(part.length, ";</div>\n            <div class=\"additional-inform\">\u0418\u043C\u044F \u043E\u0442\u0440\u044B\u0432\u043A\u0430: tts(").concat(index, ") </div>\n         </div>\n      <hr>\n      <div class=\"part-text\"> ").concat(part, "</div>\n      <div class=\"button-container\">\n        <div id=\"").concat('copiedMessage' + index, "\" class=\"copy-message\">\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!</div>\n        <button id=\"").concat('copyButton' + index, "\" class=\"copy-button\"><i class=\"icon copy-icon\"></i></button>\n        <button id=\"").concat('doneButton' + index, "\" class=\"done-button\"><i class=\"icon done-icon\"></i></button>\n      </div>\n      ");
            PARTS_CARDS_CONTAINER_ELEMENT.append(partCard);
            document.getElementById('copyButton' + index).onmousedown = function () {
                copyToClipboard(part).then(function () {
                    document.getElementById('partCard' + index).classList.add('copied');
                    document.getElementById('partCard' + index).classList.remove('done');
                    document.getElementById('copiedMessage' + index).classList.add('isVisible');
                });
            };
            document.getElementById('doneButton' + index).onmousedown = function () {
                document.getElementById('partCard' + index).classList.add('done');
                document.getElementById('partCard' + index).classList.remove('copied');
                document.getElementById('copiedMessage' + index).classList.remove('isVisible');
            };
        });
    }
    function copyToClipboard(textToCopy) {
        return navigator.clipboard.writeText(textToCopy);
    }
}());
