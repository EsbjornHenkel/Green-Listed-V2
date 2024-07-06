
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
        if (_match(symbol, settings, swappedSynonyms)){
            filteredLibraryMap[symbol] = library.libraryMap[symbol]
        }
    }

    if ((settings.rankingColumn !=  0) || (settings.rankingColumn == null)){
        filteredLibraryMap = sortOnScore(filteredLibraryMap, settings.rankingOrder, settings.rankingColumn)
        
    }
    if (settings.rankingTop > 0){
        filteredLibraryMap = getTopRankingElements(filteredLibraryMap, settings.rankingTop)
    }
    filteredLibraryMap = postProcessing(filteredLibraryMap, settings)

    const textOutputFull = _generateFullTxtOutput(settings, filteredLibraryMap, swappedSynonyms)
    const textOutputNotFound = _generateDownloadSymboldNotFound(settings, usedSynonyms)
    var searchOutput = {
        "textOutputFull": textOutputFull,
        "textOutputNotFound": textOutputNotFound
    }
    return searchOutput
}

function removeMatchingKeys(libraryMap, settings, swappedSynonyms) {
    return Object.keys(libraryMap).reduce((acc, key) => {
      if (_match(key, settings, swappedSynonyms)) {
        acc[key] = libraryMap[key]
      }
      return acc
    }, {})
  }


function _match(symbol, settings, swapedSynonyms){
    if (settings.enableSynonyms && swapedSynonyms.hasOwnProperty(symbol)){
        symbol = swapedSynonyms[symbol]
    }
    if (settings.partialMatches){
        return _matchPartial(symbol, settings.searchSymbols)
    }
    return _matchNonpartial(symbol, settings.searchSymbols)
}

function _matchPartial(symbol, searchSymbols){
    return searchSymbols.some(searchSymbol => symbol.includes(searchSymbol))
}

function _matchNonpartial(symbol, searchSymbols){
    return searchSymbols.includes(symbol.trim())
}

function sortOnScore(libraryMap, rankingOrder, rankingColumn){

    // Loop through each key in the groupedData
    for (const symbol in libraryMap) {
        // Sort the array based on scores in descending order
        if (rankingOrder == "ascending"){
            libraryMap[symbol].rows.sort((a, b) => a[rankingColumn-1] - b[rankingColumn-1])
        }
        else{
            libraryMap[symbol].rows.sort((a, b) => b[rankingColumn-1] - a[rankingColumn-1])
        }
    }
    return libraryMap
}

function getTopRankingElements(libraryMap, n) {
    for (let symbol in libraryMap) {
        libraryMap[symbol].rows = libraryMap[symbol].rows.slice(0, n);
      }
    return libraryMap
}

function postProcessing(libraryMap, settings){
    for (const symbol in libraryMap) {
        libraryMap[symbol].rows.forEach(RNAstr =>{
            RNAstr[settings.gRNAColumn-1] = _applyAxiliarySettings(RNAstr[settings.RNAColumn-1]) 
        })
    }
    return libraryMap
}


function _applyAxiliarySettings(gRNASequence){
    if (settings.adaptorAfter.lenth == 0){
        adaptorAfter = ""
    }
    if (settings.adaptorBefore.lenth == 0){
        adaptorBefore = ""
    }
    gRNASequence = gRNASequence.slice(settings.trimBefore)
    if (settings.trimAfter != 0){
        gRNASequence = gRNASequence.slice(0, -settings.trimAfter)
    }
    gRNASequence = settings.adaptorBefore + gRNASequence + settings.adaptorAfter
    return gRNASequence
}


function _generateFullTxtOutput(settings, libraryMap, swapedSynonyms){
    out = "SymbolSearched SymbolUsed  gRNA    Compliment  Score \n"
    for (var [symbol, dict] of Object.entries(libraryMap)) {
        var SymbolSearched = ""
        if (enableSynonyms && swapedSynonyms.hasOwnProperty(symbol)){
            SymbolSearched = `${swapedSynonyms[symbol]}→`
            symbol = `${symbol} `
        }
        dict.rows.forEach(element => {
            out = out + `${SymbolSearched}  ${symbol}   ${element[settings.gRNAColumn-1]}    ${_complimentSequence(element[settings.gRNAColumn-1])}    ${element[settings.rankingColumn-1]}\n`
        })
      }
    return out.replace(/(?:\r\n|\r|\n)/g, '\n')
}

function _generateDownloadSymboldNotFound(settings, usedSynonyms){
    out = "Symbol\n"
    for (var symbol of Object.keys(usedSynonyms)) {
        if (settings.enableSynonyms && (usedSynonyms[symbol] != "")){
            continue
        }
        out = out + `${symbol}\n`
      }
    return out.replace(/(?:\r\n|\r|\n)/g, '\n')
}

function _complimentSequence(gRNASequence){
    var complimentMap ={
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