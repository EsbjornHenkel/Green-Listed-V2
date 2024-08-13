
// 
// GRNA 2.0 - 2024
//
// Library screening logic
// used by the library so execute a search
//

function SCR_startScreening(library, settings, usedSynonyms) {
    //starts screening
    //This is the only function that gets called from outside in this file
    const swappedSynonyms = Object.fromEntries(Object.entries(usedSynonyms).map(([key, value]) => [value, key])) //swaps keys and values
    var symbols = Object.keys(library.libraryMap)
    //creates a coppy of library map that just contains symbols that match the library symbols acording to the _match() function
    var filteredLibraryMap = {}
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i]
        library.statusSearch = `${i}/${symbols.length} symbols searched`
        if (_match(symbol, settings, swappedSynonyms)) {
            filteredLibraryMap[symbol] = library.libraryMap[symbol]
        }
    }
    if ((settings.rankingColumn != 0) || (settings.rankingColumn == null)) {
        filteredLibraryMap = _sortOnScore(filteredLibraryMap, settings.rankingOrder, settings.rankingColumn)
    }

    if (settings.rankingTop > 0) {
        filteredLibraryMap = _getTopRankingElements(filteredLibraryMap, settings.rankingTop)
    }
    //filteredLibraryMap = _postProcessing(filteredLibraryMap, settings) //adds trim and adapter sequences

    /*
    const textOutputFull = _createFullTxtOutput(settings, filteredLibraryMap, library.headers)
    const textOutputNotFound = _createSymboldNotFound(settings, usedSynonyms)
    var searchOutput = {
        "numSymbolsFound": Object.keys(filteredLibraryMap).length,
        "textOutputFull": textOutputFull,
        "textOutputNotFound": textOutputNotFound
    }*/
    searchOutput = {
        "headers": library.headers,
        "filteredLibraryMap": filteredLibraryMap,
        "usedSynonyms": usedSynonyms
    }
    return searchOutput
}

function _match(symbol, settings, swapedSynonyms) {
    //returns true is symbol is in library else false
    //can hande synonyms and partial matches
    if (settings.enableSynonyms && swapedSynonyms.hasOwnProperty(symbol)) {
        symbol = swapedSynonyms[symbol]
    }
    if (settings.partialMatches) {
        return _matchPartial(symbol, settings.searchSymbols)
    }
    return _matchNonpartial(symbol, settings.searchSymbols)
}

function _matchPartial(symbol, searchSymbols) {
    return searchSymbols.some(searchSymbol => symbol.includes(searchSymbol))
}

function _matchNonpartial(symbol, searchSymbols) {
    return searchSymbols.includes(symbol.trim())
}

function _sortOnScore(libraryMap, rankingOrder, rankingColumn) {
    for (const symbol in libraryMap) {
        if (rankingOrder == "ascending") {
            libraryMap[symbol].rows.sort((a, b) => a[rankingColumn - 1] - b[rankingColumn - 1])
        }
        else {
            libraryMap[symbol].rows.sort((a, b) => b[rankingColumn - 1] - a[rankingColumn - 1])
        }
    }
    return libraryMap
}

function _getTopRankingElements(libraryMap, n) {
    for (let symbol in libraryMap) {
        libraryMap[symbol].rows = libraryMap[symbol].rows.slice(0, n)

    }
    return libraryMap
}

/*
function _postProcessing(libraryMap, settings) {
    for (const symbol in libraryMap) {
        for (let i = 0; i < libraryMap[symbol].rows.length; i++) {
            libraryMap[symbol].rows[i][settings.RNAColumn - 1] = _applyPostProcessing(libraryMap[symbol].rows[i][settings.RNAColumn - 1], settings)
        }
    }
    return libraryMap
}
*/


