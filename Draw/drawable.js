/**************************************************************
* Contains Components Needed To Draw Objects Onto The Canvas
**************************************************************/

//Base drawable object
class DrawableObject {
    constructor(x, y, identifier) {
        this.identifier = identifier;
        this.coordinates = { "x": x, "y": y };
        this.connections = {"start": {"x": x, "y": y}, "end": {"x": x, "y": y}};
        this.previous = null;
        this.next = null;
        this.isAvailable = true;
        this.isReversed = false;
    }

    calculateWidth(){
        Math.abs(this.connections.end.x - this.connections.start.x);
    }
    calculateHeight(){
        return undefined;
    }
    setNext(drawableObject){
        this.next = drawableObject;
        if (drawableObject != null) 
            this.next.previous = drawableObject;
    }
    setPrevious(drawableObject){
        this.previous = drawableObject;
        this.previous.next = drawableObject;
    }
    draw (){}; //will be overidden with specific draw function
    
    receiveMessage(message){
        var type = message.type;
        switch(type){
            case "accept":
                this.acceptTask(message);
            case "advance":
                this.advanceTask(message);
            case "receive":
                this.receiveTask(message);    
        }
    }

    acceptTask(task){ //called when available to accept
        this.task = task;
        task.setDestinationObject(this);
    }
    advanceTask(task = this.task){ //moves to next component
        if(this.next != null){
            this.next.acceptTask(task);
            this.task = null;
        }
        else{
            this.task = null;
        }
    }
    receiveTask(task){
        if(this.next !== null)
        this.advanceTask(task);
    }
    reverseDrawing(){
        var temp = this.connections.start;
        this.connections.start = this.connections.end;
        this.connections.end = temp;
        this.coordinates = temp;
        this.isReversed = true;
    }
}
DrawableObject.width = undefined;
DrawableObject.height = undefined;

/************************************************************
 * Model Components
 ***********************************************************/

 //Visual Element For Tasks
class TaskVisual extends DrawableObject{
    constructor(x,y,identifier, color){
        super(x,y,identifier);
        this.color = color;
        this.visible = true;
        this.destination = {"x": x, "y": y};
        this.movementRate = taskMovementRate;
        this.destinationObject = {};
        this.isMoving = false;
    }
    setDestination(coordinates){
        this.destination.x = coordinates.x;
        this.destination.y = coordinates.y;
        this.isMoving = true;
    }
    draw(){
        if(this.isMoving){
            if (this.destination != this.coordinates && this.isMoving){
                var dy = this.destination.y - this.coordinates.y;
                var yDirection = dy == 0 ? 0 : dy > 0? 1 : -1;
                this.coordinates.y += yDirection*this.movementRate;

                if(dy==0){
                    var dx = this.destination.x - this.coordinates.x;
                    var xDirection = dx == 0 ? 0 : dx > 0 ? 1 : -1;
                    this.coordinates.x += xDirection*this.movementRate;
                }

                if(dx == 0 && dy == 0){
                    this.isMoving = false;
                    this.arrive();
                }
            }
        }
   
        if (this.isMoving){
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.coordinates.x, this.coordinates.y, taskRadius, 0, 2*Math.PI);
            context.fill();
        }
    }
    setDestinationObject(destinationObject){
        if(destinationObject != null){
            this.destinationObject = destinationObject;
            this.setDestination(destinationObject.coordinates);
        }
    }
    arrive(){this.destinationObject.receiveTask(this);}
    setCoordinates(coordinates){ 
        this.coordinates.x = coordinates.x; 
        this.coordinates.y = coordinates.y;
    }
    //moveTo(visualElement){visualElement.acceptTask();}
    makeInvisible(){this.visible = false;}
    makeVisible(){this.visible = true;}
}


//Visual Element for Queues
class QueueVisual extends DrawableObject{    
    constructor(x,y,identifier){
        super(x,y,identifier);
        this.connections.start = {"x": x, "y": y}; //start connection point
        this.connections.end = {"x": x + queueSlotSize * numberSlotsInQueue, "y": y}; //right connection point
        this.addQueueSlotVisuals();  
        
        this.numberTasks = 0;       
        this.tasks = {};
        this.taskOverflow = []; //used to contain tasks greater than amount of slots
        this.tasksWaiting = [];

        this.type = "Queue";
    }
    addQueueSlotVisuals(){ //adds queue slots to queue and labels based on position
        this.queueSlots = [];
        for(let i = numberSlotsInQueue - 1; i >= 0; i--){
            this.queueSlots.push(new QueueSlotVisual(this.coordinates.x + i * queueSlotSize, this.coordinates.y, `${this.identifier}_${i}`));
        }
    };
    
    receiveTask(task){
        task.makeInvisible();

        this.tasks[task.identifier] = {"assignedSlot": null, "task": task};

        if (this.numberTasks  < numberSlotsInQueue) {
            this.queueSlots[this.numberTasks].acceptTask(task);
            this.tasks[task.identifier].assignedSlot = this.numberTasks;

            if(this.next.isAvailable)
                this.next.acceptTask(task);
            else
                this.tasksWaiting.push(task);
        }
        else {
            this.taskOverflow.push(task);
        }
        this.numberTasks++;
    }

    advanceTask(task){ //moves task to next component if present, shifts visual for task in queue slots
        this.shiftQueueSlotTasks(task);
        this.numberTasks --;
        while(this.next.isAvailable && this.tasksWaiting.length > 0){
            this.next.acceptTask(this.tasksWaiting.shift());
            this.numberTasks --;
        }
    }

    shiftQueueSlotTasks(task){
        //Shift the tasks over
        var currentTaskData = this.tasks[task.identifier];
        for(var i = currentTaskData.assignedSlot; i < numberSlotsInQueue - 1; i++){
            var destination = this.queueSlots[i];
            var origin = this.queueSlots[i+1];
           
            if(origin.task != null){
                destination.task = origin.task;
                this.tasks[destination.task.identifier].assignedSlot = i;
            } 
            else{
                destination.task = null;
            }
        }
        

        //If any items in overflow add to last slot.
        if(this.taskOverflow.length > 0){
            this.queueSlots[numberSlotsInQueue - 1] = this.taskOverflow.shift();
            this.tasks[task.identifier].assignedSlot = numberSlotsInQueue - 1;
        }

        currentTaskData = null;
    }
    draw(){
        for (let i = 0; i < numberSlotsInQueue; i++){
            this.queueSlots[i].draw()
        }
    }
}
QueueVisual.width = queueSlotSize * numberSlotsInQueue;
QueueVisual.height = QueueVisual.width;
QueueVisual.type = "Queue";

//Visual Element for Queue Slots
class QueueSlotVisual extends DrawableObject{
    constructor(x,y,identifier){
        super(x,y,identifier);
        this.connections.start = {"x": x, "y": y};
        this.connections.end = {"x": x + queueSlotSize, "y": y};
        this.task = null;
        this.type = "Queue Slot";
    }
    acceptTask(task){    
        if (task == undefined){
            this.task = null
        }
        this.task = task;
    }



    draw(){
        context.fillStyle = this.task == null? backgroundColor : this.task.color;
        context.fillRect(this.coordinates.x, this.coordinates.y - queueSlotSize/2, queueSlotSize, queueSlotSize);
        context.strokeRect(this.coordinates.x, this.coordinates.y - queueSlotSize/2, queueSlotSize, queueSlotSize);
    }
}
QueueSlotVisual.width = queueSlotSize;
QueueSlotVisual.height = queueSlotSize;
QueueSlotVisual.type = "Queue Slot";

//Visual Element for Servers
class ServerVisual extends DrawableObject{
    constructor(x,y, identifier){
        super(x,y,identifier);
        this.connections.start = {"x": x, "y": y};
        this.connections.end = {"x": x + serverRadius*2, "y": y};
        this.task = null;
        this.connectedComponent = null; 
        this.type = "Server";
    }
    setConnection(drawableObject){
        this.connectedComponent = drawableObject;
    }
    acceptTask(task){
        this.task = task;
        this.isAvailable = false;
    }
    
    advanceTask(task){
        if(this.next.isAvailable){
            this.next.acceptTask(task);
        }
        this.task.setCoordinates(this.connections.end);
        this.task.makeVisible();
        this.task = null;
        this.isAvailable = true;

        if(this.connectedComponent != null)
            this.connectedComponent.advanceTask(task);
    }
    

    draw(){
        context.fillStyle = this.task == null? backgroundColor: this.task.color;
        context.beginPath();
        context.arc(this.coordinates.x + serverRadius, this.coordinates.y, serverRadius, 0, 2*Math.PI);
        context.fill();
        context.stroke(); 
    }
}
ServerVisual.width = serverRadius*2;
ServerVisual.height = serverRadius*2;
ServerVisual.type = "Server";
//Workstation
class WorkstationVisual extends DrawableObject{
    constructor(x,y, identifier){
        super(x,y, identifier);
        this.connections.end.x = this.coordinates.x + workStationSize*2;
        this.task = null;
        this.type = "Workstation";
    }
    setConnection(drawableObject){
        this.connectedComponent = drawableObject;
    }
    acceptTask(task){
        this.task = task;
        this.isAvailable = false;
    }
    
    advanceTask(task){
        if(this.next.isAvailable){
            this.next.acceptTask(task);
        }
        this.task.setCoordinates(this.connections.end);
        this.task.makeVisible();
        this.task = null;
        this.isAvailable = true;

        if(this.connectedComponent != null)
            this.connectedComponent.advanceTask(task);
    }
    draw(){
        context.fillStyle = this.task == null? backgroundColor: this.task.color;
        context.beginPath();
        context.moveTo(this.coordinates.x + workStationSize + workStationSize * Math.cos(0), this.coordinates.y + workStationSize * Math.sin(0));
        for (var side = 0; side <= 6; side++) {
            context.lineTo(this.coordinates.x + workStationSize + workStationSize * Math.cos(side * 2 * Math.PI / 6), this.coordinates.y + workStationSize * Math.sin(side * 2 * Math.PI / 6));
        } 
        context.lineTo(this.coordinates.x + workStationSize*2, this.coordinates.y + 1);
        context.fill();
        context.stroke();
    }
}
WorkstationVisual.width = workStationSize*2;
WorkstationVisual.height = workStationSize*2;
WorkstationVisual.type = "Workstation";

//Disk
class DiskVisual extends DrawableObject{
    constructor(x,y, identifier){
        super(x,y,identifier);
        this.connections.start = {"x": x, "y": y};
        this.connections.end = {"x": x + diskRadius*2, "y": y};
        this.task = null;    
        this.type = "Disk";   
    }
    setConnection(drawableObject){
        this.connectedComponent = drawableObject;
    }
    acceptTask(task){
        this.task = task;
        this.isAvailable = false;
    }
    
    advanceTask(task){
        if(this.next.isAvailable){
            this.next.acceptTask(task);
        }
        this.task.setCoordinates(this.connections.end);
        this.task.makeVisible();
        this.task = null;
        this.isAvailable = true;

        if(this.connectedComponent != null)
            this.connectedComponent.advanceTask(task);
    }

    draw(){
        context.fillStyle = this.task == null? backgroundColor: this.task.color;
        context.draw
        
        context.beginPath();
        context.arc(this.coordinates.x + diskRadius, this.coordinates.y, diskRadius, 0, 2*Math.PI);   
        context.fill();
        context.stroke(); 
    }
}
DiskVisual.width = diskRadius*2;
DiskVisual.height = diskRadius*2;
DiskVisual.type = "Disk";

//Visual Anchors Are Used For Connections to Draw Path
class VisualAnchor extends DrawableObject{
    constructor(x,y){
        super(x,y, `Anchor(${x},${y})`);
        this.type = "Visual Anchor";
    }
}
VisualAnchor.type = "Visual Anchor";
class EntrancePoint extends VisualAnchor{
    constructor(x,y, identifier){
        super(x,y);
        this.identifier = identifier;
    }
}
//Exit Point Anchor
class ExitPoint extends VisualAnchor{
    constructor(x,y, identifier){
        super(x,y);
        this.identifier = identifier;
    }
}


//Parallel Connection 
class ParallelConnection extends VisualAnchor{
    constructor(){
        var xStart = arguments[0].connections.start.x - parallelSpacingHorizontal;
        var xEnd = arguments[0].connections.end.x + parallelSpacingHorizontal;
        var yTop = arguments[0].connections.start.y;
        var yBottom = arguments[arguments.length-1].connections.start.y;
        var yCenter = yTop + (yBottom - yTop)/2;
        super(xStart,yCenter);
        this.connections.end.x = xEnd;
        this.identifier = this.identifier + `_(${xEnd},${yCenter})`;
    }
    draw(){
        
    }
}

//Parallel Container
class ParallelContainer extends DrawableObject{
    constructor(xStart, yCenter, identifier, objectType, numberOfElements){
        super(xStart, yCenter, identifier);
        this.objectType = objectType;
        this.numberOfElements = numberOfElements;
        this.containedElements = [];
        this.objectIndices = {};
        this.demandedTasks = [];
        this.createParallelObjects();
        this.connectedQueue = null;
    }
    connectQueue(queue){
        this.connectedQueue = queue;
        for(var i = 0; i < this.containedElements.length; i++){
            this.containedElements[i].setConnection(this.connectedQueue);
        }
    }
    connectInteriorObjects(){
        for(var i = 0; i < this.containedElements.length - 1; i++){
            for(var j = 0; j < this.containedElements[i].length; j++){
                connectArrow(this.containedElements[i][j], this.containedElements[i+1][j]);
            }
        }
    }
    createParallelObjects(){
        var objectWidth = this.findWidth(this.objectType);
        var objectHeight = this.objectType.width;
        this.connections.end.x = this.coordinates.x + 2*parallelSpacingHorizontal + objectWidth;
        this.calculateWidth();
        this.placeAllObjects();
    }
    placeAllObjects(){
        var x = this.coordinates.x + parallelSpacingHorizontal;
        var y = this.coordinates.y;
        if(!Array.isArray(this.objectType)){
            this.placeObjects(x,y, this.objectType, this.containedElements);
        }
        else {
            for(var i = 0; i < this.objectType.length; i++){
                if(this.containedElements[i] === undefined){
                    this.containedElements.push([]);
                }
                this.placeObjects(x, y, this.objectType[i], this.containedElements[i]);
                x += this.objectType[i].width + horizontalSpacing;
            }
            
            for(var i = 0; i < this.numberOfElements; i++){
                for(var j = 1; j < this.objectType.length; j++){
                    this.containedElements[j-1][i].setNext(this.containedElements[j][i]);
                    if(this.containedElements[j-1][i].type == "Queue"){
                        this.containedElements[j][i].setConnection(this.containedElements[j-1][i]);                }
                }
            }
        }
    }
    placeObjects(x, y, object, resultArray){
        //if even offset y to center parallel components
        if(this.numberOfElements % 2 === 0){
            y -= parallelSpacingVertical/2;
        }
        //get first object y coordinate
        y -= (parallelSpacingVertical)*Math.floor( (this.numberOfElements - 1)/2 );
        for (var i = 0; i < this.numberOfElements; i++){
            resultArray.push(new object(x,y, `${this.identifier}|${i}|${object.type}`));
            y += parallelSpacingVertical;     
            this.objectIndices[resultArray[i].identifier] = resultArray[i];
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
    findWidth(){
        if (Array.isArray(this.objectType)){
            var width = 0;
            this.objectType.forEach(element => {
                width += element.width;
            });
            return width + (this.objectType.length - 1) * horizontalSpacing;
        }
        else return this.objectType.width;
    }
    draw(){
        if(Array.isArray(this.objectType)){
            this.connectInteriorObjects();
            drawParallelstart(...this.containedElements[0]);
            this.containedElements.forEach(type => {
                type.forEach(element => {
                    element.draw();
                });
            });
            drawParallelRight(...this.containedElements[this.containedElements.length-1]);
        }
        else{
            drawParallelConnection(...this.containedElements);
            this.containedElements.forEach(element => {
                element.draw();
            });
        }
    }
    acceptTask(task){
        var success = false;
        for(var i = 0; i < this.containedElements.length; i++){
            if(this.containedElements[i].isAvailable){
                this.containedElements[i].acceptTask(task);
                this.objectIndices[this.containedElements[i].identifier].task = task;
                success = true;
                i = this.containedElements.length;
            }
        }
        if (!success){
            this.demandedTasks.push(task);
        }
    }
    advanceTask(serverIdentifier){
        console.log(this.containedElements);
        var server = this.objectIndices[serverIdentifier];
        var task = server.task;
        //advance the task in the server
        
        server.advanceTask(task);
        task.coordinates.x = this.connections.end.x;
        task.coordinates.y = this.connections.end.y;
        
        //get next available item if in overflow
        if(this.demandedTasks.length > 0){
            server.acceptTask(this.demandedTasks.shift());
        }
    }
    setTask(task, element){
        

    }
}

class ParallelContainerArrow extends DrawableObject{
    constructor(xStart, yCenter, identifier, objectType, numberOfElements){
        super(xStart, yCenter, identifier);
        this.objectType = objectType;
        this.numberOfElements = numberOfElements;
        this.containedElements = [];
        this.createParallelObjects();
    }
    connectInteriorObjects(){
        for(var i = 0; i < this.containedElements.length - 1; i++){
            for(var j = 0; j < this.containedElements[i].length; j++){
                connectArrow(this.containedElements[i][j], this.containedElements[i+1][j]);
            }

        }
    }
    createParallelObjects(){
        var objectWidth = this.findWidth(this.objectType);
        var objectHeight = this.objectType.width;
        this.connections.end.x = this.coordinates.x + 2*parallelSpacingHorizontal + objectWidth;
        this.calculateWidth();
        this.placeAllObjects();
    }
    placeAllObjects(){
        var x = this.coordinates.x + parallelSpacingHorizontal;
        var y = this.coordinates.y;
        
        if(!Array.isArray(this.objectType)){
            this.placeObjects(x,y, this.objectType, this.containedElements);
        }
        else {
            for(var i = 0; i < this.objectType.length; i++){
                if(this.containedElements[i] === undefined){
                    this.containedElements.push([]);
                }
                this.placeObjects(x, y, this.objectType[i], this.containedElements[i]);
                x += this.objectType[i].width + horizontalSpacing;
            }
            this.objectType.forEach(element => {
                
            });
        }
    }
    placeObjects(x, y, object, resultArray){
        //if even offset y to center parallel components
        if(this.numberOfElements % 2 === 0){
            y -= parallelSpacingVertical/2;
        }
        //get first object y coordinate
        y -= (parallelSpacingVertical)*Math.floor( (this.numberOfElements - 1)/2 );
        for (var i = 0; i < this.numberOfElements; i++){
            resultArray.push(new object(x,y, `${this.identifier}|${object}_${i}`));
            y += parallelSpacingVertical;
        }
    }
    findWidth(){
        if (Array.isArray(this.objectType)){
            var width = 0;
            this.objectType.forEach(element => {
                width += element.width;
            });
            return width + (this.objectType.length - 1) * horizontalSpacing;
        }
        else return this.objectType.width;
    }
    draw(){
        if(Array.isArray(this.objectType)){
            this.connectInteriorObjects();
            drawParallelstart(...this.containedElements[0]);
            this.containedElements.forEach(type => {
                type.forEach(element => {
                    element.draw();
                });
            });
            drawParallelRight(...this.containedElements[this.containedElements.length-1]);
        }
        else{
            drawParallelConnection(...this.containedElements);
            this.containedElements.forEach(element => {
                element.draw();
            });
        }
    }
}

class OutputMerge extends DrawableObject{
    constructor(xStart, yCenter, identifier){
        super(xStart, yCenter, identifier);
        this.triangleSize = 25;
        
        this.connections.end.x = xStart + this.triangleSize;
        this.width = this.triangleSize;
    }
    draw(){
        var pointLeft = this.connections.start.x;
        var pointRight = this.connections.start.x + this.triangleSize;
        context.fillStyle = connectionColor;
        context.beginPath();
        context.moveTo(pointLeft, this.coordinates.y);
        context.lineTo(pointRight, this.coordinates.y + this.triangleSize);
        context.lineTo(pointRight, this.coordinates.y - this.triangleSize);
        context.fill();
    }
}

class InputMerge extends DrawableObject{
    constructor(xStart, yCenter, identifier){
        super(xStart, yCenter, identifier);
        this.triangleSize = 25; 
        this.connections.end.x = xStart + this.triangleSize;
        this.width = this.triangleSize;
    }
    draw(){
        var pointLeft = this.connections.start.x;
        var pointRight = this.connections.start.x + this.triangleSize;
        context.fillStyle = connectionColor;
        context.beginPath();
        context.moveTo(pointRight, this.coordinates.y);
        context.lineTo(pointLeft, this.coordinates.y + this.triangleSize);
        context.lineTo(pointLeft, this.coordinates.y - this.triangleSize);
        context.fill();
    }
}
class ModularParallelContainer extends DrawableObject{
    constructor(){}
}

var taskColorChoices = [
    "red", 
    "cyan",
    "brown",
    "green",
    "purple",
    "blue",
    "orange",
    "pink"
]
var colorIndex = 0;
function generateColor(){
    var colorChoice = taskColorChoices[colorIndex];
    colorIndex = (colorIndex + 1 % taskColorChoices.length);
    return colorChoice;

}
function createVisualTask(x,y, identifier){
    return new TaskVisual(x, y, identifier, generateColor());
}

