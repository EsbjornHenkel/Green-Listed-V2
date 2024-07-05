
settings = {
    "trimBefore": null, 
    "trimAfter": null, 
    "adaptorBefore": null,
    "adaptorAfter": null,

    "partialMatches": null,     
    "rankingTop": null,

    "outputName": null,

    "searchSymbols": null,       

    "enableSynonyms": true,
    "synonyms": null
}

function settingsSetAll(searchSymbols, partialMatches, trimBefore, trimAfter, adaptorBefore, adaptorAfter, rankingTop, rankingOrder, outputName, RNAIndex, symbolIndex, rankingIndex, enableSynonyms){
    settingsSetSettings(trimBefore, trimAfter, adaptorBefore, adaptorAfter, rankingTop, rankingOrder, outputName)
    settingsSetIndexes(RNAIndex, symbolIndex, rankingIndex)
    settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms)
}

function settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms){
    settings["searchSymbols"] = searchSymbols
    settings["partialMatches"] = partialMatches
    settings["enableSynonyms"] = enableSynonyms
}

function settingsSetSettings(trimBefore, trimAfter, adaptorBefore, adaptorAfter, rankingTop, rankingOrder, outputName){
    settings["trimBefore"] = trimBefore
    settings["trimAfter"] = trimAfter
    settings["adaptorBefore"] = adaptorBefore
    settings["adaptorAfter"] = adaptorAfter

    settings["rankingTop"] = rankingTop
    settings["rankingOrder"] = rankingOrder
    settings["outputName"] = outputName
}

function settingsSetIndexes(RNAColumn, symbolColumn, rankingColumn){
    settings["RNAColumn"] = RNAColumn
    settings["symbolColumn"] = symbolColumn
    settings["rankingColumn"] = rankingColumn
}

function settingsSwapSymbol(oldSymbol, newSymbol){
    const index = settings["searchSymbols"].indexOf(oldSymbol)
    settings["searchSymbols"][index] = newSymbol
}

function settingsToStr(){
    var text =  ""
    for (const setting in settings){
        if (["synonyms", "usedSynonyms"].includes(setting)){
            continue
        }
        text = text + ` ${setting} = ${settings[setting]}\n`
    }
    return `${text}`
}


// ------------------- STATUS ---------------

function settingsStatusSymbolsFound(){
    settings
}

