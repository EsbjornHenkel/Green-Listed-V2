


function logicScreening(rows, settings) {
    var filteredRows = {}
    
    for (const symbol in rows) {
        if (settings.partialMatches[0]){
            if (_partialMatch(symbol, settings)){
                filteredRows[symbol] = rows[symbol].slice().map((row) => row.slice()) //makes coppy not pointer
            }
        }
        else if (_match(symbol, settings)){
            filteredRows[symbol] = rows[symbol].slice().map((row) => row.slice()) //makes coppy not pointer
        }
    }

    if (settings.rankingTop[0] > 0){
        filteredRows = getTopRankingElements(filteredRows, settings.rankingTop[0])
    }
    filteredRows = postProcessing(filteredRows)
    var out = generateTxtOutput(filteredRows)
    
    _download(out, "outfile.txt", 'text/plain')
    return out
}

function generateTxtOutput(rows){
    out = ""
    for (const [symbol, arr] of Object.entries(rows)) {
        arr.forEach(element => {
            out = out + `${symbol}    ${element[settings.gRNAIndex[0]]}  ${element[settings.rankingIndex[0]]}\n`
        });
      }
    return out
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
    console.log(settings.searchSymbols[0])
    console.log(RNAsymbol)
    return settings.searchSymbols[0].includes(RNAsymbol.trim())
}

function getTopRankingElements(rows, n) {
    const topScorers = {};

    // Loop through each key in the groupedData
    for (const symbol in rows) {
        // Sort the array based on scores in descending order
        const sortedScores = rows[symbol].sort((a, b) => b[settings.rankingIndex[0]] - a[settings.rankingIndex[0]]);
        // Get the top n scores
        topScorers[symbol] = sortedScores.slice(0, n);
    }
    return topScorers;
  }

function postProcessing(rows){
    for (const symbol in rows) {
        rows[symbol].forEach(RNAstr =>{
            RNAstr[settings.gRNAIndex[0]] = _applyAxiliarySettings(RNAstr[settings.gRNAIndex[0]]) 
        })
    }
    return rows
}


function _applyAxiliarySettings(gRNASequence){
    console.log(gRNASequence)
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

function _download(text, name, type) {
    var a = document.getElementById("dowloadAtag");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    //a.click()
}

