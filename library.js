// 
// GRNA 2.0 - 2024
//
// Handles a library
// Used by the grnaService
//


// State holding the currently selected library
var _library = {
    /*
    libraryMap ={
        symbol1(in lower case) :[all rows containing symbol1 splitt by \t]
        symbol2: ...
    }
     */
    "libraryMap": {},
    "librarySymbolSet": new Set(), //a set containing all symbols in the library
    "libraryStatus": "",
    /*
    synonym map contain all symbols that have synonyms as keys and all ther synonyms as values
    synonymMap = {
        symbol1: [set of all synonyms to symbol1],
        symbol2: [set of all synonyms to symbol2]
    }
    */
    "synonymMap": {},

    /* string with tab-separetd column headers*/
    "headers": "",

    /* status of the last screening, for example "Done. Found 2345 symbols" */
    "statusSearch": "",

    /* string with html describing the library */
    "citationInfo": ""
}


function LIB_startScreening(settings) {
    if (Object.keys(_library.libraryMap).length == 0) {
        _library.statusSearch = "Error no library selected"
        throw new Error("No library selected")
    }
    _library.statusSearch = "Starting search"
    var synonyms = {}
    if (settings.enableSynonyms) {
        synonyms = _createMatchingSynonyms(settings.searchSymbols)
    }

    var st = performance.now()
    try {
        var searchOutput = SCR_startScreening(_library, settings, synonyms)
    }
    catch (e) {
        _library.statusSearch = "Error run failed"
        throw (e)
    }

    console.log(Math.round((performance.now() - st) / 100 * 100) / 1000)
    _library.statusSearch = `Done. Time to complete: ${Math.round((performance.now() - st) / 1000 * 10) / 10}s<br> Symbols found: ${Object.keys(searchOutput.filteredLibraryMap).length}`

    return searchOutput
}

function LIB_setLibraryCustomData(fileData, settings) {
    console.log(settings)
    console.log(fileData)
    LIB_setLibraryData(settings, fileData, "")
    //console.log("LIB_setLibraryCustomData()start scol=" + settings.symbolColumn)
}


function LIB_setLibraryData(librarySettings, fileData, citationInfo) {
    //uppdates synonymMap, citationInfo and libraryMap
    _library.citationInfo = citationInfo
    var libraryMap = _createLibraryMap(fileData, librarySettings.symbolColumn, librarySettings.RNAColumn, librarySettings.rankingColumn, _library.synonymMap)
    _library.librarySymbolSet = new Set(Object.keys(libraryMap)), //a set containing all symbols in the library
        _library.libraryMap = libraryMap
}

function LIB_changeSynonyms(synonymData) {
    _library.synonymMap = _createSynonymMap(synonymData)
}

function _createSynonymMap(synonymData) {
    //se top of file for explanation of synonym map datastructure
    rows = synonymData.trim().split("\n").map((row) => row.split("\t"))
    rows.shift()
    var synonymMap = {}
    rows.forEach(row => {
        const symbol1 = row[0].toLowerCase().trim()
        const symbol2 = row[1].toLowerCase().trim()

        if (symbol1 != "" && symbol2 != "") {

            if (!synonymMap[symbol1]) {
                synonymMap[symbol1] = new Set()
            }
            synonymMap[symbol1].add(symbol2)

            if (!synonymMap[symbol2]) {
                synonymMap[symbol2] = new Set()
            }
            synonymMap[symbol2].add(symbol1)
        }
    })
    return synonymMap
}

function _createLibraryMap(fileData, symbolColumn, RNAColumn, rankingColumn, synonymMap) {
    // se top of file for explanation of libraryMap datastructure
    _library.libraryStatus = "Parsing library"

    var rows = fileData.trim().split("\n").map((row) => row.split("\t"))
    _library.headers = rows.shift()
    const headerLen = _library.headers.length
    if (headerLen <= 1) {
        _library.libraryStatus = "select a file"
        return {}
    }
    if ((symbolColumn > headerLen) || (RNAColumn > headerLen) || (rankingColumn > headerLen)) {
        _library.libraryStatus = "Error: column not found"
        return {}
    }
    if ((symbolColumn < 1) || (RNAColumn < 1)) {
        _library.libraryStatus = "Enter valid columns"
        return {}
    }
    libraryMap = {}
    var additionalStatus = ""
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i]

        const symbol = row[symbolColumn - 1].trim()
        //const symbolLower = symbol.toLowerCase()
        const symbolLower = symbol.toLowerCase()

        if (libraryMap[symbolLower]) {
            libraryMap[symbolLower].push(row)
        } else {
            libraryMap[symbolLower] = [row]
        }
    }
    _library.libraryStatus = additionalStatus + `${Object.keys(libraryMap).length} symbols found`
    return libraryMap
}


function LIB_libraryCitation() {
    return _library.citationInfo
}


function LIB_statusSynonyms(searchSymbols) {
    return _createMatchingSynonyms(searchSymbols, true)

}
function LIB_statusSynonymsOLD(searchSymbols) {
    return _createMatchingSynonymsOLD(searchSymbols, true)
}

function LIB_statusScreening() {
    return _library.statusSearch
}

function LIB_statusLibrarySymbols() {
    return _library.libraryStatus
}

function _createMatchingSynonyms(searchSymbols) {
    /*
    returns object where each searched symbol is a key and the value is the a list of all synonyms to the key that are in the selected library
    if the value is empty list the symbol has no machig synonyms 
    synonym map = {
        symbol1: [synonym1.1, synonym1.2],
        symbol2: [synonym2.1]
        symbol3: [], (symbol3 has no matching synonyms in the selected library)
        symobl4: ...
    }
    */
    const symbolsNotFound = searchSymbols.filter(symbol => !_library.librarySymbolSet.has(symbol))// only symbols not in the library are considered
    const matchingSymbols = {}
    symbolsNotFound.forEach(searchSymbol => { // loop through all symbols in search feild that does not have a direct match
        if (_library.synonymMap[searchSymbol]) {
            matchingSymbols[searchSymbol] = Array.from(_library.synonymMap[searchSymbol].intersection(_library.librarySymbolSet)) // every symbol thats boath in the library and is a synonym to the searched symbol
        }
        else {
            matchingSymbols[searchSymbol] = []
        }
    })
    return matchingSymbols
}

function LIB_libraryCitation() {
    return _library.citationInfo
}

function LIB_statusSynonyms(searchSymbols) {
    return _createMatchingSynonyms(searchSymbols)
}

function LIB_statusScreening() {
    return _library.statusSearch
}

function LIB_statusLibrarySymbols() {
    return _library.libraryStatus
}
