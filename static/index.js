var examplesequence = "EXAMPLESEQUENCE"

//window.onbeforeunload = function() {
//    return ""
//  }

function htmlSetdefaultValues(){
    fetch("./defaultSettings.json")
    .then((res) => {
        if (!res.ok) {
            throw new Error
                (`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    })
    .then((data) => 
            console.log(data))
    .catch((error) => 
            console.error("Unable to fetch data:", error));


    var e = document.getElementById("trimBefore").min = 0
    e.value = 0
    e = document.getElementById("trimAfter").min = 0
    e.value = 0
    e = document.getElementById("numberToRank").value
    e.value = 0

    document.getElementById("adaptorBefore").defaultValue = "";
    document.getElementById("adaptorAfter").defaultValue = " ";
    htmlSettingsChange()

    dropdown = document.getElementById("libraries")
    for (var i = 0; i < libraries.length; i++){
        var option = document.createElement('option')
        option.text = libraries[i].name
        option.value = i
        dropdown.appendChild(option)
    }
    statusUppdateAll()
}


function htmlStartScreening(){
    var st = performance.now()

    var statusInterval = setInterval(statusSearchUppdate, 100);
    
    htmlSettingsChange()
    var textOutput = libraryStartScreen(settings)
    
    statusSearchUppdate()

    var element = document.getElementById("FullDownload")
    _generateDownload(textOutput, settings["outputName"][0], element)
    document.getElementById("fileContent").innerHTML = textOutput.replace(/(?:\r\n|\r|\n)/g, '<br>')

    console.log((performance.now()-st)/1000)
    clearInterval(statusInterval)
}

function _generateDownload(text, name, element) {
    var file = new Blob([text], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = name;
    //a.click()
}


async function htmlChangeLibrary(fileIndex){
    var customLibrarie = document.getElementById("User Upload")
    if (fileIndex == "custom"){
        customLibrarie.classList.remove("inactive")
    }
    else{
        customLibrarie.classList.add("inactive")
        libraryCreateFromServer(fileIndex, settings)
    }
    await new Promise(r => setTimeout(r, 500)) //server must have time to respond before status can be uppdated
    statusUppdateAll()
}


document.getElementById('customFile').addEventListener('change', async function () {
    let fr = new FileReader();
    fr.onload = async function () {
        var symbolColumn = document.getElementById("GeneSymbolIndex").value
        var RNAcolumn = document.getElementById("gRNAIndex").value
        var RankColumn = document.getElementById("rankingIndex").value

        libraryAddCustom(fr.result, RNAcolumn, symbolColumn, RankColumn)
        await new Promise(r => setTimeout(r, 500)) //server must have time to respond before status can be uppdated
        statusUppdateAll()
    }

    fr.readAsText(this.files[0]);
})

function dowloadSettings(){
    var element = document.getElementById("SettingsDowload")

    var text = ""
    for (const setting in settings){
        text = text + ` ${setting} = ${settings[setting][0]}\n`
    }

    
    _generateDownload(text, `${settings["outputName"][0]} Settings`, element)
}

function htmlSettingsChange(){
    var trimBefore = document.getElementById("trimBefore").value
    var trimAfter = document.getElementById("trimAfter").value
    var adaptorBefore = document.getElementById("adaptorBefore").value.trim()
    var adaptorAfter = document.getElementById("adaptorAfter").value.trim()

    var searchSymbols = document.getElementById("searchSymbols").value.trim().split("\n").filter(item => {return item.trim()}).map(item =>{return item.replace("!not found in file", "").trim()})

    var partialMatches = document.getElementById("partialMatches").checked
    
    var rankingTop = document.getElementById("numberToRank").value
    var rankgingOrder = document.getElementById("rankingOrder").value
    
    var outputName = document.getElementById("outputFileName").value

    settingsSetOptions(parseInt(trimBefore), parseInt(trimAfter), adaptorBefore, adaptorAfter, partialMatches, searchSymbols, rankingTop, rankgingOrder, outputName)
    
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

    settingsSetIndexes(gRNAIndex-1, symbolIndex-1, rankingIndex-1)
}

function createSynonymDropworns(){
    const synonymdict = librarySynonymStatus(settings)

    const dropdownBody = document.getElementById("dropdownBody")
    dropdownBody.innerHTML = ""
    if(Object.keys(synonymdict).length == 0){
        const row = document.createElement("tr")
        row.textContent = "All symbols found in library"
        dropdownBody.appendChild(row)
        return
    }
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
        dropdownBody.insertBefore(row, dropdownBody.firstChild);
    }
}

/* ------------------ STATUS ----------------- */

function statusUppdateAll(){
    settingsStatusUppdate()
    statusDisplayAll()
}

function statusDisplayAll(){

    createSynonymDropworns()
    setStatus("searchSymbols", settings.searchSymbols[0].join("\n"), false)
    setStatus("statusSearchSymbolsRows", statusSearchSymbols())
    setStatus("statusFileSymbolIndex", settings.symbolIndex[1])
    setStatus("statusFilegRNAIndex", settings.gRNAIndex[1])
    setStatus("statusRankingIndex", settings.rankingIndex[1])

    setStatus("statusSequencesFound", settings.entries[1])

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