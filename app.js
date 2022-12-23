//Get all the necessary dom element
const textBox = document.querySelector(".textbox"); //textarea
const wordCounter = document.querySelector("#wordCounterContainer");
const uniqueWordCounter = document.querySelector("#uniqeWordCounterContainer");
const charCounter = document.querySelector("#charCounterContainer");
const extractBtn = document.querySelector(".mainBtn");
const resultContainer = document.querySelector("#resultContainer");

//Text box function
textBox.addEventListener("input", countTextBoxWords);

function countTextBoxWords(e) {
  const paragraph = e.target.value;
  const charLength = paragraph.split("");
  charCounter.textContent = charLength.length;
  let wordLength = paragraph
    .split(" ") //creating array by whitespace
    .filter((entry) => entry.trim() != "") // removing whitespace from array
    .map((i) => i.toLowerCase()) // array is case sensitives so
    .filter((i) => !/[0-9]/.test(i)); //checking if there is any number

  const uniqueWords = [...new Set(wordLength)]; // creating a unique set from exiting array

  wordCounter.textContent = wordLength.length;
  uniqueWordCounter.textContent = uniqueWords.length;
}

// Extract Word function
extractBtn.addEventListener("click", extractWords);

function extractWords() {
  resultContainer.innerHTML = ""; // This one necessary cause user might click btn twice or more
  const paragraph = textBox.value;
  if (paragraph.length === 0) {
    alert("Add Some words first!");
    return;
  }
  let wordLength = paragraph
    .split(" ")
    .filter((entry) => entry.trim() != "")
    .map((i) => i.toLowerCase())
    .filter((i) => !/[0-9]/.test(i))
    .map((i) => {
      //Checking if there is any special character in the last of word
      let lastWord = i.slice(-1);
      let arr = [".", ",", "?", "!", ":", ";", "'", '"'];
      let bol = arr.find((i) => i == lastWord);
      if (bol) {
        return i.slice(0, -1);
      } else {
        return i;
      }
    });

  const uniqueWords = [...new Set(wordLength)];

  uniqueWords.forEach((value) => {
    createWordCardDiv(value);
  });
}

function createWordCardDiv(word) {
  //Creating wordCard div
  const wordCard = document.createElement("div");
  wordCard.classList.add("wordCard");
  //Creating Word div
  const wordDiv = document.createElement("div");
  wordDiv.classList.add("word");
  wordCard.appendChild(wordDiv);
  //Word contains paragraph
  const para = document.createElement("p");
  para.textContent = word;
  wordDiv.appendChild(para);
  // Creating 3 dot btn
  const moreBtn = document.createElement("span");
  moreBtn.classList.add("more");
  //event that wil call after 3 dot click
  moreBtn.addEventListener("click", moreDetails);
  const dot1 = document.createElement("span");
  const dot2 = document.createElement("span");
  const dot3 = document.createElement("span");
  moreBtn.appendChild(dot1);
  moreBtn.appendChild(dot2);
  moreBtn.appendChild(dot3);
  wordDiv.appendChild(moreBtn);
  // everything done now adding this card to ui
  resultContainer.appendChild(wordCard);
}

// it is async cause it will fetch data from api
async function moreDetails(e) {
  //Checking if hiddenDetails already available or not.if available that means 3 dot btn clicked.
  let dDtl =
    e.target.parentElement.parentElement.querySelector(".hiddenDetails");
  if (dDtl) {
    let st = dDtl.style.display;
    if (st === "block") {
      dDtl.style.display = "none";
    } else {
      dDtl.style.display = "block";
      dDtl.style.animation = "wordCardOpening 0.3s ease-in-out";
    }
    return;
  }
  // hiddendetails is not available so let's create
  const hiddenDetails = document.createElement("div");
  hiddenDetails.classList.add("hiddenDetails");
  hiddenDetails.style.display = "block";
  //Fetching data from api will take some time that why this paragraph.
  const loading = document.createElement("p");
  loading.textContent = "Loading...";
  hiddenDetails.appendChild(loading);
  //this is the wordCard element we are selecting
  let el = e.target.parentElement.parentElement;
  el.appendChild(hiddenDetails);
  //Getting Word name
  const wordName = e.target.parentElement.children[0].textContent;
  //Fetching data about word
  let data = await getWordDetails(wordName);
  // handling error
  if (data === "error") {
    alert("Please try again or Check the word is it a valid word or not!");
    el.removeChild(hiddenDetails);
    return;
  }
  //Fetched data available so removing loading.
  hiddenDetails.removeChild(loading);
  //Checking how many audio available
  const audioList = data.phonetics.filter((i) => i.audio !== "");
  const audioTitle = document.createElement("h4");
  audioTitle.textContent = "Audio";
  hiddenDetails.appendChild(audioTitle);
  el.appendChild(hiddenDetails);
  //For each Available audio I wanna create a btn;
  audioList.map((i) => {
    //Finding audio btn text content
    const str = i.audio.slice(-6, -4);
    const music = new Audio(i.audio);
    const btn = document.createElement("button");

    btn.addEventListener("click", () => {
      music.play();
    });
    btn.textContent = str;
    hiddenDetails.appendChild(btn);
  });
  //creating div for meaning and definition
  const meaningTitle = document.createElement("h4");
  meaningTitle.textContent = "Meaning";
  hiddenDetails.appendChild(meaningTitle);
  el.appendChild(hiddenDetails);
  const meaningsDiv = document.createElement("div");
  meaningsDiv.classList.add("meannings");
  //Creating definition for each part of speech.
  data.meanings.map((i) => {
    const minDev = document.createElement("div");
    minDev.classList.add("meaning");
    const meanP = document.createElement("p");
    meanP.textContent = i.partOfSpeech;
    meanP.classList.add("meaning-title");
    minDev.appendChild(meanP);
    const item = i.definitions[0];
    const defP = document.createElement("p");
    defP.textContent = item.definition;
    defP.classList.add("def");
    minDev.appendChild(defP);
    meaningsDiv.appendChild(minDev);
  });
  hiddenDetails.appendChild(meaningsDiv);
}

async function getWordDetails(word) {
  try {
    return (data = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    )
      .then((res) => res.json())
      .then((data) => data[0]));
  } catch (error) {
    console.log(error);
    return "error";
  }
}
