


function logicScreening(library, settings) {
    const swapedSynonyms = Object.fromEntries(Object.entries(settings.usedSynonyms).map(([key, value]) => [value, key])) //swaps keys and values

    var filteredRows = {}
    var rows = library.rows


    const symbols = Object.keys(rows)

    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i]
        library.statusSearch = `${i}/${symbols.length} symbols searched`
        if (_match(symbol, settings, swapedSynonyms)){
            filteredRows[symbol] = rows[symbol].slice().map((row) => row.slice()) //makes coppy not pointer
        }
    }

    if (settings.rankingTop[0] > 0){
        filteredRows = getTopRankingElements(filteredRows, settings.rankingTop[0], settings.rankingOrder[0])
    }

    filteredRows = postProcessing(filteredRows, settings)
    //var out = _generateFullTxtOutput(filteredRows, settings, swapedSynonyms)
    return filteredRows
}

function _match(symbol, settings, swapedSynonyms){
    if (settings.enableSynonyms[0] && swapedSynonyms.hasOwnProperty(symbol)){
        symbol = swapedSynonyms[symbol]
        console.log(symbol)
    }
    if (settings.partialMatches[0]){
        return _matchPartial(symbol, settings)
    }
    return _matchNonpartial(symbol, settings)
}

function _matchPartial(symbol, settings){
    for (let i = 0; i < settings.searchSymbols[0].length; i++) {
        if(symbol.includes(settings.searchSymbols[0][i])){
            return true
        }
    }
    return false
}

function _matchNonpartial(symbol, settings){
    return settings.searchSymbols[0].includes(symbol.trim())
}

function getTopRankingElements(rows, n, rankingOrder) {
    const topScorers = {};

    // Loop through each key in the groupedData
    for (const symbol in rows) {
        // Sort the array based on scores in descending order
        var sortedScores = {}
        if (rankingOrder == "ascending"){
            sortedScores = rows[symbol].sort((a, b) => a[settings.rankingIndex[0]] - b[settings.rankingIndex[0]])
        }
        else{
            sortedScores = rows[symbol].sort((a, b) => b[settings.rankingIndex[0]] - a[settings.rankingIndex[0]])
        }
        // Get the top n scores
        topScorers[symbol] = sortedScores.slice(0, n);
    }
    return topScorers;
  }

function postProcessing(rows, settings){
    for (const symbol in rows) {
        rows[symbol].forEach(RNAstr =>{
            RNAstr[settings.gRNAIndex[0]] = _applyAxiliarySettings(RNAstr[settings.gRNAIndex[0]]) 
        })
    }
    return rows
}


function _applyAxiliarySettings(gRNASequence){
    if (settings.adaptorAfter[0].lenth == 0){
        adaptorAfter = ""
    }
    if (settings.adaptorBefore[0].lenth == 0){
        adaptorBefore = ""
    }
    gRNASequence = gRNASequence.slice(settings.trimBefore[0])
    if (settings.trimAfter[0] != 0){
        gRNASequence = gRNASequence.slice(0, -settings.trimAfter[0])
    }
    gRNASequence = settings.adaptorBefore[0] + gRNASequence + settings.adaptorAfter[0]
    return gRNASequence
}
