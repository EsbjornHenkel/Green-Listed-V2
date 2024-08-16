
// 
// GRNA 2.0 - 2024
//
// Library screening logic
// used by the library so execute a search
//


function SCR_startScreening(library, settings, usedSynonyms) {
    const symbolsUsed = settings.searchSymbols.map(symbol => usedSynonyms[symbol] ? usedSynonyms[symbol] : symbol)


    var machingSymbols = []
    if (!settings.partialMatches) {
        const symbolsUsedSet = new Set(symbolsUsed)
        machingSymbols = Object.keys(library.libraryMap).filter(librarySymbol => symbolsUsedSet.has(librarySymbol))
    }
    else {
        machingSymbols = Object.keys(library.libraryMap).filter(librarySymbol =>
            symbolsUsed.some(searchSymbol => librarySymbol.includes(searchSymbol))
        )
    }

    var filteredLibraryMap = {}
    for (let i = 0; i < machingSymbols.length; i++) {
        filteredLibraryMap[machingSymbols[i]] = { ...library.libraryMap[machingSymbols[i]] } //creates copy
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



