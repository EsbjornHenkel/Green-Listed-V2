var examplesequence = "EXAMPLESEQUENCE"

function htmlSetdefaultValues(){
    var e = document.getElementById("trimBefore").min = 0
    e.value = 0
    e = document.getElementById("trimAfter").min = 0
    e.value = 0
    e = document.getElementById("numberToRank").value
    e.value = 0

    document.getElementById("adaptorBefore").defaultValue = "";
    document.getElementById("adaptorAfter").defaultValue = " ";
    htmlSettingsChange()
    statusUppdateAll()
    
}


function htmlStartScreening(){
    htmlSettingsChange()
    var textOutput = libraryStartScreen(settings)
    document.getElementById("fileContent").innerHTML = textOutput.replace(/(?:\r\n|\r|\n)/g, '<br>')
}

function htmlChangeLibrary(fileName){
    var customLibrarie = document.getElementById("User Upload")
    if (fileName == "custom"){
        customLibrarie.classList.remove("inactive")
        settingsReset()
        htmlSettingsChange()
    }
    else{
        customLibrarie.classList.add("inactive")
        libraryCreateFromServer(fileName, settings)
        htmlSettingsChange()
    }
    settingsStatusUppdate()
    statusUppdateAll()
}


document.getElementById('customFile').addEventListener('change', function () {
    let fr = new FileReader();
    fr.onload = function () {
        libraryAddCustom(fr.result)
        statusUppdateAll()
    }

    fr.readAsText(this.files[0]);
})

function htmlSettingsChange(){
    console.log("IN")
    var trimBefore = document.getElementById("trimBefore").value
    var trimAfter = document.getElementById("trimAfter").value
    var adaptorBefore = document.getElementById("adaptorBefore").value.trim()
    var adaptorAfter = document.getElementById("adaptorAfter").value.trim()

    var searchSymbols = document.getElementById("searchSymbols").value.trim().split("\n").filter(item => {return item.trim()}).map(item =>{return item.trim()})

    var partialMatches = document.getElementById("partialMatches").checked

    var rankingTop = document.getElementById("numberToRank").value
    
    settingsSetOptions(parseInt(trimBefore), parseInt(trimAfter), adaptorBefore, adaptorAfter, partialMatches, searchSymbols, rankingTop)

    _EditAuxiliaryExampleText()
    statusUppdateAll()
}

function _EditAuxiliaryExampleText(){
    var example = examplesequence
    
    if (settings.adaptorAfter[0].lenth == 0){
        adaptorAfter = ""
    }
    if (settings.adaptorBefore[0].lenth == 0){
        adaptorBefore = ""
    }
    example = example.slice(settings.trimBefore[0])
    
    if (settings.trimAfter[0] != 0){
        example = example.slice(0, -settings.trimAfter[0])
    }
    

    example = settings.adaptorBefore[0] + example + settings.adaptorAfter[0]
    document.getElementById("ExampleSequance").innerHTML = example
}

function indexSetLibrarySettings(){
    var symbolIndex = document.getElementById("GeneSymbolIndex").value
    var gRNAIndex = document.getElementById("gRNAIndex").value
    var rankingIndex = document.getElementById("rankingIndex").value

    settingsSetLibrarySettings(gRNAIndex, symbolIndex, rankingIndex)
}


/* ------------------ STATUS ----------------- */

//var intervalId = setInterval(statusUppdateAll, 1000);

function statusUppdateAll(){
    settingsStatusUppdate()
    statusDisplayAll()
}

function statusDisplayAll(){

    setStatus("statusSearchSymbols", settings.searchSymbols[1])
    setStatus("statusSearchSymbolsRows", statusSearchSymbols())
    setStatus("statusFileSymbolIndex", settings.symbolIndex[1])
    setStatus("statusFilegRNAIndex", settings.gRNAIndex[1])
    setStatus("statusRankingIndex", settings.rankingIndex[1])
}

function setStatus(elemId, text){
    const element = document.getElementById(elemId)
    if (!element) {
        console.error(`Index.js: setStatus() Element with id '${elemId}' does not exist`);
        return;
    }
    if (element.textContent == text){
        return
    }
    element.classList.add("fadeOut"); // Add class to fade out the old text

    element.addEventListener("animationend", function() {    // Listen for the "transitionend" event
        element.innerHTML = text;
        element.classList.remove("fadeOut"); // Remove class to fade in the new text
        element.classList.add("fadeIn"); // Add class to fade in the new text
    }, { once: true }); // Ensure the event listener is called only once

    if (text.includes("Failed") || text.includes("Error")) {
        element.style.color = "red";
    } else {
        element.style.color = "";  
    }
    
}