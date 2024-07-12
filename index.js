

var examplesequence = "EXAMPLESEQUENCE"
var searchOutput = {
    "textOutputFull": "",
    "textOutputNotFound": ""
}
//window.onbeforeunload = function() {
//    return ""
//  }

async function init(){
    try{
        data = await SET_getDefaultSettings()
    }
    catch(error){
        throw new Error(`Failed to get default settings:\n ${error.message}`)
    }
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
    
    libraryNames = await SER_getLibraryNames()
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
    selectNewLibrary()
    
    _editExampleText()
}

function _toggleLigtBox(){
    const box = document.getElementById('overlay')
    if (box.classList.contains("fazeIn")){
        box.classList.remove("fazeIn")
        box.classList.add("fazeOut") 
    }
    else{
        box.classList.remove("fazeOut")
        box.classList.add("fazeIn")
    }
}

async function indexRunScreening(){
    _toggleLigtBox()

    button = document.getElementById("startButton")
    var statusText = document.getElementById("statusSearch")
    statusText.classList.add("pulse")
    var statusInterval = setInterval(_statusSearchUppdate, 10);
    await new Promise(r => setTimeout(r, 100))
    try{
        searchOutput = await SER_runScreening(settings)
        searchOutput.notFound = _generateNotFound()
        
        _generateDownload(searchOutput.textOutputFull, settings["outputName"]+" Output", document.getElementById("fullDownload"))
    
        _generateDownload(searchOutput.notFound, settings["outputName"]+ " not found", document.getElementById("notFoundDownload"))
    }
    catch (error) {
        console.error(`Screening failed:\n`, error);
    }
    //setStatus("fileContent", searchOutput.textOutputFull.replace(/(?:\r\n|\r|\n)/g, '<br>'))
    
    _toggleLigtBox()
    _statusSearchUppdate()
    clearInterval(statusInterval)

    statusText.classList.remove("pulse")
    document.getElementById("outputTable").style.display = "table"
    document.getElementById("outputTable").classList.remove("statusFadeOut")
    document.getElementById("outputTable").classList.add("statusFadeIn")
}

function _generateNotFound(){
    var usedSynonyms = SER_getSynonymMap(settings.searchSymbols)
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
    text = text.replace("    ", "\t")
    var blob = new Blob([text], { type: 'text/tab-separated-values' })
    element.href = URL.createObjectURL(blob)
    element.download = name+".tsv"
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

function dowloadSettings(){
    element = document.getElementById("settingsDowload")
    _generateDownload(settingsToStr(), settings.outputName+" Settings", element)
}

async function selectNewLibrary(){
    const useSynonyms = document.getElementById("enableSynonyms")
    const libraryInfoContainer = document.getElementById("libraryInfoContainer")
    const libraryName = document.getElementById("libraries").value
    const customLibrarie = document.getElementById("User Upload")
    if (libraryName == "custom"){
        useSynonyms.disabled = "disabled"
        useSynonyms.checked = false
        customLibrarie.classList.remove("inactive")
        libraryInfoContainer.innerHTML = ""
        indexLibraryColumnChanges()
    }
    else{
        customLibrarie.classList.add("inactive")
        setStatus("symbolsFound", "Fetching library from server...")
        await new Promise(r => setTimeout(r, 10)) //wait for status animation to end
        try{
            const librarySettings = await SER_selectLibrary(libraryName)
            useSynonyms.disabled = ""
            settings.libraryName = libraryName
            await displayNewLibrary(libraryInfoContainer, librarySettings.libraryInfo, librarySettings.libraryLink)
            
            settingsSetIndexes(librarySettings.RNAColumn, librarySettings.symbolColumn, librarySettings.RankColumn)
        }
        catch(error){
            setStatus("symbolsFound", "Error failed to fetch library")
            throw error
        }

    }
    indexSymbolChanges()
}

async function displayNewLibrary(libraryInfoContainer, libraryInfo, libraryLink){
    var text = ""
    if (libraryInfo){
        text = text + `If you use this library, please cite: <p class="libraryInfo">${libraryInfo}</p>`
    }
    if (libraryLink){
        text = text + `<a href="${libraryLink}">Info</a>`
    }
    libraryInfoContainer.innerHTML = text
}


function indexSymbolChanges(){
    const partialMatches = document.getElementById("partialMatches").checked
    const enableSynonymsBox = document.getElementById("enableSynonyms")
    const enableSynonyms = partialMatches ? false : enableSynonymsBox.checked
    enableSynonymsBox.disabled = partialMatches ? "disabled" : ""
    const searchSymbols = document.getElementById("searchSymbols").value.trim().split("\n").filter(item => {return item.trim()}).map(symbol => symbol.toLowerCase())
    

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

async function indexUppdateCustomLibrary(){
    if (document.getElementById("libraries").value == "custom"){
        var fileInput = document.getElementById('customFile')
        var file = fileInput.files[0]
        if (file){
            var reader = new FileReader();
            reader.onload = function(e) {
                // Display file content
                SER_addCustomLibraryData(reader.result, settings.symbolColumn)
            }
            reader.readAsText(file)
            await new Promise(r => setTimeout(r, 10))

        }
        else{
            SER_addCustomLibraryData("", -1)
        }
    }
    console.log(library.libraryMap)
    statusUppdateSymbols()
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
    const synonymMap = SER_getSynonymMap(settings.searchSymbols)
    
    const notFound = document.getElementById("displayNotFound")
    const synonymsUsed = document.getElementById("displaySynonyms")

    synonymsUsed.textContent = ""
    notFound.textContent = ""
    if (Object.keys(synonymMap).length == 0){
        notFound.textContent = "All symbols found in file"
    }
    var notUsedText = ""
    var synonymsUsedText = ""
    var numSynonyms = 0
    var numNotFound = 0
    Object.keys(synonymMap).forEach(symbol => {
        if (settings.enableSynonyms && (synonymMap[symbol].length != 0)){
            synonymsUsedText = synonymsUsedText + `${symbol}→ synonym ${synonymMap[symbol]}\n`
            numSynonyms++
        }
        else{
            notUsedText = notUsedText +`${symbol}\n`
            numNotFound++
        }
    })
    synonymsUsed.value = synonymsUsedText
    notFound.value = notUsedText

    settings.enableSynonyms ? setStatus("statusNumSynonyms", `(used: ${numSynonyms})`) : setStatus("statusNumSynonyms", ``)
    settings.partialMatches ? setStatus("statusSearchSymbolsRows", `Symbols searched: ${settings.searchSymbols.length}`) : setStatus("statusSearchSymbolsRows", `Symbols found in library: ${settings.searchSymbols.length-numNotFound} of ${settings.searchSymbols.length}`)
    
}

/* ------------------ STATUS ----------------- */

function statusUppdateSymbols(){
    _createSynonymDropworns()
    setStatus("symbolsFound", SER_getLibraryUniqueSymbols())
    setStatus("searchSymbols", settings.searchSymbols.join("\n"), false)
    setStatus("statusSearchSymbolsRows", "Rows found: " + String(settings.searchSymbols.length))
    setStatus("fileContent", "")

    document.getElementById("enableSynonyms").checked = settings.enableSynonyms
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

function _statusSearchUppdate(){
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