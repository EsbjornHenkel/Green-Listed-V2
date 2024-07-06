

//
// Handles a library
//


// State holding the currently selected library
var library = {
    "libraryMap": {},
    "headers": "",
    "synonyms": null,
    "statusSearch": "",
}

function libraryStartScreenTEST(settings){
    library.statusSearch = "Starting search"
    var ost = performance.now()
    for (let i = 0; i < 10; i++) {
        var st = performance.now()
        logicScreening(library, settings, libraryStatusSynonyms(settings.searchSymbols))
        console.log(Math.round((performance.now()-st)/1000 * 1000) / 1000)
    }
    console.log(`final: ${Math.round((performance.now()-ost)/1000 * 1000) / 1000/10}`)
    return searchOutput
}

async function libraryStartScreen(settings){
    library.statusSearch = "Starting search"
    var st = performance.now()
    var searchOutput = await logicScreening(library, settings, libraryStatusSynonyms(settings.searchSymbols))
    library.statusSearch = `Done. Time to complete: ${Math.round((performance.now()-st)/1000 * 10) / 10}s`
    console.log(Math.round((performance.now()-st)/1000 * 1000) / 1000)
    return searchOutput
}

function libraryCustomData(fileData, symbolColumn){
    //library.synonyms = synonyms
    libraryMap = fileData.trim().split("\n").map((row) => row.split("\t"))
    library.headers = libraryMap.shift()
    var libraryMap = _getRowList(libraryMap, symbolColumn)
    library["libraryMap"] = libraryMap
}


function libraryUpdate(librarySettings, fileData, synonyms){
    library.synonyms = synonyms
    libraryMap = fileData.trim().split("\n").map((row) => row.split("\t"))
    library.headers = libraryMap.shift()
    var libraryMap = _getRowList(libraryMap, librarySettings.symbolColumn)
    library["libraryMap"] = libraryMap
}

function _getRowList(rows, symbolColumn){
    const libraryMap = {};
    rows.forEach(row => {
            symbol = row[symbolColumn-1]
        if (libraryMap[symbol]) {
            libraryMap[symbol].push(row)
        } else {
            libraryMap[symbol] = [row]
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

function libraryUniqueSymbols(){
    var len = Object.keys(library.libraryMap).length
    if (len == 0)
        return "Error no symbols found"
    return `Unique symbols found: ${len}`
}

function getSearchstatus(){
    return library["statusSearch"]
}

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
}

function libraryStatusScreening(){
    return library.statusSearch
}