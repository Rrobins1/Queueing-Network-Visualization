//Starting point of program
initializeCanvas();
//context.scale(1.5,1.5);

setPrintOutputLocation("titleTable","resultsTable");

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
function getFloatCookie(key){
  var name = key + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookieArray = decodedCookie.split(';');
  for(var i = 0; i < cookieArray.length; i++) {
    var cookie = cookieArray[i];
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return parseFloat(cookie.substring(name.length, cookie.length));
    }
  }
  return "";

}
function getDistribution(componentName, distributionType){
  var parameters = {};
  switch(distributionType){
    case "constant":
      parameters.value = getFloatCookie(`${componentName}-constant-input`);
      break;
    case "uniform":
      parameters.lowerBound = getFloatCookie(`${componentName}-uniform-lower`);
      parameters.upperBound = getFloatCookie(`${componentName}-uniform-upper`);
      break;
    case "exponential":
      parameters.mean = getFloatCookie(`${componentName}-exponential-input`);
      break;
  }
  return new Distribution(distributionType, parameters);
}
function runSingleServer(){
  var serviceType = getCookie("server-distribution-type");
  var arrivalType = getCookie("arrival-distribution-type");
  var serviceDistribution = getDistribution("server", serviceType);
  var arrivalDistribution = getDistribution("arrival", arrivalType);
  console.log(arrivalDistribution);
  createSingleServer(arrivalDistribution, serviceDistribution);
}
function runTwoServers(){
  var serviceTypeOne = getCookie("server-1-distribution-type");
  var serviceDistributionOne = getDistribution("server-1", serviceTypeOne);
  var serviceTypeTwo = getCookie("server-2-distribution-type");
  var serviceDistributionTwo = getDistribution("server-2", serviceTypeTwo);
  var arrivalType = getCookie("arrival-distribution-type");
  var arrivalDistribution = getDistribution("arrival", arrivalType);
  var serviceDistributions = [serviceDistributionOne, serviceDistributionTwo];
  createTwoServers(arrivalDistribution, serviceDistributions);
}
function runSingleFeedback(){
  var serviceType = getCookie("server-distribution-type");
  var arrivalType = getCookie("arrival-distribution-type");
  var serviceDistribution = getDistribution("server", serviceType);
  var arrivalDistribution = getDistribution("arrival", arrivalType);
  createSingleFeedback(arrivalDistribution, serviceDistribution, feedbackRate);
}
function runWorkstations(){
  var workstationCount = getCookie("workstation-count");
  var workstationType = getCookie("workstation-distribution-type");
  var workstationDistribution = getDistribution("workstation", workstationType);
  
  var serverCount = getCookie("server-count");
  var serverType = getCookie("processor-distribution-type");
  var serverDistribution = getDistribution("processor", serverType);
  
  createWorkstations(workstationDistribution, workstationCount, serverDistribution, serverCount);
}
function runCentral(){
  var centralType = getCookie("workstation-distribution-type");
  var centralDistribution = getDistribution("central", centralType);
  var channelType = getCookie("workstation-distribution-type");
  var channelDistribution = getDistribution("channel", channelType);
  var diskCount = getCookie("workstation-distribution-type");
  var diskDistributions = [];

  for(var i = 0; i < diskCount; i++){
    var diskType = getCookie(`disk-${i}-distribution-type`);
    diskDistributions.push(getDistribution(`disk-${i}`, diskType));
  }
  createCentralServer(centralDistribution, channelDistribution, diskDistributions, diskCount);
}
var selectedModel = getCookie("selectedModel");
switch(selectedModel){
    case "singleServer":
        runSingleServer();
        break;
    case "twoServers":
        runTwoServers();
        break;
    case "singleFeedback":
        runSingleFeedback();
        break;
    case "workstations":
        runWorkstations();
        break;
    case "centralServer":
        runCentral();
        break;
}
