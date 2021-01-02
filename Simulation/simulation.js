var currentTime = 0;
var tasksCompleted = 0;
var cumulativeResponseTime = 0;

function simulationToTable(){
    var generalHeadings = ["Current Time", "Tasks Completed", "Response Time"];
    var generalData = [currentTime, tasksCompleted, cumulativeResponseTime / tasksCompleted];
    var output = "<tr>";
    generalHeadings.forEach(element => {
        output += `<th>${element}</th>`;
    });
    output += "</tr><tr>"
    generalData.forEach(element => {
        output += `<td>${element}</td>`;
    });
    output += "</tr>";
    return output;
}
function setTime(time){
    currentTime = time;
}

document.head.innerHTML+=`<style>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  
}

td, th {
  border: 2px solid #FFFFFF;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>`

class Task{
    constructor(identifier, creationTime){
        this.identifier = identifier;
        this.creationTime = creationTime;
    }
    getRunTime(){
        return currentTime - this.creationTime;
    }
    toString(){
        return this.identifier;
    }
}

class Model{
    constructor(identifier){
        this.identifier = identifier;
        this.components = {};
        this.events = [];
        this.eventsProcessed = 0;
        this.visualModel = null;
        
        //Results
        this.throughput = 0;
        this.responseTime = 0;
        this.sdvResponseTime = 0;

    }
    addComponent(component){
        this.components[component.identifier] = component;
        component.model = this;
    }
    setNext(first, second){
        first.setNext(second);
    }
    linkComponent(first, second){
        second.setConnection(first);
    }
    //adds event then sorts according to time, running time for sorted list should not take long enough 
    //to need creation of nodes and insertion sort
    addEvent(target){
        this.events.push(target);
        this.events = this.events.sort((a, b) => a.timeNextEvent > b.timeNextEvent ? 1 : -1);
    }
    updateEvent(target){
        var index = this.events.findIndex(target);
        if(index == -1)
            this.addEvent(target);
        else{
            this.events[index].timeNextEvent = target.timeNextEvent;
            this.events = this.events.sort((a, b) => a.timeNextEvent > b.timeNextEvent ? 1 : -1);
        }
    }
    //runs the event
    processEvent(){
        var target = this.events.shift();

        //update visual component
        if(this.visualModel != null){
            this.updateVisual(target);
        }

        //Advance the simulation
        currentTime = target.timeNextEvent;
        target.advanceTask();
        this.eventsProcessed++;
    }
    toTable(){
        var tableHeadings = ["ID", "Contained Events"];
        
        var events = "";

        this.events.forEach(element => {
            events += element.identifier + ": " + element.timeNextEvent + " | ";
        });
         
        var tableData = [this.identifier, events];

        var output = "<tr>";
        tableHeadings.forEach(element => {
            output += `<th>${element}</th>`;
        });
        output += "</tr><tr>"
        tableData.forEach(element => {
            output += `<td>${element}</td>`;
        });
        output += "</tr>";
        
        return output;
    }
    componentsToTable(){
        var output = "";
        this.components.forEach(component => {
            output += component.toTable();
        });
        return output;
    }
    updateVisual(simulationObject){
        var event = {
            "identifier": simulationObject.identifier, 
            "task": simulationObject.task.identifier, 
            "time": simulationObject.timeNextEvent,
            "function": (simulationObject.type == "arrival" ? "accept" : "advance")
        };
        this.visualModel.processEvent(event);
    }
    connectVisualModel(visualModel){
        this.visualModel = visualModel;
    }
    
}

class Distribution{
    constructor(type, values){
        this.type = type;
        this.values = values;
    }
    generate(){
        switch(this.type){
            case "uniform":
                var upperBound = this.values.upperBound;
                var lowerBound = this.values.lowerBound;
                return Math.random() * (upperBound - lowerBound) + lowerBound;
            case "exponential":
                var mean = this.values.mean;
                return -1.0 * mean * Math.log(1.0 - Math.random());
            case "constant":
                return this.values.value;
        }
    }
    toString(){
        var distributionComponents;
        switch(this.type){
            case "uniform":
                distributionComponents = "Lower: " + this.values.lowerBound + "| Upper: "+ this.values.upperBound;
                break;
            case "exponential":
                distributionComponents = this.values.mean;
                break;
            case "constant":
                distributionComponents = this.values.value;
                break;
        }
        return "Distribution: " + this.type + " | " + distributionComponents;
    }
}

class SimulationComponent {
    constructor(identifier, type){
        this.identifier = identifier;
        this.type = type; //the type of object, ex. server
        this.model = null;
        this.available = true;
        this.task = null;
        this.timeNextEvent = null; //time at which next event is scheduled to occur for this object
    }
    setNext(component){
        this.next = component;
    }
    setPrevious(component){
        this.previous = component;
    }
    acceptTask(task){
        this.task = task;
    }
    advanceTask(task){
        this.next.acceptTask(task);
    }
    //to be overridden in decendants for relevant output
    toString(){
        var output;
        output = this.identifier + "| Task: " + this.task;
    }
    checkAvailability(){
        return this.available;
    }
}

class QueueComponent extends SimulationComponent{
    constructor(identifier){
        super(identifier, "Queue");
        this.tasks = {};
        this.tasksWaiting = [];
        this.numberTasks = 0;
    }
    acceptTask(task){ //Receiving a new task
        this.tasks[task.identifier] = task;
        this.numberTasks++;
        
        //if not available push to waiting
        if(!this.next.checkAvailability()){
            this.tasksWaiting.push(task);
        }
        else {
            if(this.tasksWaiting.length > 0){
                this.forwardTask(this.tasksWaiting.shift());
                this.tasksWaiting.push(task);
            }
            else{
                this.forwardTask(task);
            }
        }
    }
    forwardTask(task){
        this.next.acceptTask(task);
    }
    advanceTask(task){ //Called by component that queue is linked to
        this.removeTask(task);  
        if(this.tasksWaiting.length > 0 && this.next.checkAvailability()){
            this.next.acceptTask(this.tasksWaiting.shift());
        }
    }
//TODO verify removed
    removeTask(task){
        delete this.tasks[task.identifier];
        this.numberTasks--;
    }
    toString(){
        var output = this.identifier + ": <br/>Contained Tasks: ";
        for (const key in this.tasks) {
            if (this.tasks.hasOwnProperty(key)) 
                output  += this.tasks[key].toString() + " | ";             
        }
        return output;
    }
    toTable(){
        var tableHeadings = ["ID", "Contained Tasks"];

        var tasks = "";
        for (const key in this.tasks) {
            if (this.tasks.hasOwnProperty(key)) 
            tasks  += this.tasks[key].toString() + " | ";             
        }
        var tableData = [this.identifier, tasks];

        var output = "<tr>";
        tableHeadings.forEach(element => {
            output += `<th>${element}</th>`;
        });
        output += "</tr><tr>"
        tableData.forEach(element => {
            output += `<td>${element}</td>`;
        });
        output += "</tr>";
        
        return output;
    }
}

class ServiceComponent extends SimulationComponent{
    constructor(identifier, distribution){
        super(identifier, "Server");
        this.distribution = distribution;
        this.connectedQueue = null;
        this.available = true;
        
        //Metrics Needed
        this.timeUtilized = 0;
        this.numberTasksProcessed = 0; 
        this.totalServiceTime = 0; 

        //Metrics to Evaluate
        this.jobsServiced = 0;
        this.utilization = 0;
        this.averageServiceTime = 0;
        this.sdvAverageServiceTime = 0;
    }
    connectQueue(queue){
        this.connectedQueue = queue;
    }
    acceptTask(task){
        this.task = task;
        //Generate Random Service Time Based on Distribution
        var randomServiceTime = this.distribution.generate();
        this.totalServiceTime += randomServiceTime;
        this.timeUtilized += randomServiceTime;
        this.timeNextEvent = randomServiceTime + currentTime;
        this.available = false;
        this.model.addEvent(this);

        //Return Information Regarding Next Event for This Object
        return {"component": this.identifier, "time": this.timeNextEvent, "task": task};
    }
    advanceTask(){
        //Move Task to Next Component
        var task = JSON.parse(JSON.stringify(this.task));
        if(this.next != null && this.next.available)
            this.next.acceptTask(this.task);
        
        this.jobsServiced++;
        this.utilization = this.timeUtilized / currentTime;
        this.averageResponseTime = this.totalServiceTime / this.jobsServiced;
        
        this.available = true;
        this.timeNextEvent = null;
        this.task = null;
        
        //If there is a connected queue, notify that server is available
        if(this.connectedQueue != null)
            this.connectedQueue.advanceTask(task);
    }
    toString(){
        var serverInformation = this.identifier + ": ";
        serverInformation += "<br>Jobs: " + this.jobsServiced + " | Response: " + this.averageResponseTime + " | Utilization: " + this.utilization; 
        serverInformation += "<br>" + this.distribution.toString();
        serverInformation += "<br>Active Task: " + this.task;
        serverInformation += "<br/>Next Event: " + this.timeNextEvent;
        return serverInformation;
    }
    getOutput(){
        return [
            {"Jobs" : this.jobsServiced},
            {"Service Time" : this.jobsServiced},
            {"Active Task" : this.task},
            {"Next Event" : this.timeNextEvent}
        ];
    }
    toTable(){
        var tableHeadings = ["ID", "Jobs", "Service Time", "Active Task", "Next Event", "Utilization"];
        var tableData = [this.identifier,this.jobsServiced, this.totalServiceTime/this.jobsServiced, this.task, this.timeNextEvent, this.utilization];

        var output = "<tr>";
        tableHeadings.forEach(element => {
            output += `<th>${element}</th>`;
        });
        output += "</tr><tr>"
        tableData.forEach(element => {
            output += `<td>${element}</td>`;
        });
        output += "</tr>";
        
        return output;
    }
}

class ArrivalComponent extends SimulationComponent{
    constructor(identifier, distribution){
        super(identifier, "arrival");
        this.identifier = identifier;
        this.distribution = distribution;
        this.jobsArrived = 0;

        //metrics needed
        this.interArrivalTime = 0;
        this.totalInterArrivalTime = 0;
    }
    generateNextArrival(){
        var generatedTime = this.distribution.generate();
        this.timeNextEvent += generatedTime; 
        this.totalInterArrivalTime += generatedTime;
        this.jobsArrived += 1;
        this.model.addEvent(this);
    }
    advanceTask(){
        this.next.acceptTask(new Task(`Task ${this.jobsArrived + 1}`, this.timeNextEvent));
        this.generateNextArrival();
    }
    toString(){
        var arrivalInformation = this.identifier + ": " 
        arrivalInformation += "<br/>Jobs: " + this.jobsArrived; 
        arrivalInformation += "<br/>" + this.distribution.toString();
        arrivalInformation += "<br/>Active Task: " + this.task;
        arrivalInformation += "<br/>Next Event: " + this.timeNextEvent;
        return arrivalInformation;
    }
    toTable(){
        var tableHeadings = ["ID", "Jobs", "Inter-Arrival Time", "Active Task", "Next Event"];
        var tableData = [this.identifier,this.jobsArrived, this.totalInterArrivalTime/this.jobsArrived, this.task, this.timeNextEvent];

        var output = "<tr>";
        tableHeadings.forEach(element => {
            output += `<th>${element}</th>`;
        });
        output += "</tr><tr>"
        tableData.forEach(element => {
            output += `<td>${element}</td>`;
        });
        output += "</tr>";
        
        return output;
    }
}

class ExitComponent extends SimulationComponent{
    constructor(identifier){
        super(identifier, "Exit");
    }
    acceptTask(task){    
        this.task = task;
        this.advanceTask(task);
    }
    advanceTask(task){
        cumulativeResponseTime += task.getRunTime();
        tasksCompleted++;
        this.task = null;
    }
}
class FeedbackServer extends ServiceComponent{
    constructor(identifier, distribution, feedbackProbability){
        super(identifier, distribution);
        this.feedbackProbability = feedbackProbability
    }

    advanceTask(){
        //Move Task to Next Component
        var task = JSON.parse(JSON.stringify(this.task));

        if(this.next != null){
            var randomValue = Math.random();
            randomValue < this.feedbackProbability ? this.choseBelow++ : this.choseAbove++;
            if(randomValue < this.feedbackProbability){
                this.next.acceptTask(this.task);
                this.tasksReturned++;
            }  
            else{
                this.tasksExitted++;
            }
        }
        this.jobsServiced++;
        this.utilization = this.timeUtilized / currentTime;
        this.averageResponseTime = this.totalServiceTime / this.jobsServiced;
        
        this.available = true;
        this.timeNextEvent = null;
        this.task = null;
        
        //If there is a connected queue, notify that server is available
        if(this.connectedQueue != null)
            this.connectedQueue.advanceTask(task);        
    }
}
class ParallelComponent extends SimulationComponent{
    constructor(identifier, objectType, distribution, numberOfElements, model){
        super(identifier, "parallel block");
        this.objectType = objectType;
        this.distribution = distribution;
        this.numberOfElements = numberOfElements;
        this.containedElements = [];
        this.objectIndices = {};
        this.demandedTasks = [];
        
        this.connectedQueue = null;
        this.model = model;
        this.placeAllObjects();
    }
    connectQueue(queue){
        this.connectedQueue = queue;
        for(var i = 0; i < this.containedElements.length; i++){
            this.containedElements[i].connectQueue(this.connectedQueue);
        }
    }
    connectInteriorObjects(){
        for(var i = 0; i < this.containedElements.length - 1; i++){
            for(var j = 0; j < this.containedElements[i].length; j++){
                connectArrow(this.containedElements[i][j], this.containedElements[i+1][j]);
            }
        }
    }
    placeAllObjects(){
        if(!Array.isArray(this.objectType)){
            this.placeObjects(this.objectType, this.containedElements);
        }
        else {
            for(var i = 0; i < this.objectType.length; i++){
                if(this.containedElements[i] === undefined){
                    this.containedElements.push([]);
                }
                this.placeObjects(this.objectType[i], this.containedElements[i]);
            }
            
            for(var i = 0; i < this.numberOfElements; i++){
                for(var j = 1; j < this.objectType.length; j++){
                    this.containedElements[j-1][i].setNext(this.containedElements[j][i]);
                    if(this.containedElements[j-1][i].type == "Queue"){
                        this.containedElements[j][i].connectQueue(this.containedElements[j-1][i]);                }
                }
            }
        }
    }
    placeObjects(object, resultArray){
        if(Array.isArray(this.distribution)){
            for (var i = 0; i < this.numberOfElements; i++){
                resultArray.push(new object(`${this.identifier} `, this.distribution[i]));
                resultArray[i].identifier += resultArray[i].type + ` ${i}`;  
                resultArray[i].model = this.model;
                this.objectIndices[resultArray[i].identifier] = resultArray[i];
            }
        }
        else{
            for (var i = 0; i < this.numberOfElements; i++){
                resultArray.push(new object(`${this.identifier} `, this.distribution));
                resultArray[i].identifier += resultArray[i].type + ` ${i}`;  
                resultArray[i].model = this.model;
                this.objectIndices[resultArray[i].identifier] = resultArray[i];
            }
        }
    }
    setNext(drawableObject){
        this.next = drawableObject;
        if( drawableObject != null){
            for(var i = 0; i < this.containedElements.length; i++){
                this.containedElements[i].setNext(this.next);
            }
            this.next.previous = this;
        }
    }
    acceptTask(task){
        var success = false;
        var availableComponents = [];

        for(var i = 0; i < this.containedElements.length; i++){
            if(this.containedElements[i].checkAvailability()){
                //this.containedElements[i].acceptTask(task);
                availableComponents.push(this.containedElements[i]);
                //this.objectIndices[this.containedElements[i].identifier].task = task;
                success = true;
                //i = this.containedElements.length;
            }
        }
        if(success){
            var numberAvailable = availableComponents.length;
            var randomValue =  Math.floor(Math.random() * numberAvailable);
            availableComponents[randomValue].acceptTask(task);
            this.objectIndices[availableComponents[randomValue].identifier].task = task;
        }
        if (!success){
            this.demandedTasks.push(task);
        }
    }
    toTable(){
        var output = "";
        this.containedElements.forEach(element => {
            output += element.toTable();
        });
        return output;
    }
    checkAvailability(){
        var success = false;
        for(var i = 0; i < this.containedElements.length; i++){
            if(this.containedElements[i].checkAvailability()){
                success = true;
                i = this.containedElements.length;
            }
        }
        return success;
    }
}

class WorkstationComponent extends ServiceComponent{
    constructor(identifier, distribution){
        super(identifier, distribution);
        var workstationTask = new Task(this.identifier + "|task", currentTime);
        this.assignedTask  = workstationTask;
        this.task = workstationTask;
    }
    acceptTask(task){
        this.task = task;
        //Generate Random Service Time Based on Distribution
        var randomServiceTime = this.distribution.generate();
        this.totalServiceTime += randomServiceTime;
        this.timeUtilized += randomServiceTime;
        this.timeNextEvent = randomServiceTime + currentTime;
        this.available = false;
        this.model.addEvent(this);

        //UPDATE GENERAL INFORMATION
        cumulativeResponseTime += task.getRunTime();
        tasksCompleted++;
        task.creationTime = currentTime;

        //Return Information Regarding Next Event for This Object
        return {"component": this.identifier, "time": this.timeNextEvent, "task": task};
    }
}

class ParallelWorkstationComponent extends ParallelComponent{
    constructor(identifier, distribution, numberOfElements, model){
        super(identifier, WorkstationComponent, distribution, numberOfElements, model);
        this.assignedTaskMapping = {};
        this.setAssignedTasks();
    }
    setAssignedTasks(){
        this.containedElements.forEach(element => {
            this.assignedTaskMapping[element.task.identifier] = element;  
            var randomServiceTime = this.distribution.generate();
            element.timeNextEvent = randomServiceTime;
            this.model.addEvent(element);
        });
    }
    getServerFromTask(task){
        return this.assignedTaskMapping[task.identifier];
    }
    checkAvailability(){
        return true;
    }
    acceptTask(task){
        this.getServerFromTask(task).acceptTask(task);
    }
}
function createVisualMessage(){
    
}

        