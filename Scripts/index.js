//Starting point of program
initializeCanvas();
//context.scale(1.5,1.5);


//createSingleServerFeedback();
//createSingleServer();
function getCookie(key) {
    var name = key + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for(var i = 0; i < cookieArray.length; i++) {
      var cookie = cookieArray[i];
      while (cookie.charAt(0) == ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) == 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return "";
}
var selectedModel = getCookie("selectedModel");
switch(selectedModel){
    case "singleServer":
        createSingleServer();
        break;
    case "twoServers":
        createTwoServers();
        break;
    case "singleFeedback":
        createSingleServerFeedback();
        break;
    case "workstations":
        //var workstationCount = getCookie("count-workstation");
        //var serverCount = getCookie("count-server");
        createWorkstations(5,3);
        break;
    case "centralServer":
        createCentralServer(6);
        break;
}

//createCentralServer(6);
//createWorkstations(5,3);
//call redraw over and over for redrawing if scale