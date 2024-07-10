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
        logicScreening(library, settings, LIB_libraryStatusSynonyms(settings.searchSymbols))
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
    var searchOutput = logicScreening(library, settings, LIB_libraryStatusSynonyms(settings.searchSymbols))
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
        const symbol1 = row[0].toLowerCase()
        const symbol2 = row[1].toLowerCase()

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
    rows.shift()
    libraryMap = {}
    rows.forEach(row => {
        symbol = row[symbolColumn-1].toLowerCase()
        if (libraryMap[symbol]) {
            libraryMap[symbol].rows.push(row)
        } else {
            libraryMap[symbol] = {
                "rows": [row],
                "symbolSynonyms": synonymMap[symbol] ? Array.from(synonymMap[symbol]) : []
            }
            libraryMap[symbol].symbolSynonyms.push(symbol)
        }
    })
    return libraryMap
}

function libraryStatusRNAIndex(gRNAIndex){
    if ((gRNAIndex == null) || gRNAIndex == "" || Object.values(library.libraryMap).length == 0){
        return "X"
    }
    const regex = /^[ACGTU ]+$/
    for (let i = 0; i < library.libraryMap.length; i++) {
        if (!regex.test(library.libraryMap[i][gRNAIndex])){
            return "Found non ACGTU character"
        }
    }
    return "🗸"
}

function libraryStatusSymbolIndex(symbolIndex){
    if ((symbolIndex == null) || symbolIndex == "" || Object.values(library.libraryMap).length == 0){
        return "X"
    }
    if (Object.values(library.libraryMap)[0][symbolIndex])
        return "🗸"
    return "X"
}

function libraryStatusRankIndex(rankingIndex){
    if (Object.values(library.libraryMap).length == 0){
        return "X"
    }
    if ((rankingIndex == null) || rankingIndex == "" ){
        return "🗸"
    }
    var cell = Object.values(library.libraryMap)[0][rankingIndex]

    if (isNaN(cell))
        return "Found non number in column"
    if (  0 <= cell && cell <= 1){
        return "🗸"
    }
    return "X"
}

function LIB_libraryUniqueSymbols(){
    var len = Object.keys(library.libraryMap).length
    if (len == 0)
        return "Error no symbols found"
    return `Unique symbols found: ${len}`
}

function getSearchstatus(){
    return library["statusSearch"]
}

function LIB_libraryStatusSynonyms(searchSymbols){
    const symbolsNotFound = searchSymbols.filter(symbol => !library.libraryMap.hasOwnProperty(symbol))
    const synonymMap = {}
    symbolsNotFound.forEach(symbol => {
        synonymMap[symbol] = ""
        if (library.synonymMap[symbol]) {
            library.synonymMap[symbol].forEach(synonym => {
                Object.keys(library.libraryMap).forEach(fileSymbol => {
                    if (library.libraryMap[fileSymbol].symbolSynonyms.includes(synonym) ) {
                        synonymMap[symbol] = fileSymbol
                    }
                })

            })
        }
      })
    return synonymMap
}

/*
function libraryStatusSynonyms(searchSymbols){
    var synonymMaping = {}
    const symbolsNotFound = searchSymbols.filter(symbol => !library.libraryMap.hasOwnProperty(symbol))

    symbolsNotFound.forEach(symbol => {
        var row = library.synonyms.find(row => row.includes(symbol))
        if (!row){
            synonym = ""
        }
        else{
            synonym = row.find(synonym => library.libraryMap.hasOwnProperty(synonym))
            if (!synonym){
                synonym = ""
            }
        }
        synonymMaping[symbol] = synonym
    })

    return synonymMaping
}*/

function LIB_libraryStatusScreening(){
    return library.statusSearch
}