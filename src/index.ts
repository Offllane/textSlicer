(function () {
  const MAIN_TEXT_AREA: HTMLTextAreaElement = document.getElementById('inputTextArea') as HTMLTextAreaElement;
  const PARTS_QUANTITY_ELEMENT: HTMLElement = document.getElementById('partsQuantity');
  const CHARACTERS_QUANTITY_ELEMENT: HTMLElement = document.getElementById('charactersQuantity');
  const PARTS_CARDS_CONTAINER_ELEMENT: HTMLElement = document.getElementById('partsCardsContainer');
  const MAX_CHARACTERS_QUANTITY = 500;
  addEventListeners();

  let textareaText = '';
  let partsArray: Array<string> = new Array<string>();

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
        partsArray = splitTextForParts(textareaText, MAX_CHARACTERS_QUANTITY);
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

  function splitTextForParts(text = textareaText, maxCharactersQuantity: number = MAX_CHARACTERS_QUANTITY) {
    const partsArray = [];

    if (text.length < maxCharactersQuantity) { //if text has only one part
      partsArray.push(text);
      return partsArray;
    }

    const sentencesArray = splitForSentences(text);

    for (let i = 0, charactersCounter = 0, completedPart = ''; i < sentencesArray.length; i++) {
      if (isPartLengthMoreThanValue(charactersCounter, sentencesArray[i], MAX_CHARACTERS_QUANTITY)) {
        partsArray.push(completedPart);
        charactersCounter = 0;
        completedPart = '';
      }

      completedPart += sentencesArray[i];
      charactersCounter += sentencesArray[i]?.length

      if (i === sentencesArray.length - 1) { // for last iteration
        partsArray.push(completedPart);
      }
    }

    return partsArray;
  }

  function isPartLengthMoreThanValue(charactersCounter: number, currentSentence: string, maxCharactersQuantity:number = MAX_CHARACTERS_QUANTITY) {
    return charactersCounter + currentSentence.length >= maxCharactersQuantity;
  }

  function splitForSentences(text: string): Array<string> {
    const sentencesFinishSymbols: Array<string> = '. ? !'.split(' ');

    for (let sentenceFinishSymbol of sentencesFinishSymbols) {
      text = text.replaceAll(sentenceFinishSymbol, `${sentenceFinishSymbol}__`);
    }
    return text.split('__');
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



