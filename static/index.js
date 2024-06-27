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
    
    

    dropdown = document.getElementById("libraries")

    data.libraryNames.forEach(name => {
        var option = document.createElement('option')
        option.text = name
        option.value = name
        dropdown.appendChild(option)
        dropdown.value = name
    })
    const rankingOrder = document.getElementById("rankingOrder").vaklue
    settingsSetAll(data.searchSymbols, data.partialMatches, dropdown.value, data.trimBefore, data.trimAfter, data.adaptorBefore, data.adaptorAfter, data.rankingTop, rankingOrder, data.outputName, data.gRNAIndex, data.symbolIndex, data.rankingIndex, data.synonyms)
    indexChangeLibrary(dropdown.value)
    _editExampleText()
    statusUppdateAll()
}


function indexStartScreening(){
    button = document.getElementById("startButton")
    button.classList.add("pulse")
    var statusInterval = setInterval(statusSearchUppdate, 100);
    
    var textOutput = libraryStartScreen(settings)
    
    var element = document.getElementById("FullDownload")
    _generateDownload(textOutput, settings["outputName"][0], element)
    
    document.getElementById("fileContent").innerHTML = textOutput.replace(/(?:\r\n|\r|\n)/g, '<br>')
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
    //libraryAddCustom(fr.result, RNAcolumn, symbolColumn, RankColumn)
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
    const searchSymbols = document.getElementById("searchSymbols").value.trim().split("\n").filter(item => {return item.trim()})
    const partialMatches = document.getElementById("partialMatches").checked
    settingsSetLibrary(searchSymbols, partialMatches, libraryName)
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
    const synonymdict = libraryStatusSynonyms(settings)

    const dropdownBody = document.getElementById("dropdownBody")
    dropdownBody.innerHTML = ""
    
    if(Object.keys(synonymdict).length == 0){
        const row = document.createElement("tr")
        row.textContent = "All symbols found in library"
        dropdownBody.appendChild(row)
        return
    }
    title.classList.add("pulse")
    
    for (const key in synonymdict) {
        const row = document.createElement("tr")

        // Create the key cell
        const keyCell = document.createElement("td")
        keyCell.textContent = key
        row.appendChild(keyCell)

        if (synonymdict[key].length == 0){ //symbol has no synonyms
            dropdownBody.appendChild(row)
            continue
        }
        // Create the dropdown cell
        const dropdownCell = document.createElement("td")
        const select = document.createElement("select")
        select.classList.add("synonymSelect")
        if (synonymdict[key].length == 1){
            select.classList.add("oneSynonyme")
        }
        synonymdict[key].forEach(optionText => {
            const option = document.createElement("option")
            option.value = optionText
            option.textContent = optionText
            select.appendChild(option)
        })
        dropdownCell.appendChild(select)
        row.appendChild(dropdownCell)
        
        // Create the button cell
        const buttonCell = document.createElement("td")
        const button = document.createElement("button")
        button.classList.add("swapButton")
        button.textContent = "⇆"                         //text on button
        button.title = "Press to use this synonym"
        button.addEventListener("click", () => {
            settingsSwapSymbol(key, select.value)
            statusUppdateAll()
        })
        buttonCell.appendChild(button)
        row.appendChild(buttonCell)
        dropdownBody.insertBefore(row, dropdownBody.firstChild)
    }
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
    console.log("uppdate search status")
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