
//
// Library screening
//

function logicScreening(library, settings, usedSynonyms) {
    const swappedSynonyms = Object.fromEntries(Object.entries(usedSynonyms).map(([key, value]) => [value, key])) //swaps keys and values
    var symbols = Object.keys(library.libraryMap)
    var filteredLibraryMap = {}

    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i]
        library.statusSearch = `${i}/${symbols.length} symbols searched`
        if (_match(symbol, settings, swappedSynonyms)) {
            filteredLibraryMap[symbol] = library.libraryMap[symbol]
        }
    }
    console.log(filteredLibraryMap)
    if ((settings.rankingColumn != 0) || (settings.rankingColumn == null)) {
        filteredLibraryMap = _sortOnScore(filteredLibraryMap, settings.rankingOrder, settings.rankingColumn)

    }
    if (settings.rankingTop > 0) {
        filteredLibraryMap = _getTopRankingElements(filteredLibraryMap, settings.rankingTop)
    }
    filteredLibraryMap = _postProcessing(filteredLibraryMap, settings)

    const textOutputFull = _generateFullTxtOutput(settings, filteredLibraryMap, library.headers, swappedSynonyms)
    const textOutputNotFound = _generateDownloadSymboldNotFound(settings, usedSynonyms)
    var searchOutput = {
        "numSymbolsFound": Object.keys(filteredLibraryMap).length,
        "textOutputFull": textOutputFull,
        "textOutputNotFound": textOutputNotFound
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
        libraryMap[symbol].rows = libraryMap[symbol].rows.slice(0, n);
    }
    return libraryMap
}

function _postProcessing(libraryMap, settings) {
    for (const symbol in libraryMap) {
        libraryMap[symbol].rows.forEach(RNAstr => {
            RNAstr[settings.gRNAColumn - 1] = _applyPostProcessing(RNAstr[settings.RNAColumn - 1])
        })
    }
    return libraryMap
}


function _applyPostProcessing(gRNASequence) {
    if (settings.adaptorAfter.lenth == 0) {
        adaptorAfter = ""
    }
    if (settings.adaptorBefore.lenth == 0) {
        adaptorBefore = ""
    }
    gRNASequence = gRNASequence.slice(settings.trimBefore)
    if (settings.trimAfter != 0) {
        gRNASequence = gRNASequence.slice(0, -settings.trimAfter)
    }
    gRNASequence = settings.adaptorBefore + gRNASequence + settings.adaptorAfter
    return gRNASequence
}


function _generateFullTxtOutput(settings, libraryMap, headers, swapedSynonyms) {
    headers.splice(settings.RNAColumn, 0, "Target Sequence Compliment")
    var out = headers.join("\t") + "\n"
    for (var [symbol, dict] of Object.entries(libraryMap)) {

        dict.rows.forEach(row => {
            row.splice(settings.RNAColumn, 0, _complimentSequence(row[settings.RNAColumn - 1]))
            out = out + `${row.join("\t")} \n`
        })
    }
    return out
}

function _generateDownloadSymboldNotFound(settings, usedSynonyms) {
    out = "Symbol searched\t Symonym used\r\n"
    for (var symbol of Object.keys(usedSynonyms)) {
        if (settings.enableSynonyms && (usedSynonyms[symbol] != "")) {
            out = `${symbol}\t${usedSynonyms[symbol]}` + out + "\n"
            continue
        }
        out = out + `${symbol}\n`
    }
    return out
}

function _complimentSequence(gRNASequence) {
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
}