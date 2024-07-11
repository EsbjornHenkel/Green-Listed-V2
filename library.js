//
// Handles a library
//


// State holding the currently selected library
var library = {
    "libraryMap": {},
    "headers": "",
    "synonymMap": null,
    "statusSearch": "",
}

function libraryStartScreenTEST(settings){
    library.statusSearch = "Runnung screening"
    var ost = performance.now()
    for (let i = 0; i < 10; i++) {
        var st = performance.now()
        logicScreening(library, settings, _librarySynonyms(settings.searchSymbols))
        console.log(Math.round((performance.now()-st)/1000 * 1000) / 1000)
    }
    console.log(`final: ${Math.round((performance.now()-ost)/1000 * 1000) / 1000/10}`)
    return searchOutput
}

function LIB_libraryStartScreen(settings){
    if (Object.keys(library.libraryMap).length == 0){
        library.statusSearch = "Error no library selected"
        throw new Error("No library selected")
    }
    library.statusSearch = "Starting search"
    var st = performance.now()
    var searchOutput = logicScreening(library, settings, _librarySynonyms(settings.searchSymbols))
    library.statusSearch = `Done. Time to complete: ${Math.round((performance.now()-st)/1000 * 10) / 10}s<br> symbols found: ${settings.searchSymbols.length}`
    console.log(Math.round((performance.now()-st)/1000 * 1000) / 1000)
    return searchOutput
}

function LIB_libraryCustomData(fileData, symbolColumn){
    //library.synonymMap = _getSynonymMap(synonymData)
    var libraryMap = _getLibraryMap(fileData, symbolColumn)
    library["libraryMap"] = libraryMap
}


function LIB_libraryUpdate(librarySettings, fileData, synonymData){
    library.synonymMap = _getSynonymMap(synonymData)
    var libraryMap = _getLibraryMap(fileData, librarySettings.symbolColumn, library.synonymMap)
    library.libraryMap = libraryMap
}

function _getSynonymMap(synonymData){
    rows = synonymData.trim().split("\n").map((row) => row.split("\t"))
    rows.shift()
    var synonymMap = {}
    rows.forEach(row => {
        const symbol1 = row[0].toLowerCase().trim()
        const symbol2 = row[1].toLowerCase().trim()

        if (!synonymMap[symbol1]) {
            synonymMap[symbol1] = new Set()
        }
        synonymMap[symbol1].add(symbol2)

        if (!synonymMap[symbol2]) {
            synonymMap[symbol2] = new Set()
        }
        synonymMap[symbol2].add(symbol1)
      })
      return synonymMap
}

function _getLibraryMap(fileData, symbolColumn, synonymMap){
    rows = fileData.trim().split("\n").map((row) => row.split("\t"))
    library.headers = rows.shift()
    libraryMap = {}
    rows.forEach(row => {
        const symbol = row[symbolColumn-1].trim()
        const stmbolLower = row[symbolColumn-1].toLowerCase().trim()
        if (libraryMap[stmbolLower]) {
            libraryMap[stmbolLower].rows.push(row)
        } else {
            libraryMap[stmbolLower] = {
                "rows": [row],
                "symbolSynonyms": synonymMap[stmbolLower] ? Array.from(synonymMap[stmbolLower]) : [],
                "originalSymbol": symbol
            }
            libraryMap[stmbolLower].symbolSynonyms.push(stmbolLower)
        }
    })
    return libraryMap
}

function _librarySynonyms(searchSymbols, forDisplay){
    const symbolsNotFound = searchSymbols.filter(symbol => !library.libraryMap.hasOwnProperty(symbol))
    const synonymMap = {}
    symbolsNotFound.forEach(symbol => {
        synonymMap[symbol] = ""
        if (library.synonymMap[symbol]) {
            library.synonymMap[symbol].forEach(synonym => {
                Object.keys(library.libraryMap).forEach(fileSymbol => {
                    if (library.libraryMap[fileSymbol].symbolSynonyms.includes(synonym) ) {
                        synonymMap[symbol] = forDisplay ? library.libraryMap[fileSymbol].originalSymbol : fileSymbol
                    }
                })

            })
        }
      })
    return synonymMap
}

function LIB_libraryStatusSynonymsDisplay(searchSymbols){
    return  _librarySynonyms(searchSymbols, true)
}

function getSearchstatus(){
    return library["statusSearch"]
}

function LIB_libraryUniqueSymbols(){
    var len = Object.keys(library.libraryMap).length
    if (len == 0)
        return "Error no symbols found"
    return `Unique symbols found: ${len}`
}

function LIB_libraryStatusScreening(){
    return library.statusSearch
}