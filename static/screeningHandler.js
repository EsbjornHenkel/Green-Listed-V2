


function logicScreening(rows, settings) {
    var filteredRows = []
    console.log(rows[1][settings.gRNAIndex[0]])
    for (let r = 0; r < rows.length; r++) {
        if (settings.partialMatches[0]){
            if (_partialMatch(rows[r][settings.symbolIndex[0]])){
                filteredRows.push(rows[r])
            }
        }
        
        else if (_match(rows[r][settings.symbolIndex[0]])){
            filteredRows.push(rows[r])
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
    rows.forEach(row => {
        out = out + `${row[settings.symbolIndex[0]]}    ${row[settings.gRNAIndex[0]]}  ${row[settings.rankingIndex[0]]}\n`
    });
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

function _match(RNAsymbol){
    return settings.searchSymbols[0].includes(RNAsymbol)
}

function getTopRankingElements(rows, n) {
    // Step 1: Group rows by symbol
    const rowsgroupedBySymbol = rows.reduce((acc, row) => {
        if (!acc[row[settings.symbolIndex[0]]]) {
            acc[row[settings.symbolIndex[0]]] = []
        }
        acc[row[settings.symbolIndex[0]]].push(row);
        return acc
    }, {})

    // Step 2: Sort each group by score in descending order
    Object.keys(rowsgroupedBySymbol).forEach(symbol => {
        rowsgroupedBySymbol[symbol].sort((a, b) => b[settings.rankingIndex[0]] - a[settings.rankingIndex[0]])
    })

    // Step 3: Pick the top n rows from each group
    var result = [];
    Object.keys(rowsgroupedBySymbol).forEach(symbol => {
        const topN = rowsgroupedBySymbol[symbol].slice(0, n)
        result.push(...topN) //  ... is a spread operator
    })

    return result
  }

function postProcessing(rows){
    for (let r = 0; r < rows.length; r++) {
        rows[r][settings.gRNAIndex[0]] = _applyAxiliarySettings(rows[r][settings.gRNAIndex[0]])
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

function _download(text, name, type) {
    var a = document.getElementById("dowloadAtag");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    //a.click()
}

