var examplesequence = "EXAMPLESEQUENCE"
var searchOutput = {
    "textOutputFull": "",
    "textOutputNotFound": ""
}
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


    var statusInterval = setInterval(statusSearchUppdate, 100);
    setStatus("statusSearch", "Runnung screening")

    var newSearchOutput = await runScreening(settings)
    
    searchOutput = newSearchOutput
    searchOutput.notFound = _generateNotFound()
    _generateDownload(searchOutput.textOutputFull, settings["outputName"], document.getElementById("fullDownload"))

    _generateDownload(searchOutput.notFound, settings["outputName"], document.getElementById("notFoundDownload"))


    setStatus("fileContent", searchOutput.textOutputFull.replace(/(?:\r\n|\r|\n)/g, '<br>'))

    setStatus("statusSearch", "Screening Complete")
    statusSearchUppdate()
    clearInterval(statusInterval)
    document.getElementById("outputTable").classList.remove("statusFadeOut")
    document.getElementById("outputTable").classList.add("statusFadeIn")
}

function _generateNotFound(){
    var usedSynonyms = getUsedSynonyms(settings.searchSymbols)
    if (Object.keys(usedSynonyms).length == 0){
        var out = "All symbols found in file"
        return out
    }
    var out = "Symbols not found\t"
    if (settings.enableSynonyms){
        out = out + "Used synonym"
    }
    out = out +"\n"
    Object.keys(usedSynonyms).forEach(symbol => {
        if (settings.enableSynonyms){
            out = out + `${symbol}\t${usedSynonyms[symbol]}\n`
        }
        else{
            out = out + `${symbol}\n`
        }
        
    })
    return out.replace(/(?:\r\n|\r|\n)/g, '\n')
}

function _generateDownload(text, name, element) {
    var file = new Blob([text], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = name;
    //a.click()
}

function showFullOutput(){
    setStatus("fileContent", searchOutput.textOutputFull.replace(/\n/g, "<br>"))
}

function showNotFound(){
    setStatus("fileContent", searchOutput.notFound.replace(/\n/g, "<br>"))
}

function showSettings(){
    setStatus("fileContent", settingsToStr().replace(/\n/g, "<br>"))
}

async function indexChangeLibrary(){
    selectedFile = ""
    var libraryName = document.getElementById("libraries").value
    var customLibrarie = document.getElementById("User Upload")
    if (libraryName == "custom"){
        customLibrarie.classList.remove("inactive")
        indexLibraryColumnChanges()
    }
    else{
        customLibrarie.classList.add("inactive")
        setStatus("symbolsFound", "fetching library from server")
        const librarySettings = await selectLibrary(libraryName)
        settings.libraryName = libraryName
        settingsSetIndexes(librarySettings.RNAColumn, librarySettings.symbolColumn, librarySettings.RankColumn)
    }
    indexLibraryChanges()
}

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
    indexUppdateCustomLibrary()
}

function indexUppdateCustomLibrary(){
    if (document.getElementById("libraries").value == "custom"){
        var fileInput = document.getElementById('customFile')
        var file = fileInput.files[0]
        if (file){
            var reader = new FileReader();
            reader.onload = function(e) {
                // Display file content
                addCustomLibraryData(reader.result, settings.symbolColumn)
            }
            reader.readAsText(file)
            
        }
    }
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
    statusUppdateSettings()
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
    setStatus("fileContent", "")

    document.getElementById("outputTable").classList.add("statusFadeOut")
}

function statusUppdateSettings(){
    document.getElementById("outputTable").classList.add("statusFadeOut")
    setStatus("fileContent", "")
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
    element.classList.add("statusFadeOut"); // Add class to fade out the old text

    element.addEventListener("animationend", function() {    // Listen for the "transitionend" event
        if (isNotInnerHtml){
            element.innerHTML = text;
        }
        else{
            element.value = text;
        }
        
        element.classList.remove("statusFadeOut"); // Remove class to fade in the new text
        element.classList.add("statusFadeIn"); // Add class to fade in the new text
    }, { once: true }); // Ensure the event listener is called only once

    if (text.includes("Failed") || text.includes("Error")) {
        element.style.color = "red";
    } else {
        element.style.color = "";  
    }
    
}