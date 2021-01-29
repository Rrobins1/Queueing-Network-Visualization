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

single.onclick = function(){ 
    drawCanvas();
    var singleServerModel = new SingleServerVisualModel();
    singleServerModel.draw();
    
    //singleServerModel.createEvent("Server", 20000, "advance", "task 1" );
    singleServerModel.createEvent("Arrivals",  0, "accept", "task 1");
    singleServerModel.createEvent("Arrivals", 2*1000, "accept", "task 2");
    singleServerModel.createEvent("Arrivals", 3*1000, "accept", "task 3");
    singleServerModel.createEvent("Server", 4*1000, "advance", "task 1");

    singleServerModel.createEvent("Arrivals", 4*1000, "accept", "task 4");
    singleServerModel.createEvent("Arrivals", 5*1000, "accept", "task 5");
    singleServerModel.createEvent("Arrivals", 6*1000, "accept", "task 6");
    
    runModel(updateRate);
}

feedback.onclick = function() {
    drawCanvas();
    var singleFeedbackModel = new SingleFeedbackVisualModel();
    singleFeedbackModel.draw();
}
two.onclick = function() {
    drawCanvas();
    var twoServersModel = new TwoServersVisualModel();
    twoServersModel.draw();
}
workstations.onclick = function() {
    drawCanvas();
    var workstationsModel = new InteractiveVisualModel(4,4);
    workstationsModel.draw();
}
center.onclick = function() {
    drawCanvas();
    var centralServerModel = new CentralServerVisualModel(3);
    centralServerModel.draw();
}