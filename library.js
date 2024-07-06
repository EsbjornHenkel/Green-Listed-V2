

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
        logicScreening(library, settings, libraryStatusSynonyms(settings.searchSymbols))
        console.log(Math.round((performance.now()-st)/1000 * 1000) / 1000)
    }
    console.log(`final: ${Math.round((performance.now()-ost)/1000 * 1000) / 1000/10}`)
    return searchOutput
}

function libraryStartScreen(settings){
    library.statusSearch = "Starting search"
    var st = performance.now()
    var searchOutput = logicScreening(library, settings, libraryStatusSynonyms(settings.searchSymbols))
    library.statusSearch = `Done. Time to complete: ${Math.round((performance.now()-st)/1000 * 10) / 10}s`
    console.log(Math.round((performance.now()-st)/1000 * 1000) / 1000)
    return searchOutput
}

function libraryCustomData(fileData, symbolColumn){
    //library.synonymMap = _getSynonymMap(synonymData)
    var libraryMap = _getLibraryMap(fileData, symbolColumn)
    library["libraryMap"] = libraryMap
}


function libraryUpdate(librarySettings, fileData, synonymData){
    library.synonymMap = _getSynonymMap(synonymData)
    var libraryMap = _getLibraryMap(fileData, librarySettings.symbolColumn)
    library["libraryMap"] = libraryMap
}

function _getSynonymMap(synonymData){
    rows = synonymData.trim().split("\n").map((row) => row.split("\t"))
    rows.shift()
    var synonymMap = {}
    rows.forEach(row => {
        const symbol1 = row[0]
        const symbol2 = row[1]

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

function _getLibraryMap(fileData, symbolColumn){
    rows = fileData.trim().split("\n").map((row) => row.split("\t"))
    rows.shift()
    libraryMap = {}
    rows.forEach(row => {
        symbol = row[symbolColumn-1]
        if (libraryMap[symbol]) {
            libraryMap[symbol].rows.push(row)
        } else {
            libraryMap[symbol] = {
                "rows": [row],
                "previusSymbol": ""
            }
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
    
    const array2  = Object.keys(library.libraryMap)
    const array1 = searchSymbols.filter(symbol => !array2.includes(symbol))
    const synonymsDict = library.synonymMap

    const resultDict = {}
    array1.forEach(symbol => {
        resultDict[symbol] = ""
        if (synonymsDict[symbol]) {
          synonymsDict[symbol].forEach(synonym => {
            if (array2.includes(synonym)) {
              if (!resultDict[symbol]) {
                resultDict[symbol] = []
              }
              resultDict[symbol] = synonym;
            }
          })
        }
      })

    return resultDict
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

function libraryStatusScreening(){
    return library.statusSearch
}