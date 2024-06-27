


function logicScreening(library, settings) {
    var filteredRows = {}
    const symbols = Object.keys(library["rows"])
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i]
        library.statusSearch = `${i}/${symbols.length} symbols searched`
        if (settings.partialMatches[0]){
            if (_partialMatch(symbol, settings)){
                filteredRows[symbol] = library["rows"][symbol].slice().map((row) => row.slice()) //makes coppy not pointer
            }
        }
        else if (_match(symbol, settings)){
            filteredRows[symbol] = library["rows"][symbol].slice().map((row) => row.slice()) //makes coppy not pointer
        }
    }

    if (settings.rankingTop[0] > 0){
        filteredRows = getTopRankingElements(filteredRows, settings.rankingTop[0], settings.rankingOrder[0])
    }

    filteredRows = postProcessing(filteredRows, settings)
    var out = generateFullTxtOutput(filteredRows, settings)
    return out
}

function generateFullTxtOutput(rows, settings){
    out = "Symbol   gRNA    Compliment  Score \n"
    for (const [symbol, arr] of Object.entries(rows)) {
        arr.forEach(element => {
            out = out + `${symbol}    ${element[settings.gRNAIndex[0]]}    ${complimentSequence(element[settings.gRNAIndex[0]])}    ${element[settings.rankingIndex[0]]}\n`
        })
      }
    return out.replace(/(?:\r\n|\r|\n)/g, '\n')
}

function _partialMatch(RNAsymbol){
    for (let i = 0; i < settings.searchSymbols[0].length; i++) {
        if(RNAsymbol.includes(settings.searchSymbols[0][i])){
            return true
        }
    }
    return false
}

function _match(RNAsymbol, settings){
    return settings.searchSymbols[0].includes(RNAsymbol.trim())
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

function complimentSequence(gRNASequence){
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