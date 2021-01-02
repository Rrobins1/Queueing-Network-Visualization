var maxTasks = 1000;
var maxEvents = 10000;

class Simulation{
    constructor(identifier, model, maximumEvents, maximumTasks){
        this.identifier = identifier;
        this.maximumEvents = maximumEvents;
        this.maximumTasks = maximumTasks;
        this.model = model;
        this.tableOutputs = [];
    }
    processEvent(){
        this.model.processEvent();
    }
    runNumberOfEvents(eventCount){
        for(var i = 0; i < eventCount; i++){
            this.processEvent();
        }
    }
    runSimulation(){
        while(this.model.eventsProcessed < eventsToRun && tasksCompleted < maximumTasks){
            this.processEvent();
        }
    }
}

class SingleServerModel extends Model{
    constructor(arrivalDistribution, serverDistribution){
        super("Single Server");
        
        //Create Components For Model
        var arrivalComponent = new ArrivalComponent("Arrivals", arrivalDistribution);
        var queueComponent = new QueueComponent("Queue");
        var serverComponent = new ServiceComponent("Server", serverDistribution);
        var exitComponent = new ExitComponent("Exit");

        //Add Components to the Model
        this.addComponent(arrivalComponent);
        this.addComponent(queueComponent);
        this.addComponent(serverComponent);
        this.addComponent(exitComponent);

        //Link Components
        this.setNext(arrivalComponent, queueComponent);
        this.setNext(queueComponent, serverComponent);
        this.connectQueue(queueComponent);
        this.setNext(serverComponent, exitComponent);

        //Set Initial Point
        arrivalComponent.generateNextArrival();
    }
}
class TwoServersModel extends Model{
    constructor(arrivalDistribution, serverDistribution){
        super("Two Servers");

        //Create Model Components
        var arrivalComponent = new ArrivalComponent("Arrivals", arrivalDistribution);
        var queueComponent = new QueueComponent("Queue");
        var parallelServers = new ParallelComponent("Parallel", ServiceComponent, serversDistribution, 2, twoServersModel);
        var exitPoint = new ExitComponent("Exit");
        //Add to Model
        this.addComponent(arrivalComponent);
        this.addComponent(queueComponent);
        this.addComponent(parallelServers);
        this.addComponent(exitPoint);

        //Link Components
        this.setNext(arrivalComponent, queueComponent);
        this.setNext(queueComponent, parallelServers);
        parallelServers.connectQueue(queueComponent);
        this.setNext(parallelServers, exitPoint);

        //Initialize Model
        arrivalComponent.generateNextArrival();
    }
}

class SingleFeedbackModel extends Model{
    constructor(){
       super("Single Server (Feedback)");
        
       //Create Model Components
       var arrivalComponent = new ArrivalComponent("Arrivals", arrivalDistribution);
       var queueComponent = new QueueComponent("Queue");
       var serverComponent = new FeedbackServer("Server", serverDistribution, feedbackProbability);
       var exitPoint = new ExitComponent("Exit");
       
       //Add to Model
       this.addComponent(arrivalComponent);
       this.addComponent(queueComponent);
       this.addComponent(serverComponent);
       this.addComponent(exitPoint);

       //Link Components
       this.setNext(arrivalComponent, queueComponent);
       this.setNext(queueComponent, serverComponent);
       serverComponent.connectQueue(queueComponent);
       this.setNext(serverComponent, exitPoint); 

       //Initialize
       arrivalComponent.generateNextArrival();
    }
}

class InteractiveModel extends Model{
    constructor( workstationDistribution, workstationCount, serverDistribution, serverCount){
        super("Interactive Workstations");

        //Create Base Model
        var interactiveModel = new Model("Interactive Workstations");
        
        //Create Model Components
        var parallelWorkstations = new ParallelWorkstationComponent("Workstations", workstationDistribution, workstationCount, interactiveModel);
        var parallelServers = new ParallelComponent("Servers", ServiceComponent, serverDistribution, serverCount, interactiveModel);
        var queueComponent = new QueueComponent("Queue");
        //Add to Model
        this.addComponent(parallelWorkstations);
        this.addComponent(parallelServers);
        this.addComponent(queueComponent);

        //Link Components
        this.setNext(parallelWorkstations, queueComponent);
        this.setNext(queueComponent, parallelServers);
        this.setNext(parallelServers, parallelWorkstations);
        parallelServers.connectQueue(queueComponent);
    }
}
class CentralServerModel extends Model{
    constructor( centralDistribution, channelDistribution, diskDistributions, diskCount){
        super("Central Server");

        //Create Components
        var centralProcessorQueue = new QueueComponent("Processor Queue");
        var centralProcessor = new ServiceComponent("Central Processor", centralDistribution);
        var channelQueue = new QueueComponent("Channel Queue");
        var channel = new ServiceComponent("Channel", channelDistribution);
        var parallelDisks = new ParallelComponent("Disks", [QueueComponent, ServiceComponent], diskDistributions, diskCount, centralModel);

        //Add to Model
        this.addComponent(centralProcessorQueue);
        this.addComponent(centralProcessor);
        this.addComponent(channelQueue);
        this.addComponent(channel);
        this.addComponent(parallelDisks);

        //Link Components
        this.setNext(centralProcessorQueue, centralProcessor);
        this.setNext(centralProcessor, channelQueue);
        this.setNext(channelQueue, channel);
        this.setNext(channel, parallelDisks);
        this.setNext(parallelDisks, centralProcessorQueue);

        centralProcessor.connectQueue(centralProcessorQueue);
        channel.connectQueue(channelQueue);
    }
}

//for output
function addTableRow(tableIdentifier, textResults){
    var table = document.getElementById(tableIdentifier);
    var output = "<tr>";
    textResults.forEach(element => {
        output += `<td>${element}</td>`;
    });
    output += "</tr>";
    table.innerHTML += output;
}
function addTableHeading(tableIdentifier, textResults){
    var table = document.getElementById(tableIdentifier);
    var output = "<tr>";
    textResults.forEach(element => {
        output += `<th>${element}</th>`;
    });
    output += "</tr>";
    table.innerHTML += output;
}
function addTable(identifier, location){
    var destination = document.getElementById(location);
    destination.innerHTML += `<table id="${identifier}"></table>`;
}
function createTableSection(tableIdentifier){
    document.body.innerHTML += `<div id="${tableIdentifier}Div"></div>`;
    addTable(`${tableIdentifier}`, `${tableIdentifier}Div`);
    return document.getElementById(tableIdentifier);
}

