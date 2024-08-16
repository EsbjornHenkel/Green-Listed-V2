// 
// GRNA 2.0 - 2024
// 
// Javascript for the html page, contains UI logic
// Gets data from the grnaService & displays it
//

var outputTexts = {
    "textOutputFull": "",
    "textOutputNotFound": "",
    "textOutputAdapter": ""
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
    document.getElementById("numberToRank").defaultValue = ""


    document.getElementById("searchSymbols").textContent = data.searchSymbols.join("\n")
    document.getElementById("outputFileName").value = data.outputName
    document.getElementById("outputFileName").defaultValue = ""

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
    await new Promise(r => setTimeout(r, 100)) //waits for animation

    try {
        searchOutput = await SER_runScreening(settings)
        const fullOutput = _createFullTxtOutput(searchOutput.filteredLibraryMap, searchOutput.headers)
        const notFoundOutput = _createSymbolNotFound(searchOutput.usedSynonyms)
        const adapterOutput = _createAdapterOutput(searchOutput.filteredLibraryMap)
        const MAGeCKOutput = _createMAGeCKOutput(searchOutput.filteredLibraryMap)

        outputTexts = {
            "textOutputFull": fullOutput,
            "textOutputNotFound": notFoundOutput,
            "textOutputAdapter": adapterOutput,
            "textOutputMAGeCK": MAGeCKOutput
        }

        _createDownloadLink(adapterOutput, settings["outputName"] + " with Adapters", document.getElementById("adapterDownload"), "text/tab-separated-values", ".tsv")
        _createDownloadLink(fullOutput, settings["outputName"] + " Output", document.getElementById("fullDownload"), "text/tab-separated-values", ".tsv")
        _createDownloadLink(notFoundOutput, settings["outputName"] + " not found", document.getElementById("notFoundDownload"), "text/tab-separated-values", ".tsv")
        _createDownloadLink(MAGeCKOutput, settings["outputName"] + " MAGeCK", document.getElementById("MAGeCKDownload"), "text/csv", ".csv")
    }
    catch (error) {
        console.error(`Screening failed:\n`, error);
    }

    //setStatus("fileContent", searchOutput.textOutputFull.replace(/(?:\r\n|\r|\n)/g, '<br>'))

    _toggleLigtBox()
    _statusSearchUpdate()
    clearInterval(statusInterval)

    statusText.classList.remove("pulse")
    document.getElementById("outputTable").style.display = "flex"
    document.getElementById("outputTable").classList.remove("statusFadeOut")
    document.getElementById("outputTable").classList.add("statusFadeIn")
}

function _createAdapterOutput(libraryMap) {
    const date = new Date()
    var out = `Library: ${settings.libraryName}, Date: ${date.toLocaleString()}\n`
    var out = out + "Symbol\tSymbol_ID\tgRNA+adapter\n"

    for (var symbol of Object.keys(libraryMap)) {

        for (var i = 0; i < libraryMap[symbol].rows.length; i++) {
            const row = libraryMap[symbol].rows[i]
            out = out + `${symbol}\t${symbol}_${i}\t${_applyPostProcessing(row[settings.RNAColumn - 1])}\n`

        }
    }
    return out
}


function test() {

    const allSynonyms = _library.synonymMap
    const allSymbols = Object.keys(_library.libraryMap)
    var out = "NUMBER\tOLD\tNEW\n"
    var currentSymbols = []
    for (var i = 0; i < 150; i++) {
        const newSymbols = allSynonyms[allSymbols[i]]
        if (!allSynonyms.hasOwnProperty(allSymbols[i])) {
            continue
        }

        const newSynonym = newSymbols.values().next().value
        currentSymbols.push(newSynonym)
        _setStatus("searchSymbols", currentSymbols.join("\n"), false)

        var st = performance.now()
        var oldm = SER_getSynonymMapOLD(currentSymbols)
        const oldt = Math.round((performance.now() - st) / 1000 * 1000) / 1000

        var st = performance.now()
        var newm = SER_getSynonymMap(currentSymbols)
        const newt = Math.round((performance.now() - st) / 1000 * 1000) / 1000

        /*
        var same = true
        for (var j = 0; j < Object.keys(oldm).length; j++) {
            n = Object.keys(newm)[j]
            o = Object.keys(oldm)[j]
            if ((n != o) || (newm[n] != oldm[o])) {
                same = false
                console.log([n, newm[n], o, oldm[o]])
            }
        }*/
        console.log(currentSymbols.length)
        out = out + currentSymbols.length + "\t" + oldt + "\t" + newt + "\n"
        //console.log([same, i])

    }

    _createDownloadLink(out, "test data", document.getElementById("aa"), "text/tab-separated-values", ".tsv")


}


function _createMAGeCKOutput(libraryMap) {
    var out = ""
    for (var symbol of Object.keys(libraryMap)) {

        for (var i = 0; i < libraryMap[symbol].rows.length; i++) {
            const row = libraryMap[symbol].rows[i]
            out = out + `${symbol}_${i},${_applyTrim(row[settings.RNAColumn - 1])},${symbol}\n`

        }
    }
    return out
}

function _createFullTxtOutput(libraryMap, headers) {
    const date = new Date()
    var out = `Library: ${settings.libraryName}, Date: ${date.toLocaleString()}\n`
    var out = out + headers.join("\t") + "\n" //the original headers are placed att the top of the output
    for (var symbol of Object.keys(libraryMap)) {
        libraryMap[symbol].rows.forEach(row => {
            out = out + `${row.join("\t")}\n`
        })
    }
    return out
}

function _createSymbolNotFound(usedSynonyms) {
    var out = ""
    for (var symbol of Object.keys(usedSynonyms)) {
        if (settings.enableSynonyms && (usedSynonyms[symbol] != "")) {
            out = `${symbol}\t${usedSynonyms[symbol]}\n` + out
        }
        else {
            out = out + `${symbol}\t\n`
        }
    }
    out = "Symbol searched\t Symonym used\r\n" + out
    const date = new Date()
    var out = `Library: ${settings.libraryName}, Date: ${date.toLocaleString()}\n` + out
    return out
}

/*function _complimentSequence(gRNASequence) {
    var complimentMap = {
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
}*/


function _applyPostProcessing(text) {
    var newText = _applyTrim(text)
    newText = _applyAdapter(newText)
    return newText
}

function _applyTrim(text) {
    var newText = text.slice(settings.trimBefore)
    if (settings.trimAfter != 0) {
        newText = newText.slice(0, -settings.trimAfter)
    }
    return newText
}

function _applyAdapter(text) {
    if (settings.adapterAfter.lenth == 0) {
        adaptoerAfter = ""
    }
    if (settings.adapterBefore.lenth == 0) {
        adapterBefore = ""
    }
    text = settings.adapterBefore + text + settings.adapterAfter
    return text

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

function _createDownloadLink(text, name, element, filetype, fileEnding) {
    text = text.replace("    ", "\t")
    var blob = new Blob([text], { type: filetype })
    element.href = URL.createObjectURL(blob)
    element.download = name + fileEnding
}

function showAdapterOutput() {
    _setStatus("fileContent", outputTexts.textOutputAdapter.replace(/\n/g, "<br>"))
}

function showMAGeCKOutput() {
    _setStatus("fileContent", outputTexts.textOutputMAGeCK.replace(/\n/g, "<br>"))
}

function showFullOutput() {
    _setStatus("fileContent", outputTexts.textOutputFull.replace(/\n/g, "<br>"))
}

function showNotFoundOutput() {
    _setStatus("fileContent", outputTexts.textOutputNotFound.replace(/\n/g, "<br>"))
}

function showSettingsOutput() {
    _setStatus("fileContent", SET_settingsToStr().replace(/\n/g, "<br>"))
}

function dowloadSettingsOutput() {
    element = document.getElementById("settingsDowload")
    _createDownloadLink(SET_settingsToStr(), settings["outputName"] + " Settings", element, "text", ".txt")
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
    settings.libraryName = libraryName
    const customLibrarie = document.getElementById("User Upload")
    await _displayLibraryCitation("")

    if (libraryName == "custom") { //shows new input fields for custom library
        useSynonyms.disabled = "disabled"
        document.getElementById("enableDirectMatches").checked = true

        customLibrarie.classList.remove("inactive")
        changeLibraryColumn()
    }
    else { //uppdates library if it was not custom
        customLibrarie.classList.add("inactive")
        _setStatus("symbolsFound", "Fetching library from server...")
        await new Promise(r => setTimeout(r, 10)) //wait for status animation to end
        try {
            const librarySettings = await SER_selectLibrary(libraryName) //uppdates library
            useSynonyms.disabled = ""
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
    const RNAColumn = document.getElementById("gRNAIndex").value
    const rankingIndex = document.getElementById("rankingIndex").value

    SET_settingsSetIndexes(RNAColumn, symbolIndex, rankingIndex)
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
    const example = _applyPostProcessing("SEQUENCE")
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

            displayText = `${symbol} → ${synonymMap[symbol]}\n${displayText}`
            numSynonyms++
        }
        else {
            displayText = `${displayText}${symbol}\n`
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

    _setStatus("searchSymbols", Array.from(settings.searchSymbols).join("\n"), false)
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