
var library = {
    "filteredRows": [],
    "rows": [],
}

function libraryStartScreen(settings){
    var st = performance.now()
    library.filteredRows = Array.from(library.rows).map((row) => Array.from(row))  
    var textOutput = logicScreening(library.filteredRows, settings)

    console.log((performance.now()-st)/1000)
    return textOutput.replace(/(?:\r\n|\r|\n)/g, '<br>')
}

function libraryAddCustom(data){
    var rows = _getRowList(data)
    rows.shift()
    library = {
        "rows": rows, //not including the first row
    }

}

function _uppdateSettings(firstRow){
    settingsSetLibrarySettings(_getgRNAIndex(firstRow), _getSymbolIndex(firstRow), _getRankIndex(firstRow))
}

function libraryUppdate(data){
    var rows = _getRowList(data)
    var firstRow = rows.shift()
    _uppdateSettings(firstRow)
    library = {
        "rows": rows, //not including the first row
    }
}

function libraryCreateFromServer(fileName, settings){
    serverUppdateFile(fileName, settings)
}

function fileRowStatus(){
    var l = library.rows.length
    if (l == 0){
        return "Entries found: 0"
    }
    return `Rows found ${l}`
}

function _getgRNAIndex(firstRow){
    return firstRow.indexOf("sgRNA Target Sequence")
}

function _getIDIndex(firstRow){
    return firstRow.indexOf("Target Gene Symbol")
}

function _getSymbolIndex(firstRow){
    return firstRow.indexOf("Target Gene Symbol")
}

function _getRankIndex(firstRow){
    return firstRow.indexOf("Rule Set 2 score")
}

function _getRowList(data){
    return data.trim().split("\n").map((row) => row.split("\t"))
}

function libraryStatus(settings){
    //settings["trimBefore"][1] = [trimBefore, ""]
    //settings["trimAfter"][1] = [trimAfter, ""]
    //settings["adaptorBefore"][1] = [adaptorSequencesBefore, ""]
    //settings["adaptorAfter"][1] = [adaptorSequencesAfter, ""]
    //settings["partialMatches"][1] = [partialMatches, ""]
    //settings["rankingTop"][1] = [rankingTop, ""]

    settings["gRNAIndex"][1] = filegRNAIndexStatus(settings)
    settings["symbolIndex"][1] = fileSymbolIndexStatus(settings)
    settings["rankingIndex"][1] = fileRankIndexStatus(settings)
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
    if (library.rows[0][settings.symbolIndex[0]])
        return "🗸"
    return "X"
}

function fileRankIndexStatus(settings){
    if ((settings.rankingIndex[0] == null) || settings.rankingIndex[0] == ""){
        return "🗸"
    }
    var cell = library.rows[0][settings.rankingIndex[0]]

    if (isNaN(cell))
        return "Found non number in column"
    if (  0 <= cell && cell <= 1){
        return "🗸"
    }
    return "X"
}
