//Distribution Templates
var lowerBound = 0;
var upperBound = 5;
var constantValue = 5;
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