initializeCanvas();
var navigationMenu = document.getElementById("navigationMenu");
navigationMenu.innerHTML = `
<button id="single-server" class="navigation-button"> Single Server </button>
<button id="single-feedback" class="navigation-button"> Single Feedback </button>
<button id="two-servers" class="navigation-button"> Two Servers </button>
<button id="workstations" class="navigation-button"> Workstations </button>
<button id="central" class="navigation-button"> Central </button>`;

var single = document.getElementById("single-server");
var feedback = document.getElementById("single-feedback");
var two = document.getElementById("two-servers");
var workstations = document.getElementById("workstations");
var center = document.getElementById("central");


setPrintOutputLocation("titleTable","resultsTable");

single.onclick = function(){ 
    createSingleServer();
}

feedback.onclick = function() {
    createSingleFeedback();
}
two.onclick = function() {
    createTwoServers();
}
workstations.onclick = function() {
    createWorkstations(5,3);
}
center.onclick = function() {
    createCentralServer();
}