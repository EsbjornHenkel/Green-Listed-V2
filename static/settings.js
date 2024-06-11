
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

function settingsReset(){
    settings = {
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

function settingsSetLibrarySettings(gRNAIndex, symbolIndex, rankingIndex){
    settings["gRNAIndex"] = [gRNAIndex, ""]
    settings["symbolIndex"] = [symbolIndex, ""]
    settings["rankingIndex"] = [rankingIndex, ""]
}

function settingsStatusUppdate(){
    settings = libraryStatus(settings)
}

function statusSearchSymbols(){
    return `Rows found: ${settings.searchSymbols[0].length}`
}