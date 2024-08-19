// 
// GRNA 2.0 - 2024
//
// Settings for the UI - essentially all the fields in the UI
// Used in index.js - NOT the service side of the app
//


settings = {
    "trimBefore": null,
    "trimAfter": null,
    "adapterBefore": null,
    "adapterAfter": null,

    "partialMatches": null,
    "rankingTop": null,

    "outputName": null,

    "searchSymbols": null,

    "synonyms": null
}

function SET_settingsSetAll(searchSymbols, partialMatches, trimBefore, trimAfter, adapterBefore, adapterAfter, rankingTop, rankingOrder, outputName, RNAIndex, symbolIndex, rankingIndex, enableSynonyms, defaultSynonym) {
    SET_settingsSetSettings(trimBefore, trimAfter, adapterBefore, adapterAfter, rankingTop, rankingOrder, outputName)
    SET_settingsSetIndexes(RNAIndex, symbolIndex, rankingIndex)
    SET_settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms)
    settings["synonymName"] = defaultSynonym
}

function SET_settingsSetLibrary(searchSymbols, partialMatches, enableSynonyms) {
    settings["searchSymbols"] = searchSymbols
    settings["partialMatches"] = partialMatches
    settings["enableSynonyms"] = enableSynonyms
}

function SET_settingsSetSettings(trimBefore, trimAfter, adapterBefore, adapterAfter, rankingTop, rankingOrder, outputName) {
    settings["trimBefore"] = trimBefore
    settings["trimAfter"] = trimAfter
    settings["adapterBefore"] = adapterBefore
    settings["adapterAfter"] = adapterAfter

    settings["rankingTop"] = rankingTop
    settings["rankingOrder"] = rankingOrder
    settings["outputName"] = outputName
}

function SET_settingsSetIndexes(RNAColumn, symbolColumn, rankingColumn) {
    settings["RNAColumn"] = RNAColumn
    settings["symbolColumn"] = symbolColumn
    settings["rankingColumn"] = rankingColumn
}


function SET_settingsToStr() {
    const date = new Date()
    var text = `Library: ${settings.libraryName}, Date: ${date.toLocaleString()}\n`
    for (const setting in settings) {
        if (["synonyms", "usedSynonyms"].includes(setting)) {
            continue
        }
        text = text + ` ${setting} = ${settings[setting]}\n`
    }
    return `${text}`
}
