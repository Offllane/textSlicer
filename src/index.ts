(function () {
  const MAIN_TEXT_AREA: HTMLTextAreaElement = document.getElementById('inputTextArea') as HTMLTextAreaElement;
  const PARTS_QUANTITY_ELEMENT: HTMLElement = document.getElementById('partsQuantity');
  const CHARACTERS_QUANTITY_ELEMENT: HTMLElement = document.getElementById('charactersQuantity');
  const PARTS_CARDS_CONTAINER_ELEMENT: HTMLElement = document.getElementById('partsCardsContainer');
  const MAX_CHARACTERS_QUANTITY = 500;
  addEventListeners();

  let textareaText = '';
  let partsArray: Array<string> = new Array<string>();
  let sentencesArray: Array<string> = new Array<string>;

  function addEventListeners() {
    'change keyup'.split(' ').forEach(event => {
      MAIN_TEXT_AREA.addEventListener(event, () => {
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

  function getDataFromTextArea(): string {
    return MAIN_TEXT_AREA.value;
  }

  function splitTextForParts(maxCharactersQuantity: number = MAX_CHARACTERS_QUANTITY) {
    const partsArray = [];
    if (textareaText.length < maxCharactersQuantity) {
      partsArray.push(textareaText);
      return partsArray
    }

    sentencesArray = splitForSentences(textareaText);


    for (let i = 0, charactersCounter = 0, neededLengthPart = ''; i < sentencesArray.length; i++) {
      charactersCounter += sentencesArray[i].length;
      if (charactersCounter >= maxCharactersQuantity) {
        partsArray.push(neededLengthPart);
        charactersCounter = 0;
        neededLengthPart = '';
      } else {
        neededLengthPart += sentencesArray[i];
      }
      if (i === sentencesArray.length - 1) { // for last iteration
        partsArray.push(neededLengthPart);
      }
    }

    return partsArray;
  }

  function splitForSentences(text: string): Array<string> {
    const sentencesFinishSymbols: Array<string> = '? !'.split(' ');
    let textAsSentencesArray: any = text.trim().split('.').filter(Boolean).map(sentence => sentence + '.');

    sentencesFinishSymbols.forEach(symbol => {
      textAsSentencesArray = textAsSentencesArray.map(sentence => {
        const tempString = sentence.replace(symbol, `${symbol}_`);
        return tempString.split('_');
      }).flat(Infinity);
    });

    return textAsSentencesArray;
  }

  function setPartsQuantity(quantity: number): void {
    PARTS_QUANTITY_ELEMENT.innerText = String(quantity);
  }

  function setCharactersQuantity(quantity: number) {
    CHARACTERS_QUANTITY_ELEMENT.innerText = quantity.toString();
  }

  function clearPartsCards(): void {
    PARTS_CARDS_CONTAINER_ELEMENT.innerHTML = '';
  }

  function setPartsToCards(partsArray: Array<string>): void {
    partsArray.forEach((part, index) => {
      const partCard = document.createElement('div');
      partCard.classList.add('part-card');
      partCard.id = 'partCard' + index;
      partCard.innerHTML = `
          <div class="additional-inform-container">
             <div class="additional-inform">Количество символов: ${part.length};</div>
            <div class="additional-inform">Имя отрывка: tts(${index}) </div>
         </div>
      <hr>
      <div class="part-text"> ${part}</div>
      <div class="button-container">
        <div id="${'copiedMessage' + index}" class="copy-message">Скопировано!</div>
        <button id="${'copyButton' + index}" class="copy-button"><i class="icon copy-icon"></i></button>
        <button id="${'doneButton' + index}" class="done-button"><i class="icon done-icon"></i></button>
      </div>
      `;
      PARTS_CARDS_CONTAINER_ELEMENT.append(partCard);

      document.getElementById('copyButton' + index).onmousedown = () => {
        copyToClipboard(part).then(() => {
          document.getElementById('partCard' + index).classList.add('copied');
          document.getElementById('partCard' + index).classList.remove('done');
          document.getElementById('copiedMessage' + index).classList.add('isVisible')
        });
      }
      document.getElementById('doneButton' + index).onmousedown = () => {
        document.getElementById('partCard' + index).classList.add('done');
        document.getElementById('partCard' + index).classList.remove('copied');
        document.getElementById('copiedMessage' + index).classList.remove('isVisible')
      }
    })
  }

  function copyToClipboard(textToCopy: string) {
    return  navigator.clipboard.writeText(textToCopy)
  }
}());



