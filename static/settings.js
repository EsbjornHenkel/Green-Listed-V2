

var settings = {
    "trimBefore": [0, ""], 
    "trimAfter": [0, ""], 
    "adaptorBefore": ["", ""],
    "adaptorAfter": ["", ""],
    "partialMatches": [false, ""],
    "searchSymbols": ["", ""],
    "rankingTop": [0, ""],
    "rankingOrder": [null, ""],
    "outputName": ["", "", ""],


    "gRNAIndex": [null, "", ""],
    "symbolIndex": [null, "", ""],
    "rankingIndex": [null, "", ""],

    "LibraryName": [null, ""]
}


function settingsSetOptions(trimBefore, trimAfter, adaptorSequencesBefore, adaptorSequencesAfter, partialMatches, searchSymbols, rankingTop, rankgingOrder, outputName){
    // each setting is saved as [value, status message, status color]
    settings["trimBefore"] = [trimBefore, ""]
    settings["trimAfter"] = [trimAfter, ""]
    settings["adaptorBefore"] = [adaptorSequencesBefore, ""]
    settings["adaptorAfter"] = [adaptorSequencesAfter, ""]
    settings["partialMatches"] = [partialMatches, ""]
    settings["searchSymbols"] = [searchSymbols, ""]
    settings["rankingTop"] = [rankingTop, ""]
    settings["rankingOrder"] = [rankgingOrder, ""]
    settings["outputName"] = [outputName, "", ""]
}

function settingsSwapSymbol(oldSymbol, newSymbol){
    const index = settings["searchSymbols"][0].indexOf(oldSymbol)
    settings["searchSymbols"][0][index] = newSymbol
}

function settingsSetIndexes(gRNAIndex, symbolIndex, rankingIndex){
    settings["gRNAIndex"] = [gRNAIndex, "", ""]
    settings["symbolIndex"] = [symbolIndex, "", ""]
    settings["rankingIndex"] = [rankingIndex, "", ""]
}

function settingsSetLibrarySettings(gRNAIndex, symbolIndex, rankingIndex, LibraryName){
    settings["gRNAIndex"] = [gRNAIndex, ""]
    settings["symbolIndex"] = [symbolIndex, ""]
    settings["rankingIndex"] = [rankingIndex, ""]
    settings["entries"] = [LibraryName, ""]
}

function settingsStatusUppdate(){
    settings = libraryStatus(settings)
    settings["rankingTop"][1] = rankTopStatus()
    settings["outputName"][2] = outputNameStatusColor()
    trimStatus()
}

function trimStatus(){
    settings["trimBefore"][1] = _checkTrim(settings["trimBefore"][0])
    settings["trimAfter"][1] = _checkTrim(settings["trimAfter"][0])
}

function _checkTrim(trim){
    if (trim < 0){
        return "var(--redColor)"
    }
    return "var(--plateBackroundColor)"
}

function rankTopStatus(){
    if (settings.rankingIndex[0] < 0){
        return "var(--redColor)"
    }
    return "var(--plateBackroundColor)"
}

function statusSearchSymbols(){
    return `Rows found: ${settings.searchSymbols[0].length}`
}

function outputNameStatusColor(){
    if (settings["outputName"][0] == ""){
        return "var(--redColor)"
    }
    return "var(--plateBackroundColor)"
}