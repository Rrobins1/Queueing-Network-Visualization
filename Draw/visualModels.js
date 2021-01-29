//Timer For Drawing Update
var timeElapsed = 0;
var currentModel = null;

function createTimer(updateFunction, rate = updateRate){
    return setInterval(updateFunction, rate);
}

function runModel(rate = updateRate){
    currentModel.timerRunning = true;
    currentModel.intervalID = createTimer(tickModel, rate);
}
function tickModel(){
    currentModel.tickOnce();
}
/*********************************************************************
 *  Contains Functions to Create the Visual Component of Models
 ********************************************************************/
class ModelVisual {
    constructor(identifier){
        currentModel = this;
        this.identifier = identifier;
        this.components = {};
        this.tasks = {};
        this.events = [];
        this.drawnConnections = [];
        this.intervalID = null;
        this.timerRunning = false;
    }
    startTimer(){
        if(this.intervalID == null)
            this.intervalID = runModel(this);
    }
    stopTimer(){
        if(this.intervalID !== null){
            clearInterval(this.intervalID);
        }
        this.intervalID = null;
    }
    addComponent(visualObject){
        this.components[visualObject.identifier] = visualObject;
        if(visualObject.containedElements !== undefined){
            for(var i = 0; i < visualObject.containedElements.length; i++ ){
                this.components[visualObject.containedElements[i].identifier] = visualObject.containedElements[i];
            }
        }
    }
    setNext(first, second){
        first.setNext(second);
    }
    connectQueue(object, queue){
        object.setConnection(queue);
    }
    addEvent(event){
        this.events.push(event);
        if(this.timerRunning = false){
            this.timerRunning = true;
            this.startTimer();
        }
    }
    addTask(task){
        this.tasks[task.identifier] = task;
    }
    addDrawnConnection(itemOne, itemTwo, connectFunction){
        this.drawnConnections.push({"arguments": [itemOne, itemTwo], "function": connectFunction});
    }
    callConnectionFunction(connection){
        connection.function(...connection.arguments);
    }
    removeTask(task){
        delete this.tasks[task.identifier];
    }
    tickOnce(){
        //if(timeElapsed > 6000){
          //  this.stopTimer();
        //}
        //if(this.timerRunning == false){
          //  this.stopTimer();
        //}
        timeElapsed += updateRate;
        if(this.events.length > 0){
            var event = this.events[0];
            console.log(event);
            if(timeElapsed >= event.time){
                if(event.type == "accept"){
                    event.object.acceptTask(event.task);
                    this.events.shift();
                }
                else if (event.type == "advance"){
                    event.object.advanceTask(event.task);
                    this.events.shift();
                }
            }
        }
        this.draw();
    }
    createEvent(simulationObject, time, eventType, taskIdentifier = null){
        var object, time, task = taskIdentifier;
        object = this.components[simulationObject.identifier];
        time = time;
        eventType = eventType;
        if(taskIdentifier != null){
            if(this.tasks[taskIdentifier] != undefined){
                task = this.tasks[taskIdentifier];
            }
            else {
                this.createVisualTask(taskIdentifier, object);
                task = this.tasks[taskIdentifier];
            }
        }
        var event = {
            "object": object,
            "time": time,
            "type": eventType,
            "task": task,
            "simulationObject": simulationObject
        }
        this.addEvent(event);
    }
    
    createVisualTask(taskIdentifier, initialObject){
        var x = initialObject.connections.start.x;
        var y = initialObject.connections.start.y;
        this.addTask(createVisualTask(x,y, taskIdentifier));
    }
    draw(){
        drawCanvas();
        //Draw Base Components
        for(const key in this.components){
            if(this.components.hasOwnProperty(key)){
                this.components[key].draw();
            }
        }

        //Draw Connections
        this.drawnConnections.forEach(connection => {
            this.callConnectionFunction(connection);
        });

        //Draw Tasks
        for (const key in this.tasks){
            if(this.tasks.hasOwnProperty(key)){
                this.tasks[key].draw();
            }
        }
    }
    startRunning(updateRate){
        this.timerRunning = true;
        this.startTimer(this, updateRate);
    }
}

class SingleServerVisualModel extends ModelVisual{
    constructor(){
        super("Single Server");
        let x = 300;
        let y = 400;

        //Set Up Base Components
        let queue = new QueueVisual(x,y,"Queue");
        let server = new ServerVisual(x + QueueVisual.width + horizontalSpacing, y, "Server");
        let entryPoint = new EntrancePoint(queue.connections.start.x - horizontalSpacing*2, y, "Arrivals");    
        let exitPoint = new ExitPoint(server.connections.end.x + 2*horizontalSpacing, y);

        //Add Components to the Model
        this.addComponent(entryPoint);
        this.addComponent(queue);
        this.addComponent(server);
        this.addComponent(exitPoint);

        //Link Components Together
        this.setNext(entryPoint, queue);
        this.setNext(queue, server);
        this.setNext(server, exitPoint);
        this.setNext(exitPoint, null);
        server.setConnection(queue);
        
        //Drawn Paths
        this.addDrawnConnection(entryPoint, queue, connectArrow);
        this.addDrawnConnection(queue, server, connectArrow);
        this.addDrawnConnection(server, exitPoint, connectArrow);
    }
}

class SingleFeedbackVisualModel extends ModelVisual{
    constructor(){
        super("Single Server With Feedback");
        var drawX = 300;
        var drawY = 400;
        var offset = 15;

        var serverOneQueue = new QueueVisual(drawX, drawY, "Queue");
        drawX += horizontalSpacing + QueueVisual.width;
        var serverOne = new FeedbackServerVisual(drawX,drawY, "Server");
       
        var boundaries = {
            "bottomRight" : new VisualAnchor( serverOne.connections.end.x + horizontalSpacing, serverOne.connections.end.y),
            "topRight" : new VisualAnchor(serverOne.connections.end.x + horizontalSpacing, serverOne.connections.end.y - verticalSpacing),
            "topLeft" : new VisualAnchor(200, serverOne.connections.end.y - verticalSpacing),
            "bottomLeft" : new VisualAnchor(200, serverOneQueue.connections.start.y - offset),
            "exitConnection" : new ExitPoint(serverOne.connections.end.x + horizontalSpacing*3, serverOne.connections.end.y)
        };
        var arrowUp = new VisualAnchor(boundaries.bottomRight.coordinates.x + 4, boundaries.bottomRight.connections.start.y - verticalSpacing/2); 
        var mergeBottom = new VisualAnchor(serverOneQueue.connections.start.x, drawY + offset);
        var mergeTop = new VisualAnchor(serverOneQueue.connections.start.x, drawY - offset);
        var entrance = new EntrancePoint(200 - horizontalSpacing, drawY + offset, "Arrivals");

        //Add Components
        this.addComponent(serverOneQueue);
        this.addComponent(serverOne);
        this.addComponent(entrance);
        this.addComponent(boundaries.exitConnection);
        serverOne.setConnection(serverOneQueue);

        //Set Next
        this.setNext(entrance, mergeBottom);
        this.setNext(mergeBottom, serverOneQueue);
        this.setNext(serverOneQueue, serverOne);
        this.setNext(serverOne, boundaries.bottomRight);
        serverOne.connectExit(boundaries.exitConnection);


        this.setNext(boundaries.bottomRight, boundaries.topRight);
        this.setNext(boundaries.topRight, boundaries.topLeft);
        this.setNext(boundaries.topLeft, boundaries.bottomLeft);
        this.setNext(boundaries.bottomLeft, mergeTop);
        this.setNext(mergeTop, serverOneQueue);

        //Drawn Connections
        this.addDrawnConnection(boundaries["bottomRight"], arrowUp, connectArrow);
        this.addDrawnConnection(boundaries["bottomLeft"], mergeTop, connectArrow);
        this.addDrawnConnection(entrance, mergeBottom, connectArrow);
        this.addDrawnConnection(serverOneQueue, serverOne, connectArrow);
        this.addDrawnConnection(serverOne, boundaries["bottomRight"], connectLine);
        this.addDrawnConnection(boundaries["bottomRight"], boundaries["topRight"], connectLine);
        this.addDrawnConnection(boundaries["topRight"], boundaries["topLeft"], connectLine);
        this.addDrawnConnection(boundaries["topLeft"], boundaries["bottomLeft"], connectLine);
        this.addDrawnConnection(serverOne, boundaries["exitConnection"], connectArrow);
    }
}

class TwoServersVisualModel extends ModelVisual{
    constructor(){
        super("Two Servers");
        let x1 = 400;
        let y1 = 400;

        //Set up Components
        let queue = new QueueVisual(x1, y1, "Server_1_Queue");
        let twoServers = new ParallelContainer(x1 + horizontalSpacing + QueueVisual.width, y1, "Parallel", ServerVisual, 2);
        let entryPoint = new EntrancePoint(queue.connections.start.x - horizontalSpacing*2, y1, "Arrivals");
        let exitPoint = new ExitPoint(twoServers.connections.end.x + horizontalSpacing*2, y1);
    
        //Add Components to Model
        this.addComponent(entryPoint);
        this.addComponent(queue);
        this.addComponent(twoServers);
        this.addComponent(exitPoint);

        //Link Components
        this.setNext(entryPoint, queue);
        this.setNext(queue, twoServers);
        this.setNext(twoServers, exitPoint);
        //this.setNext(exitPoint, null);
        twoServers.connectQueue(queue);

        //Drawn Paths
        this.addDrawnConnection(entryPoint, queue, connectArrow);
        this.addDrawnConnection(queue, twoServers, connectArrow);
        this.addDrawnConnection(twoServers, exitPoint, connectArrow);
    }
}

class InteractiveVisualModel extends ModelVisual{
    constructor(numberWorkstations, numberServers){
        super("Interactive Workstations");

        //Coordinates
        var yMain = 400;
        var xStart = 100;
        var xEnd = 900;
        var yTop = 100;
     
        var stationCoord = {"x": 200, "y": yMain};
        var queueCoord = {"x": 400, "y": yMain};
        var serverCoord = {"x": 700, "y": yMain};

        var visualAnchors = {};  
        var anchorCoords = [
            { "name": "botLeft", "x": xStart, "y": yMain},
            { "name": "botRight", "x": xEnd, "y": yMain},
            { "name": "topRight", "x": xEnd, "y": yTop},
            { "name": "topLeft", "x": xStart, "y": yTop}
        ];
        
        anchorCoords.forEach(element => {
            var name = element.name;
            visualAnchors[name] = new VisualAnchor(element.x, element.y);
        });
        
        //Main Components
        var workstationsParallel = new ParallelContainer(stationCoord.x, stationCoord.y, "Workstations", WorkstationVisual, numberWorkstations);
        var serversQueue = new QueueVisual(queueCoord.x, queueCoord.y, "Queue");
        var serversParallel = new ParallelContainer(serverCoord.x, serverCoord.y, "Servers", ServerVisual, numberServers);
    

        //Add Components
        this.addComponent(workstationsParallel);
        this.addComponent(serversQueue);
        this.addComponent(serversParallel);
    
        //Link Components
        this.setNext(visualAnchors["botLeft"], workstationsParallel);
        this.setNext(workstationsParallel, serversQueue);
        this.setNext(serversQueue, serversParallel);
        this.setNext(serversParallel, visualAnchors["botRight"]);
        this.setNext(visualAnchors["botRight"], visualAnchors["topRight"]);
        this.setNext(visualAnchors["topRight"], visualAnchors["topLeft"]);
        this.setNext(visualAnchors["topLeft"], visualAnchors["botLeft"]);
        serversParallel.connectQueue(serversQueue);   
        
        //Add Drawn Paths
        this.addDrawnConnection(workstationsParallel, serversQueue, connectArrow);
        this.addDrawnConnection(serversQueue, serversParallel, connectArrow);
        this.addDrawnConnection(visualAnchors["botLeft"], workstationsParallel, connectArrow);
        this.addDrawnConnection(serversParallel, visualAnchors["botRight"], connectLine);
        this.addDrawnConnection(visualAnchors["botRight"], visualAnchors["topRight"], connectLine);
        this.addDrawnConnection(visualAnchors["topRight"], visualAnchors["topLeft"], connectLine);
        this.addDrawnConnection(visualAnchors["topLeft"], visualAnchors["botLeft"], connectLine);
    }
}

class CentralServerVisualModel extends ModelVisual{
    constructor(numberDisks){
        super("Central Server");
        
        //Coordinates
        var yMain = 500;
        var ySecondary = 75;
        var xStart = 300;
        var xEnd = 900;
        var diskCoord = {"x": 500, "y": yMain};
        var centralQCoord = {"x": xEnd, "y": ySecondary};
        var centralCoord = {"x": xEnd - horizontalSpacing - serverRadius*2, "y": ySecondary};
        var channelQCoord = {"x": xStart + horizontalSpacing + serverRadius*2, "y": ySecondary};
        var channelCoord = {"x": xStart, "y": ySecondary};
           
        //Components
        var disksParallel = new ParallelContainer(diskCoord.x, diskCoord.y, "Disks_Parallel", [QueueVisual, DiskVisual], numberDisks);
        var centralQueue = new QueueVisual(centralQCoord.x, centralQCoord.y, "Central Processor Queue");
        var centralProcessor = new ServerVisual(centralCoord.x, centralCoord.y, "Central Processor");
        var channelQueue = new QueueVisual(channelQCoord.x, channelQCoord.y, "Channel Queue");
        var channel = new ServerVisual(channelCoord.x, channelCoord.y, "Channel");
    
        centralQueue.reverseDrawing();
        centralProcessor.reverseDrawing();
        channelQueue.reverseDrawing();
        channel.reverseDrawing();
        
        var topRight = new VisualAnchor(xEnd + 100 + QueueVisual.width, ySecondary);
        var bottomRight = new VisualAnchor(xEnd + 100 + QueueVisual.width, yMain);
        var topLeft = new VisualAnchor(xStart - 100, ySecondary);
        var bottomLeft = new VisualAnchor(xStart - 100, yMain);
    
        //Add Components to Model
        this.addComponent(disksParallel);
        this.addComponent(centralQueue);
        this.addComponent(centralProcessor);
        this.addComponent(channelQueue);
        this.addComponent(channel);
        
        //Drawn Connections
        this.addDrawnConnection(topRight, centralQueue, connectArrowReverse);
        this.addDrawnConnection(channelQueue, channel, connectArrowReverse);
        this.addDrawnConnection(centralQueue, centralProcessor, connectArrowReverse);
        this.addDrawnConnection(centralProcessor, channelQueue, connectArrowReverse);
        this.addDrawnConnection(disksParallel, bottomRight, connectLine);
        this.addDrawnConnection(bottomRight, topRight, connectLine);
        this.addDrawnConnection(bottomLeft, disksParallel, connectArrow);
        this.addDrawnConnection(channel, topLeft, connectLine);
        this.addDrawnConnection(topLeft, bottomLeft, connectLine);
    }
}
