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
        symbol1(in lower case) = {
            "rows": [all rows containing symbol1 splitt by \t],
            "symbolSynonyms": [a array of all synonyms to symbol1 (all lower case)],
            "originalSymbol": symbol1 with the same capitalisation as in the library
        },
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
    //uppdates library Map
    console.log("LIB_setLibraryCustomData()start scol=" + settings.symbolColumn)
    var libraryMap = _createLibraryMap(fileData, settings.symbolColumn, settings.RNAColumn, settings.rankingColumn, {})
    _library.librarySymbolSet = new Set(Object.keys(libraryMap)), //a set containing all symbols in the library
        _library.libraryMap = libraryMap
    //console.log("LIB_setLibraryCustomData()end rcol=" + settings.RNAColumn)
}


function LIB_setLibraryData(librarySettings, fileData, synonymData, citationInfo) {
    //uppdates synonymMap, citationInfo and libraryMap
    _library.citationInfo = citationInfo
    _library.synonymMap = _createSynonymMap(synonymData)
    var libraryMap = _createLibraryMap(fileData, librarySettings.symbolColumn, librarySettings.RNAColumn, librarySettings.rankingColumn, _library.synonymMap)
    _library.librarySymbolSet = new Set(Object.keys(libraryMap)), //a set containing all symbols in the library
        _library.libraryMap = libraryMap
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
            libraryMap[symbolLower].rows.push(row)
        } else {
            libraryMap[symbolLower] = {
                "rows": [row],
                "originalSymbol": symbol
            }
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

function _createMatchingSynonyms(searchSymbols, forDisplay) {
    /*
    returns object where each searched symbol is a key and the value is the first synonym to the key that existsts in the selected library
    if the value in empty string the symbol has no mathchin synonyms
    synonym map = {
        symbol1: synonym1,
        symbol2: synonym2
        symbol3: "", (symbol3 has no matching synonyms in the selected library)
        symobl4: ...
    }
    */
    const symbolsNotFound = searchSymbols.filter(symbol => !_library.librarySymbolSet.has(symbol))// only symbols not in the library are considered
    const matchingSymbols = {}
    symbolsNotFound.forEach(searchSymbol => { // loop through all symbols in search feild that does not have a direct match
        //smatchingSymbols[searchSymbol] = "" //if synboll does not hava synonym in library it defaults to empty string
        if (_library.synonymMap[searchSymbol]) {
            matchingSymbols[searchSymbol] = Array.from(_library.synonymMap[searchSymbol].intersection(_library.librarySymbolSet)) // every symbol thats boath in the library and is a synonym to the searched symbol
            /*if (inter.size != 0) {
                matchingSymbols[searchSymbol] = inter.values().next().value
            }*/
        }
        else {
            matchingSymbols[searchSymbol] = []
        }
    })
    return matchingSymbols
}

/*
function _createMatchingSynonymsOLD(searchSymbols, forDisplay) {

    returns object where each searched synbol is a key and the value is the first synonym to the key that existsts in the selected library
    if the value in empty string the symbol has no mathchin synonyms
    synonym map = {
        symbol1: synonym1,
        symbol2: synonym2
        symbol3: "", (symbol3 has no matching synonyms in the selected library)
        symobl4: ...
    }

    const symbolsNotFound = searchSymbols.filter(symbol => !_library.libraryMap.hasOwnProperty(symbol))// only symbols not in the library are considered
    const matchingSymbols = {}
    symbolsNotFound.forEach(searchSymbol => { // loop through all symbols in search feild that does not have a direct match
        matchingSymbols[searchSymbol] = ""
        if (_library.synonymMap[searchSymbol]) { //symbol must have synonyms

            _library.synonymMap[searchSymbol].forEach(synonym => { //loop through all synonyms
                Object.keys(_library.libraryMap).forEach(fileSymbol => { //loop through all symbols in library
                    if (_library.synonymMap[fileSymbol]) {
                        if (_library.synonymMap[fileSymbol].has(synonym)) { //synonym exists in library )
                            matchingSymbols[searchSymbol] = fileSymbol //correct capitalisation is used for display
                        }
                    }
                })
            })
        }
    })

    return matchingSymbols
}*/

function LIB_libraryCitation() {
    return _library.citationInfo
}

function LIB_statusSynonyms(searchSymbols) {
    return _createMatchingSynonyms(searchSymbols, true)
}

function LIB_statusScreening() {
    return _library.statusSearch
}

function LIB_statusLibrarySymbols() {
    return _library.libraryStatus
}
