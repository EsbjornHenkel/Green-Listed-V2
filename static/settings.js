

var settings = {
    "trimBefore": [0, ""], 
    "trimAfter": [0, ""], 
    "adaptorBefore": ["", ""],
    "adaptorAfter": ["", ""],
    "partialMatches": [false, ""],
    "searchSymbols": ["", ""],
    "rankingTop": [0, ""],

    "gRNAIndex": [null, ""],
    "symbolIndex": [null, ""],
    "rankingIndex": [null, ""],

    "entries": [null, ""]
}


function settingsSetOptions(trimBefore, trimAfter, adaptorSequencesBefore, adaptorSequencesAfter, partialMatches, searchSymbols, rankingTop){
    settings["trimBefore"] = [trimBefore, ""]
    settings["trimAfter"] = [trimAfter, ""]
    settings["adaptorBefore"] = [adaptorSequencesBefore, ""]
    settings["adaptorAfter"] = [adaptorSequencesAfter, ""]
    settings["partialMatches"] = [partialMatches, ""]
    settings["searchSymbols"] = [searchSymbols, ""]
    settings["rankingTop"] = [rankingTop, ""]
}

function settingsSetIndexes(gRNAIndex, symbolIndex, rankingIndex){
    settings["gRNAIndex"] = [gRNAIndex, ""]
    settings["symbolIndex"] = [symbolIndex, ""]
    settings["rankingIndex"] = [rankingIndex, ""]
}

function settingsSetLibrarySettings(gRNAIndex, symbolIndex, rankingIndex, entries){
    settings["gRNAIndex"] = [gRNAIndex, ""]
    settings["symbolIndex"] = [symbolIndex, ""]
    settings["rankingIndex"] = [rankingIndex, ""]
    settings["entries"] = [entries, ""]
}

function settingsStatusUppdate(){
    settings = libraryStatus(settings)
    settings["rankingTop"][1] = rankTopStatus()
    trimStatus()
}

function trimStatus(){
    settings["trimBefore"][1] = _checkTrim(settings["trimBefore"][0])
    settings["trimAfter"][1] = _checkTrim(settings["trimAfter"][0])
}

function _checkTrim(trim){
    if (trim < 0){
        return "red"
    }
    return "white"
}

function rankTopStatus(){
    if (settings.rankingIndex[0] < 0){
        return "red"
    }
    return "white"
}

function statusSearchSymbols(){
    return `Rows found: ${settings.searchSymbols[0].length}`
}