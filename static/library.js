
var libraries = [
    {
        "name": "Brunello 21",
        "fileName": "STable 21 Brunello.txt",
        "symbolColumn": 3,
        "RNAColumn": 8,
        "RankColumn": 12
    },
    {
        "name": "Brie 22",
        "fileName": "STable 22 Brie.txt",
        "symbolColumn": 2,
        "RNAColumn": 7,
        "RankColumn": 11
    }
]

var library = {
    "rows": {},
}

function libraryStartScreen(settings){
    var st = performance.now()
    var textOutput = logicScreening(library.rows, settings)

    console.log((performance.now()-st)/1000)
    return textOutput.replace(/(?:\r\n|\r|\n)/g, '<br>')
}

function libraryAddCustom(data, RNAcolumn, symbolColumn, RankColumn){
    rows = data.trim().split("\n").map((row) => row.split("\t"))
    rows.shift()
    settingsSetLibrarySettings(RNAcolumn-1, symbolColumn-1, RankColumn-1, library.rows.length)
    console.log(settings.symbolIndex)
    var rows = _getRowList(rows, settings)

    library["rows"] = rows
}

function libraryUppdate(data, settings, fileIndex){
    rows = data.trim().split("\n").map((row) => row.split("\t"))
    rows.shift()
    settingsSetLibrarySettings(libraries[fileIndex].RNAColumn-1, libraries[fileIndex].symbolColumn-1, libraries[fileIndex].RankColumn-1, library.rows.length)
    var rows = _getRowList(rows, settings)
    library["rows"] = rows
}

function libraryCreateFromServer(fileIndex, settings){
    serverUppdateFile(libraries[fileIndex].fileName, settings, fileIndex, )
}

function fileRowStatus(){
    var l = library.rows.length
    if (l == 0){
        return "Entries found: 0"
    }
    return `Rows found ${l}`
}

function _getRowList(rows, settings){
    const groupedData = {};
    
    // Loop through each row in the 2D list
    rows.forEach(row => {
            symbol = row[settings.symbolIndex[0]]
        // Check if the name already exists as a key in groupedData
        if (groupedData[symbol]) {
            // If it exists, push the current row into the array
            groupedData[symbol].push(row)
        } else {
            // If it does not exist, create a new array with the current row
            groupedData[symbol] = [row]
        }
    })
    return groupedData
    //return data.trim().split("\n").map((row) => row.split("\t"))
}

function libraryStatus(settings){
    //settings["trimBefore"][1] = [trimBefore, ""]
    //settings["trimAfter"][1] = [trimAfter, ""]
    //settings["adaptorBefore"][1] = [adaptorSequencesBefore, ""]
    //settings["adaptorAfter"][1] = [adaptorSequencesAfter, ""]
    //settings["partialMatches"][1] = [partialMatches, ""]
    //settings["rankingTop"][1] = [rankingTop, ""]
    settings["searchSymbols"][1] = fileSearchSymbols(settings)

    settings["gRNAIndex"][1] = filegRNAIndexStatus(settings)
    settings["symbolIndex"][1] = fileSymbolIndexStatus(settings)
    settings["rankingIndex"][1] = fileRankIndexStatus(settings)

    settings["entries"][1] = fileEntriesStatus(settings)
    return settings
}

function fileRowStatus(settings){
    if (library.rows.length){
        return `Entries found: ${library.rows.length}`
    }
    return "NO library selected"
}

function filegRNAIndexStatus(settings){
    if ((settings.gRNAIndex[0] == null) || settings.gRNAIndex[0] == ""){
        return "X"
    }
    const regex = /^[ACGTU ]+$/
    for (let i = 0; i < library.rows.length; i++) {
        if (!regex.test(library.rows[i][settings.gRNAIndex[0]])){
            return "Found non ACGTU character"
        }
    }
    return "🗸"
}

function fileSymbolIndexStatus(settings){
    if ((settings.symbolIndex[0] == null) || settings.symbolIndex[0] == ""){
        return "X"
    }
    if (Object.values(library.rows)[0][settings.symbolIndex[0]])
        return "🗸"
    return "X"
}

function fileRankIndexStatus(settings){
    if ((settings.rankingIndex[0] == null) || settings.rankingIndex[0] == ""){
        return "🗸"
    }
    var cell = Object.values(library.rows)[0][settings.rankingIndex[0]]

    if (isNaN(cell))
        return "Found non number in column"
    if (  0 <= cell && cell <= 1){
        return "🗸"
    }
    return "X"
}

function fileSearchSymbols(settings){
    var status = ""
    settings.searchSymbols[0].forEach(symbol =>{
        symbol = symbol.trim()
        if (!(library.rows.hasOwnProperty(symbol))){
            status = status + `${symbol} !not found in file\n`
        }
        else{
            status = status + symbol +"\n"
        }
    })
    
    return status
}

function fileEntriesStatus(settings){
    var len = Object.keys(library.rows).length
    if (len == 0)
        return "Error no symbols found"
    return `unique symbols found: ${len}`
}
