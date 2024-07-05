var examplesequence = "EXAMPLESEQUENCE"
searchOutput = {}
//window.onbeforeunload = function() {
//    return ""
//  }

async function init(){
    data = await getDefaultSettings()
    document.getElementById("trimBefore").min = 0
    document.getElementById("trimBefore").value = data.trimBefore

    document.getElementById("trimAfter").min = 0
    document.getElementById("trimAfter").value = data.trimAfter

    document.getElementById("adaptorBefore").defaultValue = data.adaptorBefore;
    document.getElementById("adaptorAfter").defaultValue = data.adaptorAfter;

    document.getElementById("numberToRank").value = data.rankingTop
    document.getElementById("searchSymbols").textContent = data.searchSymbols.join("\n")
    document.getElementById("outputFileName").value = data.outputName

    document.getElementById("partialMatches").checked = data.partialMatches
    document.getElementById("enableSynonyms").checked = data.enableSynonyms
    
    libraryNames = await getLibraryNames()
    dropdown = document.getElementById("libraries")
    libraryNames.forEach(name => {
        var option = document.createElement('option')
        option.text = name
        option.value = name
        dropdown.appendChild(option)
        
    })
    dropdown.value = data.defaultLibrary


    const rankingOrder = document.getElementById("rankingOrder").value
    settingsSetAll(data.searchSymbols, data.partialMatches, data.trimBefore, data.trimAfter, data.adaptorBefore, data.adaptorAfter, data.rankingTop, rankingOrder, data.outputName, data.gRNAIndex, data.symbolIndex, data.rankingIndex, data.enableSynonyms)
    indexChangeLibrary(dropdown.value)
    
    _editExampleText()
}


async function indexStartScreening(){
    button = document.getElementById("startButton")
    button.classList.add("pulse")

    var statusInterval = setInterval(statusSearchUppdate, 100);
    
    var newSearchOutput = await runScreening(settings)
    searchOutput = newSearchOutput
    _generateDownload(searchOutput.textOutputFull, settings["outputName"][0], document.getElementById("fullDownload"))

    _generateDownload(searchOutput.notFound, settings["outputName"][0], document.getElementById("notFoundDownload"))
    document.getElementById("fileContent").innerHTML = searchOutput.textOutputFull.replace(/(?:\r\n|\r|\n)/g, '<br>')
    button.classList.remove("pulse")
    statusSearchUppdate()
    clearInterval(statusInterval)
}


function _generateDownload(text, name, element) {
    var file = new Blob([text], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = name;
    //a.click()
}

function showFullOutput(){
    if (searchOutput.full == ""){
        document.getElementById("fileContent").innerHTML = "No output"
        return
    }
    console.log(searchOutput)
    document.getElementById("fileContent").innerHTML = searchOutput.textOutputFull.replace(/\n/g, "<br>")
}

function showNotFound(){
    if (searchOutput.notFound == ""){
        document.getElementById("fileContent").innerHTML = "No output"
        return
    }
    document.getElementById("fileContent").innerHTML = searchOutput.notFound.replace(/\n/g, "<br>")
}

function showSettings(){
    document.getElementById("fileContent").innerHTML = settingsToStr().replace(/\n/g, "<br>")
}

async function indexChangeLibrary(libraryName){
    
    var customLibrarie = document.getElementById("User Upload")
    if (libraryName == "custom"){
        customLibrarie.classList.remove("inactive")
        let fr = new FileReader()
        addCustomLibraryData(fr.result, settings.symbolColumn)
        await new Promise(r => setTimeout(r, 500)) //server must have time to respond before status can be uppdated
    
        fr.readAsText(this.files[0])
        statusUppdateSymbols()
    }
    else{
        customLibrarie.classList.add("inactive")
        const librarySettings = await selectLibrary(libraryName)
        settings.libraryName = libraryName
        settingsSetIndexes(librarySettings.RNAColumn, librarySettings.symbolColumn, librarySettings.RankColumn)
    }
    indexLibraryChanges()
}

/*
document.getElementById('customFile').addEventListener('change', async function () {
    let fr = new FileReader()
    addCustomData(fr.result, settings.symbolColumn)
    await new Promise(r => setTimeout(r, 500)) //server must have time to respond before status can be uppdated

    fr.readAsText(this.files[0])
    statusUppdateSymbols()
})*/

function dowloadSettings(){
    element = document.getElementById("settingsDowload")
    _generateDownload(settingsToStr(), settings.outputName[0]+" Settings", element)
}

function indexLibraryChanges(){
    const enableSynonyms = document.getElementById("enableSynonyms").checked
    const searchSymbols = document.getElementById("searchSymbols").value.trim().split("\n").filter(item => {return item.trim()})
    const partialMatches = document.getElementById("partialMatches").checked

    settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms)
    statusUppdateSymbols()
}

function indexLibraryColumnChanges(){
    const symbolIndex = document.getElementById("GeneSymbolIndex").value
    const gRNAIndex = document.getElementById("gRNAIndex").value
    const rankingIndex = document.getElementById("rankingIndex").value

    settingsSetIndexes(gRNAIndex, symbolIndex, rankingIndex)
    let fr = new FileReader()
    addCustomLibraryData(fr.result, settings.symbolColumn)
}

function indexSettingsChanges(){
    const trimBefore = document.getElementById("trimBefore").value
    const trimAfter = document.getElementById("trimAfter").value
    const adaptorBefore = document.getElementById("adaptorBefore").value.trim()
    const adaptorAfter = document.getElementById("adaptorAfter").value.trim()

    const rankingTop = document.getElementById("numberToRank").value
    const rankgingOrder = document.getElementById("rankingOrder").value
    
    const outputName = document.getElementById("outputFileName").value

    settingsSetSettings(trimBefore, trimAfter, adaptorBefore, adaptorAfter, rankingTop, rankgingOrder, outputName)

    _editExampleText()
}

function _editExampleText(){
    var example = examplesequence
    
    if (settings.adaptorAfter.lenth == 0){
        adaptorAfter = ""
    }
    if (settings.adaptorBefore.lenth == 0){
        adaptorBefore = ""
    }
    example = example.slice(settings.trimBefore)
    
    if (settings.trimAfter != 0){
        example = example.slice(0, -settings.trimAfter)
    }
    

    example = settings.adaptorBefore + example + settings.adaptorAfter
    document.getElementById("ExampleSequance").innerHTML = example
}

async function _createSynonymDropworns(){
    var usedSynonyms = getUsedSynonyms(settings.searchSymbols)
    const title = document.getElementById("symbolsNotFound")

    const symbolsNotFound = document.getElementById("displaySynonyms")
    symbolsNotFound.innerHTML = ""
    if (Object.keys(usedSynonyms).length == 0){
        symbolsNotFound.textContent = "All symbols found in file"
    }
    Object.keys(usedSynonyms).forEach(symbol => {
        const symbolContainer = document.createElement("p")
        if (settings.enableSynonyms && (usedSynonyms[symbol].length != 0)){
            symbolContainer.innerHTML = `${symbol}<b style="font-size:1.25rem"> → </b>${usedSynonyms[symbol]}`
            symbolsNotFound.insertBefore(symbolContainer, symbolsNotFound.firstChild)
        }
        else{
            symbolContainer.textContent = `${symbol}`
            symbolsNotFound.appendChild(symbolContainer)
        }
    })
    title.classList.remove("pulse")
}

/* ------------------ STATUS ----------------- */

function statusUppdateSymbols(){
    _createSynonymDropworns()
    setStatus("symbolsFound", getLibraryUniqueSymbols())
    setStatus("searchSymbols", settings.searchSymbols.join("\n"), false)
    setStatus("statusSearchSymbolsRows", "Rows found: " + String(settings.searchSymbols.length))
}

function setColor(elemId, color){
    const element = document.getElementById(elemId)
    element.style.backgroundColor = color

}

function statusSearchUppdate(){
    setStatus("statusSearch", getSearchstatus())
}


function setStatus(elemId, text, isNotInnerHtml){
    if (isNotInnerHtml == undefined){
        isNotInnerHtml = true
    }
    const element = document.getElementById(elemId)
    if (!element) {
        console.error(`Index.js: setStatus() Element with id '${elemId}' does not exist`);
        return;
    }
    if ((element.textContent == text) && isNotInnerHtml){
        return
    }
    if ((element.value == text) && !isNotInnerHtml){
        return
    }
    element.classList.add("fadeOut"); // Add class to fade out the old text

    element.addEventListener("animationend", function() {    // Listen for the "transitionend" event
        if (isNotInnerHtml){
            element.innerHTML = text;
        }
        else{
            element.value = text;
        }
        
        element.classList.remove("fadeOut"); // Remove class to fade in the new text
        element.classList.add("fadeIn"); // Add class to fade in the new text
    }, { once: true }); // Ensure the event listener is called only once

    if (text.includes("Failed") || text.includes("Error")) {
        element.style.color = "red";
    } else {
        element.style.color = "";  
    }
    
}