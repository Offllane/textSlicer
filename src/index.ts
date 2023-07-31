(function () {
  const IAM_TOKEN_INPUT_ELEMENT: HTMLInputElement = <HTMLInputElement>document.getElementById('iamTokenInput');
  const FOLDER_ID_INPUT_ELEMENT: HTMLInputElement = <HTMLInputElement>document.getElementById('folderIdInput');
  const MAIN_TEXT_AREA: HTMLTextAreaElement = document.getElementById('inputTextArea') as HTMLTextAreaElement;
  const PARTS_QUANTITY_ELEMENT: HTMLElement = document.getElementById('partsQuantity');
  const CHARACTERS_QUANTITY_ELEMENT: HTMLElement = document.getElementById('charactersQuantity');
  const PARTS_CARDS_CONTAINER_ELEMENT: HTMLElement = document.getElementById('partsCardsContainer');
  const MAX_CHARACTERS_QUANTITY = 5000;
  const YANDEX_SPEECH_KIT_URL = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize';

  let iAmToken = '';
  let folderId = '';
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
        textareaText = removeUnwantedSymbols(textareaText, new Array<string>(`"`, `'`, `«`, `»`));
        partsArray = splitTextForParts(textareaText, MAX_CHARACTERS_QUANTITY);
        setCharactersQuantity(textareaText.length);
        setPartsQuantity(partsArray.length);
        clearPartsCards();
        setPartsToCards(partsArray);
      });
      IAM_TOKEN_INPUT_ELEMENT.addEventListener(event, () => {
        iAmToken = IAM_TOKEN_INPUT_ELEMENT.value;
      });
      FOLDER_ID_INPUT_ELEMENT.addEventListener(event, () => {
        folderId = FOLDER_ID_INPUT_ELEMENT.value;
      });
    });
  }

  function getDataFromTextArea(): string {
    return MAIN_TEXT_AREA.value;
  }

  function removeUnwantedSymbols(text: string, unwantedSymbols: Array<string>): string {
    for (let symbol of unwantedSymbols) {
      text = text.replaceAll(symbol, '');
    }
    return text;
  }

  function splitTextForParts(text: string = textareaText, maxCharactersQuantity: number = MAX_CHARACTERS_QUANTITY) {
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
      const partCard = createCardLayout(part, index);
      PARTS_CARDS_CONTAINER_ELEMENT.append(partCard);

      addMouseEventForDownloadButtonByIndex(part, index);
      addMouseDownEventToCopyButtonByIndex(part, index);
      addMouseDownEventForDoneButtonByIndex(index);
    })
  }

  function createCardLayout(part: string, index: number): HTMLElement {
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
        <div class="button-container">
          <button id="${'downloadButton' + index}" class="play-button"><i class="icon download-icon"></i></button>
          <button id="${'copyButton' + index}" class="copy-button"><i class="icon copy-icon"></i></button>
          <button id="${'doneButton' + index}" class="done-button"><i class="icon done-icon"></i></button>
        </div>
      </div>
      `;

    return partCard;
  }

  function addMouseDownEventToCopyButtonByIndex(part: string, index: number): void {
    document.getElementById('copyButton' + index).onmousedown = () => handleCopyButtonClick(part, index);
  }

  function addMouseDownEventForDoneButtonByIndex(index: number): void {
    document.getElementById('doneButton' + index).onmousedown = () => handleDoneButtonClick(index);
  }

  function addMouseEventForDownloadButtonByIndex(part: string, index: number): void {
    document.getElementById('downloadButton' + index).onmousedown = () => handleDownloadButtonClick(part, index);
  }

  async function handleDownloadButtonClick(part: string, index: number): Promise<any> {
    const bodyConfig = {
      text: part,
      voice: 'filipp',
      folderId: folderId,
      format: 'mp3'
    }
    const requestParams: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${iAmToken}`
      },
      body: new URLSearchParams(bodyConfig) // urlencoded format
    }

    try {
      const response = await fetch(YANDEX_SPEECH_KIT_URL, requestParams);
      if(response.ok) {
        console.log(response);
        const blob = await response.blob();
        downloadFile(blob, index);
      }
    } catch (error) {
      console.error('Произошла ошибка при запросе');
    }
  }

  function handleCopyButtonClick(part, index): void {
    copyToClipboard(part).then(() => {
      document.getElementById('partCard' + index).classList.add('copied');
      document.getElementById('partCard' + index).classList.remove('done');
      document.getElementById('copiedMessage' + index).classList.add('isVisible')
    });
  }

  function handleDoneButtonClick(index): void {
    document.getElementById('partCard' + index).classList.add('done');
    document.getElementById('partCard' + index).classList.remove('copied');
    document.getElementById('copiedMessage' + index).classList.remove('isVisible')
  }

  function copyToClipboard(textToCopy: string) {
    const introduction = 'Выпиши 5 основных мыслей по одному предложению из текста из следующего отрывка:\n ';
    return  navigator.clipboard.writeText(introduction + textToCopy);
  }

  function downloadFile(blob: Blob, index: number): void {
    console.log(blob);
    const extension = 'mp3'; //TODO (temporary) add new extensions
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `part${index + 1}.${extension}`);
    document.body.appendChild(link);
    link.click();
    // clean
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }
}());



