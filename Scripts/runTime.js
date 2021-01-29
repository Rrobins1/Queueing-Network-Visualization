var navigationMenu = document.getElementById("navigationMenu");
console.log(document.cookie);
navigationMenu.innerHTML = `
<button id="modelSelectionButton" class="navigation-button"> Select Model </button>
<button id="modelDescriptionButton" class="navigation-button"> Model Description </button>
<button id="parameterButton" class="navigation-button"> Change Parameters </button>
<button id="resetButton" class="navigation-button"> Reset </button>
<button id="helpButton" class="navigation-button"> Help </button>`;

var modelSelectButton = document.getElementById("modelSelectionButton");
modelSelectButton.onclick = function(){
    window.location.href = "../Pages/modelSelection.html";
}

var helpButton = document.getElementById("helpButton");
helpButton.onclick = function(){
    window.location.href = "../Pages/help.html";
}

var helpButton = document.getElementById("parameterButton");
helpButton.onclick = function(){
    window.location.href = "../Pages/modelConfiguration.html";
}


