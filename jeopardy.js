// You only need to touch comments with the todo of this file to complete the assignment!

/*
=== How to build on top of the starter code? ===

Problems have multiple solutions.
We have created a structure to help you on solving this problem.
On top of the structure, we created a flow shaped via the below functions.
We left descriptions, hints, and to-do sections in between.
If you want to use this code, fill in the to-do sections.
However, if you're going to solve this problem yourself in different ways, you can ignore this starter code.
 */

/*
=== Terminology for the API ===

Clue: The name given to the structure that contains the question and the answer together.
Category: The name given to the structure containing clues on the same topic.
 */

/*
=== Data Structure of Request the API Endpoints ===*/
// let categories =
// [
//  {
//     "id": 13,
//     "title": "inventions",
//     "clues_count": 5
//   },
//   {
//     "id": 14,
//     "title": "ancient worlds",
//     "clues_count": 5
//   },
//   {
//     "id": 15,
//     "title": "hollywood legends",
//     "clues_count": 5
//   },
//   {
//     "id": 17,
//     "title": "u.s. states",
//     "clues_count": 5
//   },
//   {
//     "id": 18,
//     "title": "\"hard\"",
//     "clues_count": 5
//   }
// ]

// let category =
// {
//   "id": 13,
//   "title": "inventions",
//   "clues_count": 5,
//   "clues": [
//     {
//       "id": 13.1,
//       "answer": "Albert Einstein",
//       "question":"Who was the greatest mathmatician",
//       "value": 100,
//     },

//   ]
// }

const API_URL = "https://rithm-jeopardy.herokuapp.com/api/"; // The URL of the API.
const NUMBER_OF_CATEGORIES = 6; // The number of categories you will be fetching. You can change this number.
const NUMBER_OF_CLUES_PER_CATEGORY = 5; // The number of clues you will be displaying per category. You can change this number.
let categories = []; // The categories with clues fetched from the API.
/*
[
  {
    "id": 1,
    "title": sports,
    "clues": 5
      {
        "id": 1.1,
        "value": $200,
        "question": "what is the first team in the NFL",
        "answer": 49ers,
      },
      
    ]
  }
  
];
 */

let activeClue = null; // Currently selected clue data.
let activeClueMode = 0; // Controls the flow of #active-clue element while selecting a clue, displaying the question of selected clue, and displaying the answer to the question.
/*
0: Empty. Waiting to be filled. If a clue is clicked, it shows the question (transits to 1).
1: Showing a question. If the question is clicked, it shows the answer (transits to 2).
2: Showing an answer. If the answer is clicked, it empties (transits back to 0).
 */

let isPlayButtonClickable = true; // Only clickable when the game haven't started yet or ended. Prevents the button to be clicked during the game.

$("#play").on("click", handleClickOfPlay);

/**
 * Manages the behavior of the play button (start or restart) when clicked.
 * Sets up the game.
 *
 * Hints:
 * - Sets up the game when the play button is clickable.
 */
function handleClickOfPlay() {
  if (isPlayButtonClickable) {
    isPlayButtonClickable = false;
    setupTheGame();
  } else {
    resetGame();
  }
  // todo set the game up if the play button is clickable
}

/**
 * Sets up the game.
 *
 * 1. Cleans the game since the user can be restarting the game.
 * 2. Get category IDs
 * 3. For each category ID, get the category with clues.
 * 4. Fill the HTML table with the game data.
 *
 * Hints:
 * - The game play is managed via events.
 */
async function setupTheGame() {
  $("#spinner").show(); // todo show the spinner while setting up the game
  // todo reset the DOM (table, button text, the end text)
  $("#categories").empty();
  $("clues").empty();
  $("active-clue").html("");
  $("#play").text("Loading...");

  $("#active-clue").off("click");
  $("#active-clue").on("click", handleClickOfActiveClue);
  // todo fetch the game data (categories with clues)
  // todo fill the table
  // todo hide the spinner after setting up the game

  categories = await getCategoryIds();
  console.log("Available categories:", categories);

  const categoryData = [];
  for (const id of categories) {
    const data = await getCategoryData(id);
    categoryData.push(data);
  }

  categories = categoryData;
  console.log("categoryData , ", categories);

  fillTable(categories);
  $("#spinner").hide();
  $("#play").text("Reset Game");
  //console.log("categoryData , ", categoryData);
}

function resetGame() {
  // Clear current state
  categories = [];
  activeClue = null;
  activeClueMode = 0;
  isPlayButtonClickable = true;

  // Reset UI elements
  $("#active-clue").html("");
  $("#play").text("Start Game");
  $("#categories").empty();
  $("#clues").empty();
  $("#spinner").hide(); // Hide spinner if it was showing
}

/**
 * Gets as many category IDs as in the `NUMBER_OF_CATEGORIES` constant.
 * Returns an array of numbers where each number is a category ID.
 *
 * Hints:
 * - Use /categories endpoint of the API.
 * - Request as many categories as possible, such as 100. Randomly pick as many categories as given in the `NUMBER_OF_CATEGORIES` constant, if the number of clues in the category is enough (<= `NUMBER_OF_CLUES` constant).
 */
async function getCategoryIds() {
  const ids = []; //todo set after fetching
  const response = await axios.get(
    `${API_URL}categories?count=${NUMBER_OF_CATEGORIES}`
  );
  console.log("API Response:", response.data);

  response.data.forEach((element) => {
    ids.push(element.id);
  });
  //console.log("categoryData , ", ids);
  // todo fetch NUMBER_OF_CATEGORIES amount of categories
  return ids;
}

/**
 * Gets category with as many clues as given in the `NUMBER_OF_CLUES` constant.
 * Returns the below data structure:
 *  {
 *    "id": <category ID>
 *    "title": <category name>
 *    "clues": [
 *      {
 *        "id": <clue ID>,
 *        "value": <value of the question>,
 *        "question": <question>,
 *        "answer": <answer to the question>
 *      },
 *      ... more clues
 *    ]
 *  }
 *
 * Hints:
 * - You need to call this function for each category ID returned from the `getCategoryIds` function.
 * - Use /category endpoint of the API.
 * - In the API, not all clues have a value. You can assign your own value or skip that clue.
 */

async function getCategoryData(categoryId) {
  const categoryWithClues = {
    id: categoryId,
    title: undefined, // todo set ater fetching
    clues: [], // todo set after fetching
  };
  const response = await axios.get(`${API_URL}category?id=${categoryId}`);
  //console.log("Fetched category data:", response.data);
  // todo fetch the category with NUMBER_OF_CLUES_PER_CATEGORY amount of clues

  categoryWithClues.id = response.data.id;
  categoryWithClues.title = response.data.title;
  categoryWithClues.clues = response.data.clues
    .slice(0, NUMBER_OF_CLUES_PER_CATEGORY)
    .map((clue) => {
      return {
        id: clue.id,
        value: clue.value || 500,
        question: clue.question,
        answer: clue.answer,
      };
    })
    .sort((a, b) => {
      return a.value - b.value;
    });

  return categoryWithClues;
}

/**
 * Fills the HTML table using category data.
 *
 * Hints:
 * - You need to call this function using an array of categories where each element comes from the `getCategoryData` function.
 * - Table head (thead) has a row (#categories).
 *   For each category, you should create a cell element (th) and append that to it.
 * - Table body (tbody) has a row (#clues).
 *   For each category, you should create a cell element (td) and append that to it.
 *   Besides, for each clue in a category, you should create a row element (tr) and append it to the corresponding previously created and appended cell element (td).
 * - To this row elements (tr) should add an event listener (handled by the `handleClickOfClue` function) and set their IDs with category and clue IDs. This will enable you to detect which clue is clicked.
 */

function fillTable(categories) {
  const $categoriesRow = $("#categories");
  const $cluesRow = $("#clues");

  $categoriesRow.empty(); // Clear previous game data
  $cluesRow.empty();

  categories.forEach((category) => {
    const $categoryCell = $(`<th>${category.title}</th>`);
    $categoriesRow.append($categoryCell);

    const $cluesCell = $(`<td></td>`);
    $cluesRow.append($cluesCell);

    category.clues.forEach((clue) => {
      const $newRow = $(`<tr class="clue"></tr>`);
      $cluesCell.append($newRow);

      const $clueCell = $(
        `<td  id="clue-${clue.id}-${category.id}">$${clue.value}</td>`
      );
      $clueCell.on("click", (event) => handleClickOfClue(event, clue));
      $newRow.append($clueCell);
    });
  });

  // todo
}
//console.log("categoryId:", categoryId);
console.log("Available categories:", categories);

/**
 * Manages the behavior when a clue is clicked.
 * Displays the question if there is no active question.
 *
 * Hints:
 * - Control the behavior using the `activeClueMode` variable.
 * - Identify the category and clue IDs using the clicked element's ID.
 * - Remove the clicked clue from categories since each clue should be clickable only once. Don't forget to remove the category if all the clues are removed.
 * - Don't forget to update the `activeClueMode` variable.
 *
 */
function handleClickOfClue(event, selectedClue) {
  const clickedId = event.target.id;
  console.log("Clicked Element ID:", clickedId);

  const clueId = parseInt(event.target.id.split("-")[1]); // Extract clue ID from the clicked element
  const categoryId = parseInt(event.target.id.split("-")[2]); // Extract category ID

  // console.log("Clicked ID: ", selectedClue);

  // Find the clicked clue in the categories
  console.log(categories);
  const category = categories.find((cat) => cat.id === categoryId);
  if (!category) {
    console.log("No category found with id ", categoryId);
    return;
  }

  // const clue = category.clues.find((cl) => cl.id === clueId);
  // if (!clue) {
  //   console.log("No clue found with id ", clueId);
  //   return;
  // }

  // Mark the clue as active and remove it from the category
  activeClue = selectedClue;
  activeClueMode = 1;

  // Display the question2
  $("#active-clue").text(selectedClue.question);

  // Mark clue as viewed and remove it from the list
  $(event.target).addClass("viewed");
  category.clues = category.clues.filter((cl) => cl.id !== clueId);

  // Remove the category if all clues are used
  if (category.clues.length === 0) {
    categories = categories.filter((cat) => cat.id !== categoryId);
  }
  // todo find and remove the clue from the categories
  // todo mark clue as viewed (you can use the class in style.css), display the question at #active-clue
}

/**
 * Manages the behavior when a displayed question or answer is clicked.
 * Displays the answer if currently displaying a question.
 * Clears if currently displaying an answer.
 *
 * Hints:
 * - Control the behavior using the `activeClueMode` variable.
 * - After clearing, check the categories array to see if it is empty to decide to end the game.
 * - Don't forget to update the `activeClueMode` variable.
 */
function handleClickOfActiveClue(event) {
  // todo display answer if displaying a question

  // todo clear if displaying an answer
  // todo after clear end the game when no clues are left

  if (activeClueMode === 1) {
    activeClueMode = 2;
    $("#active-clue").html(activeClue.answer);
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
