
settings = {

}

function settingsSetAll(searchSymbols, partialMatches, libraryName, trimBefore, trimAfter, adaptorBefore, adaptorAfter, rankingTop, rankingOrder, outputName, gRNAIndex, symbolIndex, rankingIndex, synonyms, enableSynonyms){
    // each setting is saved as [value, status message, status color]
    settings["synonyms"] = [synonyms]
    
    settingsSetSettings(trimBefore, trimAfter, adaptorBefore, adaptorAfter, rankingTop, rankingOrder, outputName)
    settingsSetIndexes(gRNAIndex, symbolIndex, rankingIndex)
    settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms, libraryName)
}

function settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms, libraryName){
    settings["LibraryName"] = [libraryName ,libraryStatusNumberOfSymbols(settings)]
    settings["searchSymbols"] = [searchSymbols, statusSearchSymbols(searchSymbols)]
    settings["partialMatches"] = [partialMatches]
    settings["enableSynonyms"] = [enableSynonyms]
    settings["usedSynonyms"] = libraryStatusSynonyms(settings)
}

function settingsSetSettings(trimBefore, trimAfter, adaptorBefore, adaptorAfter, rankingTop, rankingOrder, outputName){
    settings["trimBefore"] = [trimBefore, _checkTrim(trimBefore)]
    settings["trimAfter"] = [trimAfter, _checkTrim(trimBefore)]
    settings["adaptorBefore"] = [adaptorBefore]
    settings["adaptorAfter"] = [adaptorAfter]

    settings["rankingTop"] = [rankingTop, rankTopStatus(rankingTop)]
    settings["rankingOrder"] = [rankingOrder]
    settings["outputName"] = [outputName, "" , outputNameStatusColor(outputName)]
}

function settingsSetIndexes(gRNAIndex, symbolIndex, rankingIndex){
    settings["gRNAIndex"] = [gRNAIndex, libraryStatusRNAIndex(gRNAIndex), ""]
    settings["symbolIndex"] = [symbolIndex, libraryStatusSymbolIndex(symbolIndex), ""]
    settings["rankingIndex"] = [rankingIndex, libraryStatusRankIndex(rankingIndex), ""]
}

function settingsToStr(){
    var text =  ""
    for (const setting in settings){
        if (["synonyms", "usedSynonyms"].includes(setting)){
            continue
        }
        text = text + ` ${setting} = ${settings[setting][0]}\n`
    }
    return `${text}`
}

function settingsSwapSymbol(oldSymbol, newSymbol){
    const index = settings["searchSymbols"][0].indexOf(oldSymbol)
    settings["searchSymbols"][0][index] = newSymbol
}

function _checkTrim(trim){
    if (trim < 0){
        return "var(--redColor)"
    }
    return "var(--plateBackroundColor)"
}

function rankTopStatus(rankingTop){
    if (rankingTop[0] < 0){
        return "var(--redColor)"
    }
    return "var(--plateBackroundColor)"
}

function statusSearchSymbols(searchSymbols){
    return `Rows found: ${searchSymbols.length}`
}

function outputNameStatusColor(outputName){
    if (outputName == ""){
        return "var(--redColor)"
    }
    return "var(--plateBackroundColor)"
}