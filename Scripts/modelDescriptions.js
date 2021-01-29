function createDescriptionBlock(location){
    var destination = document.getElementById(location);
    destination.innerHTML += `<div id="description-block" class="description-block"></div>`;
    return document.getElementById("description-block");
}
function addDescriptionTitle(content){
    document.getElementById("description-block").innerHTML += `<br></br><b>${content}</b>`;
}
function addDescriptionBlock(content){
    document.getElementById("description-block").innerHTML += content;
}
var singleTitle = "Single Server Model";
var singleDescription = "The single server model is the simplest of models. It consists of a single queue and a single processor.  Jobs arrive, are enqueued, processed at the server then exit the system. Adjustable parameters for this model are interarrival rate and distribution as well as server processing rate and distribution. This model could be representative of a drive through at a fast food restaurant: people arrive, enqueue, are serviced, and leave.";

var twoTitle = "Two Servers Model";
var twoDescription = "The two servers model expands upon the single server model by adding an additional server in parallel. This model consists of a single queue with two servers. Tasks from the queue are placed into the next available server for processing. Adjustable parameters for this model are interarrival rate and distribution as well as server processing rate and distribution for each of the two servers. This type of model could be experienced at barbershops, a customer checks in (is enqueued) then gets service from one of many potential barbers.";

var feedbackTitle = "Single Server with Feedback Model";
var feedbackDescription = "FEEDBACK DESCRIPTION GOES HERE";

var workstationTitle = "Interactive Workstations Model";
var workstationDescription = "WORKSTATION DESCRIPTION GOES HERE";

var centralTitle = "Central Server with Disk Access Model";
var centralDescription = "CENTRALDESCRIPTION GOES HERE";


var selectedModel = getCookie("selectedModel");
function writeDescription(){
    switch(selectedModel){
        case "singleServer":
            addDescriptionTitle(singleTitle);
            addDescriptionBlock(singleDescription);
            break;
        case "twoServers":
            addDescriptionTitle(twoTitle);
            addDescriptionBlock(twoDescription);
            break;
        case "singleFeedback":
            addDescriptionTitle(feedbackTitle);
            addDescriptionBlock(feedbackDescription);
            break;
        case "workstations":
            addDescriptionTitle(workstationTitle);
            addDescriptionBlock(workstationDescription);
            break;
        case "centralServer":
            addDescriptionTitle(centralTitle);
            addDescriptionBlock(centralDescription);
            break;
    }
}