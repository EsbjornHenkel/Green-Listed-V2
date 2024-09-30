
// 
// GRNA 2.0 - 2024
//
// Library screening logic
// used by the library so execute a search
//


function SCR_startScreening(library, settings, usedSynonyms) {

    var machingSymbols = []
    if (!settings.partialMatches) {
        machingSymbols = settings.searchSymbols.filter(symbol => library.librarySymbolSet.has(symbol)) //maches without synonyms
        machingSymbols.push(...Object.values(usedSynonyms).flat()) //synonym maches
    }
    else {
        machingSymbols = Object.keys(library.libraryMap).filter(librarySymbol =>
            settings.searchSymbols.some(searchSymbol => librarySymbol.includes(searchSymbol))
        )
    }

    //machingSymbols now contains all symbols found in library maching the searched symbols
    //creates map containing maching symbols
    var filteredLibraryMap = {}
    for (let i = 0; i < machingSymbols.length; i++) {
        filteredLibraryMap[machingSymbols[i]] = [...library.libraryMap[machingSymbols[i]]]  //creates copy
    }

    if ((settings.rankingColumn != 0) || (settings.rankingColumn == null)) {
        filteredLibraryMap = _sortOnScore(filteredLibraryMap, settings.rankingOrder, settings.rankingColumn)
    }

    if (settings.rankingTop > 0) {
        filteredLibraryMap = _getTopRankingElements(filteredLibraryMap, settings.rankingTop)
    }
    searchOutput = {
        "headers": library.headers,
        "filteredLibraryMap": filteredLibraryMap,
        "usedSynonyms": usedSynonyms
    }
    return searchOutput
}

function _sortOnScore(libraryMap, rankingOrder, rankingColumn) {
    for (const symbol in libraryMap) {
        if (rankingOrder == "ascending") {
            libraryMap[symbol].sort((a, b) => b[rankingColumn - 1] - a[rankingColumn - 1])
        }
        else {
            libraryMap[symbol].sort((a, b) => a[rankingColumn - 1] - b[rankingColumn - 1])
        }
    }
    return libraryMap
}

function _getTopRankingElements(libraryMap, n) {
    for (let symbol in libraryMap) {
        libraryMap[symbol] = libraryMap[symbol].slice(0, n)
    }
    return libraryMap
}



