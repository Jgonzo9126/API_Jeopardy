const API_URL = "https://rithm-jeopardy.herokuapp.com/api/";
const NUMBER_OF_CATEGORIES = 6;
const NUMBER_OF_CLUES_PER_CATEGORY = 5;
let categories = [];
let activeClue = null;
let activeClueMode = 0;
let isPlayButtonClickable = true;

$("#play").on("click", handleClickOfPlay);

function handleClickOfPlay() {
  if (isPlayButtonClickable) {
    isPlayButtonClickable = false;
    setupTheGame();
  } else {
    resetGame();
  }
}

async function setupTheGame() {
  $("#spinner").show();
  $("#categories").empty();
  $("#clues").empty();
  $("#active-clue").html("");
  $("#play").text("Loading...");
  
  $("#active-clue").off("click");
  $("#active-clue").on("click", handleClickOfActiveClue);

  
  categories = await getCategoryIds();
  console.log("Available categories:", categories);

  const categoryData = [];
  for (const id of categories) {
    const data = await getCategoryData(id);
    categoryData.push(data);
  }

  categories = categoryData;
  fillTable(categories);
  $("#spinner").hide();
  $("#play").text("Reset Game");
}

function resetGame() {
  categories = [];
  activeClue = null;
  activeClueMode = 0;
  isPlayButtonClickable = true;

  $("#active-clue").html("");
  $("#play").text("Start Game");
  $("#categories").empty();
  $("#clues").empty();
  $("#spinner").hide();
}

async function getCategoryIds() {
  const ids = [];
  const response = await axios.get(`${API_URL}categories?count=100`);
  const filteredCategories = response.data.filter(category => category.clues_count >= NUMBER_OF_CLUES_PER_CATEGORY);
  
  for (let i = 0; i < NUMBER_OF_CATEGORIES; i++) {
    const randomIndex = Math.floor(Math.random() * filteredCategories.length);
    ids.push(filteredCategories[randomIndex].id);
    filteredCategories.splice(randomIndex, 1);
  }
  return ids;
}

async function getCategoryData(categoryId) {
  const response = await axios.get(`${API_URL}category?id=${categoryId}`);
  return {
    id: response.data.id,
    title: response.data.title,
    clues: response.data.clues.slice(0, NUMBER_OF_CLUES_PER_CATEGORY).map(clue => ({
      id: clue.id,
      value: clue.value || 500,
      question: clue.question,
      answer: clue.answer,
    })).sort((a, b) => a.value - b.value)
  };
}

function fillTable(categories) {
  const $categoriesRow = $("#categories");
  const $cluesRow = $("#clues");

  $categoriesRow.empty();
  $cluesRow.empty();

  categories.forEach(category => {
    const $categoryCell = $(`<th>${category.title}</th>`);
    $categoriesRow.append($categoryCell);

    const $cluesCell = $(`<td></td>`);
    $cluesRow.append($cluesCell);

    category.clues.forEach(clue => {
      const $newRow = $(`<tr class="clue"></tr>`);
      $cluesCell.append($newRow);

      const $clueCell = $(`<td id="clue-${clue.id}-${category.id}">${clue.value}</td>`);
      $clueCell.on("click", (event) => handleClickOfClue(event, clue));
      $newRow.append($clueCell);
    });
  });
}

function handleClickOfClue(event, selectedClue) {
  const clickedId = event.target.id;
  const clueId = parseInt(clickedId.split("-")[1]);
  const categoryId = parseInt(clickedId.split("-")[2]);

  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return;

  activeClue = selectedClue;
  activeClueMode = 1;

  $("#active-clue").text(selectedClue.question);

  $(event.target).addClass("viewed");
  category.clues = category.clues.filter(cl => cl.id !== clueId);

  if (category.clues.length === 0) {
    categories = categories.filter(cat => cat.id !== categoryId);
  }
}

function handleClickOfActiveClue(event) {
  if (activeClueMode === 1) {
    activeClueMode = 2;
    $("#active-clue").text(activeClue.answer);
  } else if (activeClueMode === 2) {
    activeClueMode = 0;
    $("#active-clue").html(null);

    if (categories.length === 0) {
      isPlayButtonClickable = true;
      $("#play").text("Restart the Game!");
      $("#active-clue").html("The End!");
    }
  }
}
