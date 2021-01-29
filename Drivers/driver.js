/////////////////////////////////////////////////////////////////
// driver.js
// The interface to run the simulation and update the visual
////////////////////////////////////////////////////////////////


/************************************************
* TIMER AND RUNNING COMPONENTS
************************************************/
var timeElapsed = 0;
var currentModel = null;
var currentSimulation = null;
var lock = false;
var timeNextEvent;

var tempRate = 1;


function createTimer(updateFunction, rate = updateRate){
    return setInterval(updateFunction, tempRate);
}

function runModel(rate = updateRate){
    currentModel.timerRunning = true;
    currentModel.intervalID = createTimer(tickModel, rate);
}
function tickModel(){
    timeNextEvent = currentSimulation.getNextEventTime();
    if(timeNextEvent !== null && timeElapsed >= timeNextEvent*1000 && currentSimulation.eventsProcessed < 30){
        currentSimulation.processEvent();
        console.log(currentModel.events[0].object.identifier + "|" + currentModel.events[0].task.identifier + "|" + currentModel.events[0].type);
        printResults();
    }
    currentModel.tickOnce();
}

/************************************************
* OUTPUT PRINTING
************************************************/
var titleLocation, resultsLocation;
function setPrintOutputLocation(titleLocationID, resultLocationID){
    titleLocation = document.getElementById(titleLocationID);
    resultsLocation = document.getElementById(resultLocationID);

    if(titleLocation === undefined)
        console.log("Invalid title output location");
  
    if(resultsLocation === undefined)
        console.log("Invalid results output location");

}
function printDebugResults(){
    titleLocation.innerHTML = currentSimulation.toTable();
    resultsLocation.innerHTML = currentSimulation.componentsToTable();
}
function printResults(){
    //titleLocation.innerHTML = currentSimulation.getTitle();
    //resultsLocation.innerHTML = currentSimulation.getUserData();
    resultsLocation.innerHTML = currentSimulation.displayResultsByType();
}

/************************************************
* Creation methods
************************************************/
function createSingleServer(arrivalDistribution, serviceDistribution){
    currentSimulation= new SingleServerModel(arrivalDistribution, serviceDistribution);
    currentModel = new SingleServerVisualModel();
    currentSimulation.connectVisualModel(currentModel);
    drawCanvas();
    currentModel.draw();    
    runModel(updateRate);
}
function createSingleFeedback(arrivalDistribution, serviceDistribution, feedbackRate){
    currentSimulation= new SingleFeedbackModel(arrivalDistribution, serviceDistribution, feedbackRate);
    currentModel = new SingleFeedbackVisualModel();
    currentSimulation.connectVisualModel(currentModel);
    console.log(currentSimulation);
    console.log(currentModel);
    drawCanvas();
    currentModel.draw();    
    runModel(updateRate);
}

var t1 = new Distribution("uniform", {"lowerBound": 6, "upperBound": 8});
var t2 = new Distribution("uniform", {"lowerBound": 2, "upperBound": 12}); 

function createTwoServers(arrivalDistribution, serviceDistributions){
    currentSimulation= new TwoServersModel(arrivalDistribution, serviceDistributions);
    currentModel = new TwoServersVisualModel();
    currentSimulation.connectVisualModel(currentModel);
    drawCanvas();
    currentModel.draw();    
    runModel(updateRate);
}
var workstationCount = 6;
var serverCount = 6;

var w1 = new Distribution("uniform", {"lowerBound": 6, "upperBound": 24});
var w2 = new Distribution("uniform", {"lowerBound": 10, "upperBound":15}); 

function createWorkstations(workstationDistribution, workstationCount, serverDistribution, serverCount){
    currentSimulation= new InteractiveModel(workstationDistribution, workstationCount, serverDistribution, serverCount);
    currentModel = new InteractiveVisualModel(workstationCount, serverCount);
    currentSimulation.connectVisualModel(currentModel);
    currentSimulation.addInitialVisualEvents();
    drawCanvas();
    currentModel.draw();    
    runModel(updateRate);
}

function createCentralServer( centralDistribution, channelDistribution, diskDistributions, diskCount){
    currentSimulation= new CentralServerModel(centralDistribution, channelDistribution, diskDistributions, diskCount);
    currentModel = new CentralServerVisualModel(diskCount);
    currentSimulation.connectVisualModel(currentModel);
    drawCanvas();
    currentModel.draw();    
    runModel(updateRate);
}

function onClickPause(){

}
function onClickResume(){

}
function onClickSpeedUp(){

}
function onClickSpeedDown(){
    
}

//Distribution Templates
var lowerBound = 0;
var upperBound = 1;
var constantValue = 1;
var exponentialMean = 5;

var uniformDistribution = new Distribution("uniform", {"lowerBound": lowerBound, "upperBound": upperBound});
var constantDistribution = new Distribution("constant", {"value": constantValue}); 
var exponentialDistribution = new Distribution("exponential", {"mean": exponentialMean});


////////////////////////////////////
// TWO SERVERS
///////////////////////////////////
var twoServersUniformDistribution = new Distribution("uniform", {"lowerBound": lowerBound, "upperBound": upperBound});
var twoServersConstantDistribution = new Distribution("constant", {"value": constantValue}); 
var twoServersExponentialDistribution = new Distribution("exponential", {"mean": exponentialMean});

var twoServersArrivalDistribution = twoServersUniformDistribution;
var twoServersServerDistribution = twoServersUniformDistribution;

/////////////////////////////////////
//SINGLE FEEDBACK
////////////////////////////////////
var feedbackLowerBound = 0;
var feedbackUpperBound = 5;
var feedbackConstantValue = 5;
var feedbackExponentialMean = 5;
var feedbackUniformDistribution = new Distribution("uniform", {"lowerBound": 0, "upperBound": 5});
var feedbackConstantDistribution = new Distribution("constant", {"value": constantValue}); 
var feedbackExponentialDistribution = new Distribution("exponential", {"mean": exponentialMean});

var singleFeedbackServerDistribution = new Distribution("uniform", {"lowerBound": 0, "upperBound": 4});
var singleFeedbackArrivalDistribution = feedbackUniformDistribution;
var feedbackReturnProbability = 0.3;

///////////////////////////////
// Workstations
/////////////////////////////////
var workstationCount = 5;
var workstationDistribution = new Distribution("uniform", {"lowerBound": 0, "upperBound": 5});

var serverCount = 3;
var serverDistribution = new Distribution("uniform", {"lowerBound": 0, "upperBound": 4});



/////////////////////////////////
// Central Server
///////////////////////////////
var centralDistribution = new Distribution("uniform", {"lowerBound": 0, "upperBound": 4});
var channelDistribution = new Distribution("uniform", {"lowerBound": 0, "upperBound": 4});
var diskDistributions = [
    new Distribution("uniform", {"lowerBound": 0, "upperBound": 4}),
    new Distribution("uniform", {"lowerBound": 0, "upperBound": 4}),
    new Distribution("uniform", {"lowerBound": 0, "upperBound": 4}),
    new Distribution("uniform", {"lowerBound": 0, "upperBound": 4})
];
var diskCount = 4;

//singleServerSimulation(uniformDistribution, constantDistribution);
//twoServersSimulation(twoServersArrivalDistribution, twoServersServerDistribution);
//singleFeedbackSimulation(singleFeedbackArrivalDistribution, singleFeedbackServerDistribution, feedbackReturnProbability);
//workstationsSimulation(workstationDistribution, workstationCount, serverDistribution, serverCount);
//centralServerSimulation(centralDistribution, channelDistribution, diskDistributions, diskCount);

