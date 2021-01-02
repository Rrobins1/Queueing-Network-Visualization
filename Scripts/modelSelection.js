var single = document.getElementById("single-server");
var feedback = document.getElementById("single-feedback");
var two = document.getElementById("two-servers");
var workstations = document.getElementById("workstations");
var center = document.getElementById("central-server");

single.onclick = function(){ 
    document.cookie = `selectedModel = singleServer;`;
    window.location.href = "../Pages/modelConfiguration.html";
}

feedback.onclick = function() {
    document.cookie = `selectedModel = singleFeedback;`;
    window.location.href = "../Pages/modelConfiguration.html";
}
two.onclick = function() {
    document.cookie = `selectedModel = twoServers;`;
    window.location.href = "../Pages/modelConfiguration.html";
}
workstations.onclick = function() {
    document.cookie = `selectedModel = workstations;`;
    window.location.href = "../Pages/modelConfiguration.html";
}
center.onclick = function() {
    document.cookie = `selectedModel = centralServer;`;
    window.location.href = "../Pages/modelConfiguration.html";
}