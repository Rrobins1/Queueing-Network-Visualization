var body = document.body;
var selectedModel = getCookie("selectedModel");
var inputs = {};
var maxDisks = 9;
/////////////////////////////////////////////////////////////////////////
//CLASSES
////////////////////////////////////////////////////////////////////////

//Field Classes
class InputField{
    constructor(type, identifier, name, description, value){
        this.identifier = identifier;
        this.type = type;
        this.description = description;
        this.value = value;
        this.name = name;
    }
    generateHTML(){}
}
class TextField extends InputField{
    constructor(identifier, name, description){
        super("text", identifier, name, description, '');
    }
    generateHTML(){
        var label = `<label for="${this.identifier}" class="configuration-label">${this.description}</label>`;
        var input = `<input type="${this.type}" id="${this.identifier}" name="${this.name}" value="${this.value}" class="configuration-text-input">`;
        return label+input;
    }
}
class RadioButton extends InputField{
    constructor(identifier, name, description, value){
        super("radio", identifier, name, description, value);
    }
    generateHTML(){
        var label = `<label for="${this.identifier}" class="configuration-label">${this.description}</label>`;
        var input = `<input type="${this.type}" id="${this.identifier}" name="${this.name} class="configuration-radio" value="${this.value}">`;
        return label + input;
    }
}
class Button extends InputField{
    constructor(identifier, description){
        super("button", identifier, name, description, null);
    }
    generateHTML(){
        var button = `<button id="${this.identifier}" class="configuration-selection-button">${this.description}</button>`;
        return button;
    }
}

//Section for a Single Component
class ConfigurationSection{
    constructor(identifier, fields, listenerFunction = null){
        this.identifier = identifier
        this.fields = fields;
        this.listenerFunction = listenerFunction;
    }
    //calls the listener function this must be done after the initial section creations
    callListener(){
        //Object.prototype.toString.call(listenerFunction) == `[object Function]`
        if(this.listenerFunction !== null){
            var outputFields = this.listenerFunction(this.identifier);
            if(typeof outputFields == "object"){
                this.fields = {...this.fields, ...outputFields};
            }
        }
    }
    generateHTML(location){
        this.fields.forEach(field => {
            location.innerHTML += field.generateHTML();
        });
        location.innerHTML += '<br>';
    }
}

//Model Configurations
class ModelConfiguration{
    constructor(identifier){
        this.identifier = identifier;
        this.sections = [];
    }

    callListeners(){
        for(var i = 0; i < this.sections.length; i++){
            this.sections[i].callListener();
        }
    }
    addSection(section){
        this.sections.push(section);
    }
    addSectionArray(sectionArray){
        for(var i = 0; i < sectionArray.length; i++){
            this.sections.push(sectionArray[i]);
        }
    }
    addResponsiveSection(responsiveSection){
        this.responsiveSections.push(responsiveSection);
    }

    writeContent(){
        this.sections.forEach(section => {
            this.location.innerHTML += section.generateHTML;      
        });
    }
}

class SingleServerConfiguration extends ModelConfiguration{
    constructor(){
        super("single-server");
        addTitle("Single Server");
        this.addSection(createArrivalConfiguration("arrival", "Interarrival:"));
        this.addSection(createServerConfiguration("server", "Server:"));
        this.addSection(addEndButtons());
        this.callListeners();
    }
}
class TwoServersConfiguration extends ModelConfiguration{
    constructor(){
        super("two-servers");
        addTitle("Two Servers");
        this.addSection(createArrivalConfiguration("arrival", "Interarrival Rate"));
        this.addSection(createServerConfiguration("server-1", "Server 1 Distribution"));
        this.addSection(createServerConfiguration("server-2", "Server 2 Distribution"));
        this.addSection(addEndButtons());
        this.callListeners();
    }
}
class SingleFeedbackConfiguration extends ModelConfiguration{
    constructor(){
        super("single-server-feedback");
        addTitle("Single Server with Feedback");
        this.addSection(createArrivalConfiguration("arrival", "Interarrival Rate"));
        this.addSection(createServerConfiguration("server", "Server Distribution"));
        this.addSection(createFeedbackConfiguration("feedback", "Feedback"));
        this.addSection(addEndButtons());
        this.callListeners();
    }
}
class WorkstationConfiguration extends ModelConfiguration{
    constructor(){
        super("workstations");
        addTitle("Interactive Workstations");
        //this.addSection(createWorkstationServerCount());
        //this.addSection(createWorkstationCount());
        this.addSection(createWorkstationSelections());
        this.addSection(createServerConfiguration("workstation", "Workstation Distribution"));
        this.addSection(createServerConfiguration("processor", "Processor Distribution"));
        //this.addResponsiveSection(addButtonListeners("workstation"));
        //this.addResponsiveSection(addButtonListeners("processor"));
        this.addSection(addEndButtons());
        this.callListeners();
    }
}
class CentralServerConfiguration extends ModelConfiguration{
    constructor(){
        super("central-server");
        addTitle("Central Server");
        this.addSection(createCentralCountInputs());
        this.addSection(createServerConfiguration("cpu", "CPU Distribution"));
        this.addSection(createServerConfiguration("channel", "Channel Distribution"));
        createParallelDiskInput(maxDisks);
        clearDiskInputs();
        this.addSection(addEndButtons());
        this.callListeners();
    }
}
/*
function getCookie(key){
    var cookieValue = document.cookie;
    cookieValue = cookieValue.split(`;`);
    console.log(cookieValue);
    cookieValue = cookieValue.find(row => row.startsWith(key));
    
    cookieValue = cookieValue.split(`=`)[1];
    
    return cookieValue;
}
*/
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
function writeHTML(inputs, location){
    location.innerHTML = "";
    for(var key in inputs){
        location.innerHTML += inputs[key].generateHTML();
   }
}
function updateInputs(identifier, value){
    inputs[identifier] = value;
}
///////////////////////////////////////////////////////////////////////////////////
//Functions to Add Components to Model Configurations
/////////////////////////////////////////////////////////////////////////////////
function createConfigurationGroup(identifier, location){
    location.innerHTML += `<div id="${identifier}" class="configuration-group"></div>`; 
    return document.getElementById(`${identifier}`);
}
function createSubDivision(identifier, location, className = "configuration-subdivision"){
    location.innerHTML += `<div id="${identifier}" class="${className}"></div>`; 
    return document.getElementById(`${identifier}`);
}
function createSectionTitle(identifier, title, destination){
    var section = createSubDivision(`${identifier}-title`, destination, "configuration-component-title");
    section.innerHTML = title;
    return section;
}
function addTitle(title){
    var titleBig = createSubDivision("title-big-sub", document.body, "configuration-title-big" );
    titleBig.innerHTML = title;
}
function createRadioButton(identifier, name, description, value){
    var label = `<label for="${identifier}">${description}</label>`;
    var input = `<input type="radio" id="${identifier}" name="${name}" value="${value}">`;
    return label+input;
}
function createtextField(identifier, name, description, value){
    var label = `<label for="${identifier}">${description}</label>`;
    var input = `<input type="text" id="${identifier}" name="${name}" value="${value} class="configuration-text-input">`;
    return label+input;
}
function addInputListener(identifier, passedFunction){
    var component = document.getElementById(identifier);
    component.oninput = function(){
        passedFunction(component);
    }
}
function updateInputs(component){
    inputs[component.id] = component.value;  
}
function addUpdateListener(identifier){
    var component = document.getElementById(identifier);
    component.oninput = function(){
        updateInputs(component);
    }
}
function updateNumber(component){
    if (validateNumber(component))
        updateInputs(component);
}

//Components With Distributions
function createServerConfiguration(identifier, title){
    var configurationGroup = createConfigurationGroup(identifier, document.body);
    createSectionTitle( identifier, title, configurationGroup);
    var buttons = createDistributionButtons(identifier, configurationGroup);
    var listener = createDistributionInputs;
    return new ConfigurationSection(identifier, buttons, listener);
}
function createArrivalConfiguration(identifier, title){
    var configurationGroup = createConfigurationGroup(identifier, document.body);
    createSectionTitle( identifier, title, configurationGroup);
    var arrivalOptions = createDistributionButtons(identifier, configurationGroup);
    return new ConfigurationSection(identifier, arrivalOptions, createDistributionInputs);
};

function createDistributionButtons(identifier, destination){   
    var distributionLocation = createSubDivision(`${identifier}-distribution`, destination, "distribution-group");
    var buttonLocation = createSubDivision(`${identifier}-distribution-buttons`,distributionLocation);
    var addedButtons = { 
        "constant": new RadioButton(`${identifier}-distribution-constant`, `${identifier}-distribution-buttons`, 'Constant', 'constant'),
        "uniform": new RadioButton(`${identifier}-distribution-uniform`, `${identifier}-distribution-buttons`, 'Uniform', 'uniform'),
        "exponential": new RadioButton(`${identifier}-distribution-exponential`, `${identifier}-distribution-buttons`, 'Exponential', 'exponential')
    }
    writeHTML(addedButtons, buttonLocation);
    var textInputLocation = createSubDivision(`${identifier}-distribution-input`, distributionLocation, "distribution-input");
    document.getElementById(`${identifier}-distribution-constant`).checked = true;
    return addedButtons;
}
function createDistributionInputs(identifier){
    var destination = document.getElementById(`${identifier}-distribution-input`);
    var textInputs = {
        "constant": {
            "value": new TextField(`${identifier}-constant-input`,`${identifier}-constant-input`, 'Value:') },
        "uniform": {
            "uniform-lower": new TextField(`${identifier}-uniform-lower`,`${identifier}-uniform-lower`, 'Lower:'),
            "uniform-upper": new TextField(`${identifier}-uniform-upper`,`${identifier}-uniform-upper`, 'Upper:')},
        "exponential": { 
            "value": new TextField(`${identifier}-exponential-input`,`${identifier}-exponential-input`, 'Average:')}
    };
    writeHTML(textInputs.constant, destination);
    if(inputs[`${identifier}-distribution-type`] == undefined){
        inputs[`${identifier}-distribution-type`] = 'constant';
        addInputListener(`${identifier}-constant-input`, updateNumber);
    }
    
    document.getElementById(`${identifier}-distribution-constant`).checked = true;

    document.getElementById(`${identifier}-distribution-constant`).onclick = function() {
        writeHTML(textInputs.constant, destination);
        addInputListener(`${identifier}-constant-input`, updateNumber);
        inputs[`${identifier}-distribution-type`] = 'constant';
        fillDistributionField(identifier, "constant");
    };
    document.getElementById(`${identifier}-distribution-uniform`).onclick = function() {
        writeHTML(textInputs.uniform, destination);
        addInputListener(`${identifier}-uniform-lower`, updateNumber);
        addInputListener(`${identifier}-uniform-upper`, updateNumber);
        inputs[`${identifier}-distribution-type`] = 'uniform';
        fillDistributionField(identifier, "uniform");
        
    };
    document.getElementById(`${identifier}-distribution-exponential`).onclick = function() {
        writeHTML(textInputs.exponential, destination)
        addInputListener(`${identifier}-exponential-input`, updateNumber);
        inputs[`${identifier}-distribution-type`] = 'exponential';
        fillDistributionField(identifier, "exponential");
    };
    return textInputs;
}
function fillDistributionField(identifier, distribution){
    //FILL IN FORM DATA
    switch(distribution){
        case "constant":
            var constantInput = document.getElementById(`${identifier}-constant-input`);
            if(inputs[constantInput.id] != undefined && inputs[constantInput.id] != null){
                constantInput.value = inputs[constantInput.id];
            } 
            break;
        case "uniform":
            var lower = document.getElementById(`${identifier}-uniform-lower`);
            var upper = document.getElementById(`${identifier}-uniform-upper`);
            if(inputs[lower.id] != undefined && inputs[lower.id] != null){
                 lower.value = inputs[lower.id];
            }
            if(inputs[upper.id] != undefined && inputs[upper.id] != null){
                upper.value = inputs[upper.id];
            }
            break;
        case "exponential":
            var exponentialInput = document.getElementById(`${identifier}-exponential-input`);
            if(inputs[exponentialInput.id] != undefined && inputs[exponentialInput.id] != null){
                exponentialInput.value = inputs[exponentialInput.id];
            }
            break; 
    }

}
function fillServerInput(identifier){
    var distribution = inputs[`${identifier}-distribution-type`];
    var checkedButton = document.getElementById(`${identifier}-distribution-${distribution}`);
    checkedButton.checked = true;
    var event = document.createEvent('HTMLEvents');
    event.initEvent('click', false, true);
    checkedButton.dispatchEvent(event);
    fillDistributionField(identifier, distribution);
}

//Single Server with Feedback Specific
function createFeedbackConfiguration(identifier, name){
    var configurationGroup = createConfigurationGroup(identifier, document.body);
    createSectionTitle(identifier, name, configurationGroup);
    var inputDivision = createSubDivision(`${identifier}-feedback-input`,configurationGroup, "feedback-input"); 
    var feedbackInput = {"feedbackInput" : new TextField(`${identifier}-return-rate`, `${identifier}-return-rate`, "Return Rate:")};
    writeHTML(feedbackInput, inputDivision);
    inputDivision.innerHTML += "\xa0\xa0%";
    return new ConfigurationSection(`${identifier}-return-rate`, feedbackInput, addUpdateListener);
}

//Interactive Workstations Specific
function createWorkstationSelections(){
    var configurationGroup = createConfigurationGroup("component-counts", document.body);
    createSectionTitle("component-counts", "Number of Items", configurationGroup);
    var inputDivision = createSubDivision(`componentCount-input`,configurationGroup, "feedback-input");
    
    var inputs = {
        "serverCount": new TextField("server-count", "server-count", "Servers[1,9]:"),
        "workstationCount": new TextField("workstation-count", "workstation-count", "\xa0Workstations[1,9]: ")
    };
    writeHTML(inputs, inputDivision);
    return new ConfigurationSection("componentCounts", inputs, countListener);
}

function createWorkstationServerCount(){
    var configurationGroup = createConfigurationGroup("server-count-group", document.body);
    createSectionTitle("server-count", "Server Count", configurationGroup);
    var inputDivision = createSubDivision(`server-count`,configurationGroup, "feedback-input");
    var serverCount = {"serverCount": new TextField("server-count", "server-count", "Quantity[1,9]:")};
    writeHTML(serverCount, inputDivision);
    return new ConfigurationSection("server-count", serverCount, serverCountListener);
}
function createWorkstationCount(){
    var configurationGroup = createConfigurationGroup("workstation-count-group", document.body);
    createSectionTitle("workstation-count", "Workstation Count", configurationGroup);
    var inputDivision = createSubDivision(`workstation-count`,configurationGroup, "feedback-input");
    var workstationCount = {"workstationCount": new TextField("workstation-count", "workstation-count", "Quantity[1,9]:")};
    writeHTML(workstationCount, inputDivision);
    return new ConfigurationSection("workstation-count", workstationCount, workstationCountListener);
}
function countListener(identifier){
    addInputListener("server-count", serverCountUpdate);
    addInputListener("workstation-count", workstationUpdate);
}
function serverCountListener(identifier){
    addInputListener(identifier, serverCountUpdate);
}

function workstationCountListener(identifier){
    addInputListener(identifier, workstationCountListener);
}
function serverCountUpdate(component){
    if(validateCountInput(component)){
        updateInputs(component);
    }
}
function workstationUpdate(component){
    if( validateCountInput(component) ){
        updateInputs(component);
    }
}

function validateCountInput(component){
    var result = component.value.replace(/\D|0/, '').substr(0, 1);
    if (result == component.value) return true;
    else{
        component.value = result;
        return false;
    }
}
function validateNumber(userInput){
    var value = userInput.value;
    if( isNumeric(value) ){
        return true;
    }
    else{
        if(value.length != 1)
            userInput.value = value.substr(0, value.length - 1);
        else
            userInput.value = "";
        return false;
    }
}
function isNumeric(numberToCheck){
    return !isNaN(numberToCheck - parseFloat(numberToCheck));
}
function validateWholeNumber(userInput){
    var result = userInput.value.replace(/^0|\D/, '');
    if (result == userInput.value) return true;
    else{
        userInput.value = result;
        return false;
    }
}

//Central Server Specific
function createCentralCountInputs(){
    var configurationGroup = createConfigurationGroup("component-counts", document.body);
    createSectionTitle("component-counts", "Number of Items", configurationGroup);
    var inputDivision = createSubDivision(`countInputs`,configurationGroup, "feedback-input");
    var inputs = {
        "disk-count": new TextField("disk-count", "disk-count", "Disks[1,9]:"),
        "job-count": new TextField("job-count", "job-count", "Jobs:")
    };
    writeHTML(inputs, inputDivision);
    return new ConfigurationSection("component-counts", inputs, centralCountListener);
}
function centralCountListener(identifier){
    addInputListener("job-count", jobUpdate);
    addInputListener("disk-count", diskUpdate);
}
function jobUpdate(component){
    if(validateWholeNumber(component))
        updateInputs(component);
}

function diskUpdate(component){
    if( validateCountInput(component) ){
        updateInputs(component);
        drawDisks(component);
        //createParallelDiskInput(component.value);
    }
}
function drawDisks(component){
    clearDiskInputs();
    for(var i = 0; i < component.value; i++){
        var identifier = `disk-${i+1}`;
        var configurationGroup = document.getElementById(identifier);
        createSectionTitle( identifier, `Disk ${i+1}`, configurationGroup);
        createDistributionButtons(identifier, configurationGroup);
        createDistributionInputs(identifier);
        fillServerInput(identifier);
    }
}
function clearDiskInputs(){
    for(var i = 0; i < maxDisks; i++){
        var section = document.getElementById(`disk-${i+1}`)
        if(section != null)
            section.innerHTML ='';
    }
}
function createParallelDiskInput(count){
    var diskIdentifiers = [];
    var diskSections = [];
    for(var i = 0; i < count; i++){
        var identifier = `disk-${i+1}`;
        diskSections.push(createServerConfiguration(identifier, `Disk ${i+1}`));
        diskIdentifiers.push(identifier);
        createDistributionInputs(identifier);
    }
    return diskSections;
}

//////////////////////////////////////////////////
function writeCookies(){
    document.cookie = "";
    for(var i = 0; keys = Object.keys(inputs), i < keys.length; i++){
        document.cookie = `${keys[i]}=${inputs[keys[i]]}`;
    }
}
function writeCookie(name, value){
    document.cookie += `${name}=${value};`;
}


function createConfiguration(){
    var configuration = undefined; 
    switch(selectedModel){
        case "singleServer":
            configuration = new SingleServerConfiguration();
            break;
        case "twoServers":
            configuration = new TwoServersConfiguration();
            break;
        case "singleFeedback":
            configuration = new SingleFeedbackConfiguration();
            break;
        case "workstations":
            configuration = new WorkstationConfiguration();
            break;
        case "centralServer":
            configuration = new CentralServerConfiguration();
            break;
    }
    return configuration;
}
function addEndButtons(){
    var buttons = {
        "select-button": new Button("select-button", "Select Model"),
        "run-button": new Button("run-button", "Run Model")
    } 
    body.innerHTML += buttons[`select-button`].generateHTML();
    body.innerHTML += buttons[`run-button`].generateHTML();
    return new ConfigurationSection("endButtons", buttons, endButtonListener); 
}

function endButtonListener(){
    var selectButton = document.getElementById("select-button");
    var runButton = document.getElementById("run-button");
    selectButton.onclick = function(){
        window.location.href = "../Pages/modelSelection.html";
    }
    runButton.onclick = function(){
        writeCookies();
        window.location.href = "../Pages/runTime.html";
    }
}
createConfiguration();
console.log(getCookie("selectedModel"));



