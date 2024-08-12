// 
// GRNA 2.0 - 2024
// 
// Javascript for the html page, contains UI logic
// Gets data from the grnaService & displays it
//

var searchOutput = {
    "textOutputFull": "",
    "textOutputNotFound": ""
}

// Warn user if reload
//window.onbeforeunload = function() {
//    return ""
//  }

async function init() {
    try {
        data = await SER_getDefaultSettings()
    }
    catch (error) {
        throw new Error(`Failed to get default settings:\n ${error.message}`)
    }
    document.getElementById("trimBefore").min = 0
    document.getElementById("trimBefore").value = data.trimBefore

    document.getElementById("trimAfter").min = 0
    document.getElementById("trimAfter").value = data.trimAfter

    document.getElementById("adapterBefore").defaultValue = data.adaptorBefore;
    document.getElementById("adapterAfter").defaultValue = data.adaptorAfter;

    document.getElementById("numberToRank").value = data.rankingTop
    document.getElementById("searchSymbols").textContent = data.searchSymbols.join("\n")
    document.getElementById("outputFileName").value = data.outputName

    document.getElementById("partialMatches").checked = data.partialMatches
    document.getElementById("enableSynonyms").checked = data.enableSynonyms

    libraryNames = await SER_getLibraryNames()
    var dropdown = document.getElementById("libraries")
    libraryNames.forEach(name => {
        var option = document.createElement('option')
        option.text = name
        option.value = name
        dropdown.appendChild(option)
    })
    dropdown.value = data.defaultLibrary

    const rankingOrder = document.getElementById("rankingOrder").value

    // store the settings in an object
    SET_settingsSetAll(data.searchSymbols, data.partialMatches, data.trimBefore, data.trimAfter, data.adaptorBefore, data.adaptorAfter, data.rankingTop, rankingOrder, data.outputName, data.gRNAIndex, data.symbolIndex, data.rankingIndex, data.enableSynonyms)

    // load the library
    changeLibrary()

    // update example sequence
    _updateExampleText()
}


async function runScreening() {
    _toggleLigtBox()

    gtag('event', 'Run', { 'event_category': 'Processing' }); // Google Analytics

    button = document.getElementById("startButton")
    var statusText = document.getElementById("statusSearch")
    statusText.classList.add("pulse")
    var statusInterval = setInterval(_statusSearchUpdate, 10);
    await new Promise(r => setTimeout(r, 100))
    try {
        searchOutput = await SER_runScreening(settings)
        searchOutput.notFound = _outputNotFound()

        _createDownloadLink(searchOutput.textOutputFull, settings["outputName"] + " Output", document.getElementById("fullDownload"))

        _createDownloadLink(searchOutput.notFound, settings["outputName"] + " not found", document.getElementById("notFoundDownload"))
    }
    catch (error) {
        console.error(`Screening failed:\n`, error);
    }
    //setStatus("fileContent", searchOutput.textOutputFull.replace(/(?:\r\n|\r|\n)/g, '<br>'))

    _toggleLigtBox()
    _statusSearchUpdate()
    clearInterval(statusInterval)

    statusText.classList.remove("pulse")
    document.getElementById("outputTable").style.display = "table"
    document.getElementById("outputTable").classList.remove("statusFadeOut")
    document.getElementById("outputTable").classList.add("statusFadeIn")
}

// show/hide lightbox - used to cover screen when running search
function _toggleLigtBox() {
    const box = document.getElementById('overlay')
    if (box.classList.contains("fazeIn")) {
        box.classList.remove("fazeIn")
        box.classList.add("fazeOut")
    }
    else {
        box.classList.remove("fazeOut")
        box.classList.add("fazeIn")
    }
}

function _outputNotFound() {
    var usedSynonyms = SER_getSynonymMap(settings.searchSymbols)
    const date = new Date()
    var out = `Library: ${settings.libraryName}, Date: ${date.toLocaleString()}\n`
    if (Object.keys(usedSynonyms).length == 0) {
        out = out + "All symbols found in file"
        return out
    }
    var out = out + "Symbols not found\t"
    if (settings.enableSynonyms) {
        out = out + "Used synonym"
    }
    out = out + "\n"
    Object.keys(usedSynonyms).forEach(symbol => {
        if (settings.enableSynonyms) {
            out = out + `${symbol}\t${usedSynonyms[symbol]}\n`
        }
        else {
            out = out + `${symbol}\n`
        }

    })
    return out.replace(/(?:\r\n|\r|\n)/g, '\n')
}

function _createDownloadLink(text, name, element) {
    console.log(name)
    text = text.replace("    ", "\t")
    var blob = new Blob([text], { type: 'text/tab-separated-values' })
    element.href = URL.createObjectURL(blob)
    element.download = name + ".tsv"
}

function showFullOutput() {
    _setStatus("fileContent", searchOutput.textOutputFull.replace(/\n/g, "<br>"))
}

function showNotFoundOutput() {
    _setStatus("fileContent", searchOutput.notFound.replace(/\n/g, "<br>"))
}

function showSettingsOutput() {
    _setStatus("fileContent", SET_settingsToStr().replace(/\n/g, "<br>"))
}

function dowloadSettingsOutput() {
    element = document.getElementById("settingsDowload")
    _createDownloadLink(SET_settingsToStr(), settings.outputName + " Settings", element)
}


async function _displayLibraryCitation(libraryCitation) {
    const libraryInfoContainer = document.getElementById("libraryInfo")
    libraryInfoContainer.innerHTML = libraryCitation
}

async function changeLibrary() {
    //called when library changes through (droopdown under 1. Select library)
    //uppdates library to contin relevant information for the new library
    const useSynonyms = document.getElementById("enableSynonyms")

    const libraryName = document.getElementById("libraries").value
    const customLibrarie = document.getElementById("User Upload")

    if (libraryName == "custom") { //shows new input fields for custom library
        useSynonyms.disabled = "disabled"
        document.getElementById("enableDirectMatches").checked = true

        customLibrarie.classList.remove("inactive")
        await _displayLibraryCitation("")
        changeLibraryColumn()
    }
    else { //uppdates library if it was not custom
        customLibrarie.classList.add("inactive")
        _setStatus("symbolsFound", "Fetching library from server...")
        await new Promise(r => setTimeout(r, 10)) //wait for status animation to end
        try {
            const librarySettings = await SER_selectLibrary(libraryName) //uppdates library
            useSynonyms.disabled = ""
            settings.libraryName = libraryName
            await _displayLibraryCitation(SER_getLibraryCitation())

            SET_settingsSetIndexes(librarySettings.RNAColumn, librarySettings.symbolColumn, librarySettings.RankColumn)
        }
        catch (error) {
            _setStatus("symbolsFound", "Error failed to fetch library")
            throw error
        }

    }
    changeSymbols()
}

function changeSymbols() {
    const partialMatches = document.getElementById("partialMatches").checked
    const enableSynonyms = document.getElementById("enableSynonyms").checked

    //sets everything to lower case and clears any extra spaces 
    const searchSymbols = document.getElementById("searchSymbols").value.split("\n").filter(item => { return item.trim() }).map(symbol => symbol.trim().toLowerCase())

    SET_settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms)
    _statusUpdateSymbols()
}

function changeLibraryColumn() {
    //User input fields only called when adding a custom library
    const symbolIndex = document.getElementById("GeneSymbolIndex").value
    const gRNAIndex = document.getElementById("gRNAIndex").value
    const rankingIndex = document.getElementById("rankingIndex").value

    SET_settingsSetIndexes(gRNAIndex, symbolIndex, rankingIndex)
    updateCustomlibrary()
}

function changeSettings() {

    const trimBefore = document.getElementById("trimBefore").value

    const trimAfter = document.getElementById("trimAfter").value

    const adapterBefore = document.getElementById("adapterBefore").value
    const adapterAfter = document.getElementById("adapterAfter").value

    const rankingTop = document.getElementById("numberToRank").value
    const outputName = document.getElementById("outputFileName").value

    const rankingOrder = document.getElementById("rankingOrder").value

    const downloadName = document.getElementById("outputFileName").value

    SET_settingsSetSettings(trimBefore, trimAfter, adapterBefore, adapterAfter, rankingTop, rankingOrder, outputName, downloadName)
    _statusUpdateSettings()
}

function updateCustomlibrary() {
    const fileInput = document.getElementById('customFile')
    const file = fileInput.files[0]

    if (file) {
        const reader = new FileReader()

        reader.onload = function (e) {
            const content = e.target.result
            SER_selectCustomLibrary(content, settings)
            _statusUpdateSymbols()
            console.log("updateCustomlibrary() file")
        }

        reader.onerror = function (e) {
            console.error("Error reading file:", e)
        }

        reader.readAsText(file)
    } else {
        SER_selectCustomLibrary("", settings)
        console.log("updateCustomlibrary() no file")
    }

}



function _updateExampleText() {
    //Displays the text SEQUENCE modified by trim and adapter sequences
    var examplesequence = "SEQUENCE"
    var example = examplesequence
    if (settings.adapterAfter.lenth == 0) {
        adapterAfter = ""
    }
    if (settings.adapterAfter.lenth == 0) {
        adapterBefore = ""
    }
    example = example.slice(settings.trimBefore)

    if (settings.trimAfter != 0) {
        example = example.slice(0, -settings.trimAfter)
    }


    example = settings.adapterBefore + example + settings.adapterAfter
    document.getElementById("ExampleSequance").innerHTML = example
}

async function _displaySymbolsNotFound(synonymMap) {
    //Creates and displays everything under the Symbols not found sub title under 2. Input symbols in HTMl
    if (settings.partialMatches) {
        _setStatus("statusSearchSymbolsRows", ``)
        const synonymsUsed = document.getElementById("displaySynonyms")
        synonymsUsed.value = "Not available"
        return
    }

    const synonymsUsed = document.getElementById("displaySynonyms")

    if (Object.keys(synonymMap).length == 0) {
        displayText = "All symbols found in file"
    }
    var displayText = ""
    var numSynonyms = 0
    var numNotFound = 0
    Object.keys(synonymMap).forEach(symbol => {
        if (settings.enableSynonyms && (synonymMap[symbol].length != 0)) {

            displayText = `${symbol}→ synonym ${synonymMap[symbol]}\n${displayText}`
            numSynonyms++
        }
        else {
            displayText = `${displayText} ${symbol}\n`
            numNotFound++
        }
    })
    synonymsUsed.value = displayText

    settings.enableSynonyms ? _setStatus("statusNumSynonyms", `(used: ${numSynonyms})`) : _setStatus("statusNumSynonyms", ``)
    settings.partialMatches ? _setStatus("statusSearchSymbolsRows", ``) : _setStatus("statusSearchSymbolsRows", `Symbols found in library: ${settings.searchSymbols.length - numNotFound} of ${settings.searchSymbols.length}`)

}

/* ------------------ STATUS ----------------- */

function _statusUpdateSymbols() {
    gtag('event', 'Symbols', { 'event_category': 'Processing' }) // Google Analytics

    const synonymMap = SER_getSynonymMap(settings.searchSymbols)
    _displaySymbolsNotFound(synonymMap)

    const statusSymbols = SER_statusLibrarySymbols()
    _setStatus("symbolsFound", statusSymbols)

    _setStatus("searchSymbols", settings.searchSymbols.join("\n"), false)
    _setStatus("fileContent", "")

    document.getElementById("outputTable").classList.add("statusFadeOut")
}

function _statusUpdateSettings() {
    document.getElementById("outputTable").classList.add("statusFadeOut")
    _setStatus("fileContent", "")
    _updateExampleText()
}

function _statusSearchUpdate() {
    _setStatus("statusSearch", LIB_statusScreening())
}


function _setStatus(elemId, text, isNotInnerHtml) {
    //console.log(`_setStatus(${elemId},${text})`)

    if (isNotInnerHtml == undefined) {
        isNotInnerHtml = true
    }
    const element = document.getElementById(elemId)
    if (!element) {
        console.error(`Index.js: _setStatus() Element with id '${elemId}' does not exist`)
        return
    }
    if ((element.textContent == text) && isNotInnerHtml) {
        return
    }
    if ((element.value == text) && !isNotInnerHtml) {
        return
    }
    element.classList.add("statusFadeOut"); // Add class to fade out the old text

    element.addEventListener("animationend", function () {    // Listen for the "transitionend" event
        if (isNotInnerHtml) {
            element.innerHTML = text;
        }
        else {
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