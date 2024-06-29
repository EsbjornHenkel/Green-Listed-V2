var examplesequence = "EXAMPLESEQUENCE"

//window.onbeforeunload = function() {
//    return ""
//  }

async function htmlSetdefaultValues(){
    data = await getDefaultSettings()

    document.getElementById("trimBefore").min = 0
    document.getElementById("trimBefore").value = data.trimBefore

    document.getElementById("trimAfter").min = 0
    document.getElementById("trimAfter").value = data.trimAfter

    document.getElementById("adaptorBefore").defaultValue = data.adaptorBefore;
    document.getElementById("adaptorAfter").defaultValue = data.adaptorAfter;

    document.getElementById("numberToRank").value = data.rankingTop
    document.getElementById("searchSymbols").textContent = data.searchSymbols
    document.getElementById("outputFileName").value = data.outputName

    document.getElementById("partialMatches").checked = data.partialMatches
    document.getElementById("enableSynonyms").checked = data.enableSynonyms
    
    dropdown = document.getElementById("libraries")

    data.libraryNames.forEach(name => {
        var option = document.createElement('option')
        option.text = name
        option.value = name
        dropdown.appendChild(option)
        dropdown.value = name
    })
    const rankingOrder = document.getElementById("rankingOrder").vaklue
    settingsSetAll(data.searchSymbols, data.partialMatches, dropdown.value, data.trimBefore, data.trimAfter, data.adaptorBefore, data.adaptorAfter, data.rankingTop, rankingOrder, data.outputName, data.gRNAIndex, data.symbolIndex, data.rankingIndex, data.synonyms, data.enableSynonyms)
    indexChangeLibrary(dropdown.value)
    _editExampleText()
    statusUppdateAll()
}


function indexStartScreening(){
    button = document.getElementById("startButton")
    button.classList.add("pulse")
    const swapedSynonyms = Object.fromEntries(Object.entries(settings.usedSynonyms).map(([key, value]) => [value, key])) //swaps keys and values
    var statusInterval = setInterval(statusSearchUppdate, 100);
    
    var foundRows = libraryStartScreen(settings)
    
    const textOutput =_generateFullTxtOutput(foundRows, swapedSynonyms)
    _generateDownload(textOutput, settings["outputName"][0]+" full", document.getElementById("fullDownload"))
    
    
    _generateDownload(_generateDownloadSymboldNotFound(), settings["outputName"][0]+" not found", document.getElementById("notFoundDownload"))
    document.getElementById("fileContent").innerHTML = textOutput.replace(/(?:\r\n|\r|\n)/g, '<br>')
    button.classList.remove("pulse")
    statusSearchUppdate()
    clearInterval(statusInterval)
}


function _generateFullTxtOutput(rows, swapedSynonyms){
    out = "SymbolSearched SymbolUsed  gRNA    Compliment  Score \n"
    for (var [symbol, arr] of Object.entries(rows)) {
        var SymbolSearched = ""
        if (settings.enableSynonyms && swapedSynonyms.hasOwnProperty(symbol)){
            SymbolSearched = `${swapedSynonyms[symbol]}→`
            symbol = `${symbol} `
        }
        arr.forEach(element => {
            out = out + `${SymbolSearched}  ${symbol}   ${element[settings.gRNAIndex[0]]}    ${_complimentSequence(element[settings.gRNAIndex[0]])}    ${element[settings.rankingIndex[0]]}\n`
        })
      }
    return out.replace(/(?:\r\n|\r|\n)/g, '\n')
}

function _generateDownloadSymboldNotFound(){
    out = "Symbol\n"
    for (var symbol of Object.keys(settings.usedSynonyms)) {
        if (settings.enableSynonyms[0] && settings.usedSynonyms[symbol] != ""){
            continue
        }
        out = out + `${symbol}\n`
      }
    return out.replace(/(?:\r\n|\r|\n)/g, '\n')
}

function _complimentSequence(gRNASequence){
    var complimentMap ={
        "A": "T",
        "a": "t",
        "T": "A",
        "t": "a",
        "C": "G",
        "c": "g",
        "G": "C",
        "g": "c",
    }
    // Replace each character using the mapping table
    var complimentStr = gRNASequence.split('').map(char => {
        return complimentMap[char] !== undefined ? complimentMap[char] : char;
      }).join('')
      return complimentStr
}

function _generateDownload(text, name, element) {
    var file = new Blob([text], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = name;
    //a.click()
}


async function indexChangeLibrary(fileName){

    var customLibrarie = document.getElementById("User Upload")
    if (fileName == "custom"){
        customLibrarie.classList.remove("inactive")
    }
    else{
        customLibrarie.classList.add("inactive")
        data = await libraryGetLibraryData(fileName, settings)
    }
    await new Promise(r => setTimeout(r, 500)) //server must have time to respond before status can be uppdated
    indexLibraryChanges()
}


document.getElementById('customFile').addEventListener('change', async function () {
    let fr = new FileReader();
    libraryAddCustom(fr.result)
    await new Promise(r => setTimeout(r, 500)) //server must have time to respond before status can be uppdated

    fr.readAsText(this.files[0]);
    statusUppdateSymbols()
})

function dowloadSettings(){
    var element = document.getElementById("SettingsDowload")

    var text = ""
    for (const setting in settings){
        text = text + ` ${setting} = ${settings[setting][0]}\n`
    }
    _generateDownload(text, `${settings["outputName"][0]} Settings`, element)
}

function indexLibraryChanges(){
    const libraryName = document.getElementById("libraries").value
    const enableSynonyms = document.getElementById("enableSynonyms").checked
    const searchSymbols = document.getElementById("searchSymbols").value.trim().split("\n").filter(item => {return item.trim()})
    const partialMatches = document.getElementById("partialMatches").checked

    settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms, libraryName)
    statusUppdateSymbols()
}

function indexLibraryIndexChanges(){
    const symbolIndex = document.getElementById("GeneSymbolIndex").value
    const gRNAIndex = document.getElementById("gRNAIndex").value
    const rankingIndex = document.getElementById("rankingIndex").value

    settingsSetIndexes(gRNAIndex-1, symbolIndex-1, rankingIndex-1)
    statusUppdateNonSymbolSettings()
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
    statusUppdateNonSymbolSettings()

    _editExampleText()
    statusUppdateSymbols()
}

function _editExampleText(){
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

async function _createSynonymDropworns(){
    const title = document.getElementById("symbolsNotFound")

    const symbolsNotFound = document.getElementById("displaySynonyms")
    symbolsNotFound.innerHTML = ""
    if (Object.keys(settings.usedSynonyms).length == 0){
        symbolsNotFound.textContent = "All symbols found in file"
    }
    Object.keys(settings.usedSynonyms).forEach(symbol => {
        const symbolContainer = document.createElement("p")
        if (settings.enableSynonyms[0] && (settings.usedSynonyms[symbol].length != 0)){
            symbolContainer.innerHTML = `${symbol}<b style="font-size:1.25rem"> → </b>${settings.usedSynonyms[symbol]}`
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

function statusUppdateAll(){
    statusUppdateSymbols()
    statusUppdateNonSymbolSettings()
}

function statusUppdateSymbols(){
    _createSynonymDropworns()
    setStatus("statusSequencesFound", settings.LibraryName[1])

    setStatus("searchSymbols", settings.searchSymbols[0].join("\n"), false)
    setStatus("statusSearchSymbolsRows", settings["searchSymbols"][1])
}

function statusUppdateNonSymbolSettings(){
    setStatus("statusFileSymbolIndex", settings.symbolIndex[1])
    setStatus("statusFilegRNAIndex", settings.gRNAIndex[1])
    setStatus("statusRankingIndex", settings.rankingIndex[1])

    setColor("trimBefore", settings.trimBefore[1])
    setColor("trimAfter", settings.trimAfter[1])
    setColor("numberToRank", settings.rankingTop[1])
    setColor("outputFileName", settings.outputName[2])
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