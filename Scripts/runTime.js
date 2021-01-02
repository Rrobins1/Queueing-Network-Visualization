var navigationMenu = document.getElementById("navigationMenu");
console.log(document.cookie);
navigationMenu.innerHTML = `
<button id="modelSelectionButton" class="navigation-button"> Select Model </button>
<button id="modelDescriptionButton" class="navigation-button"> Model Description </button>
<button id="turboButton" class="navigation-button"> Change Parameters </button>
<button id="resetButton" class="navigation-button"> Reset </button>
<button id="helpButton" class="navigation-button"> Help </button>`;
