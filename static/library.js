
var library = {
    "rows": {},
    "statusSearch": "",
}

function libraryStartScreen(settings){
    library.statusSearch = "Starting search"
    var st = performance.now()
    var textOutput = logicScreening(library, settings)
    library.statusSearch = `Done. Time to complete: ${Math.round((performance.now()-st)/1000 * 10) / 10}s`
    console.log(performance.now()-st)
    return textOutput
}

function libraryAddCustom(data, RNAcolumn, symbolColumn, RankColumn){
    rows = data.trim().split("\n").map((row) => row.split("\t"))
    rows.shift()
    settingsSetLibrarySettings(RNAcolumn-1, symbolColumn-1, RankColumn-1, library.rows.length)
    console.log(settings.symbolIndex)
    var rows = _getRowList(rows, settings)

    library["rows"] = rows
}

function libraryUppdate(data){
    rows = data["fileData"].trim().split("\n").map((row) => row.split("\t"))
    rows.shift()
    settingsSetIndexes(data["RNAColumn"]-1, data["symbolColumn"]-1, data["RankColumn"]-1)
    var rows = _getRowList(rows, settings)
    library["rows"] = rows
}

async function libraryGetLibraryData(fileName, settings){
    serverUppdateFile(fileName, settings).then((data)=>{
        libraryUppdate(data)
    })
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

function libraryStatusRNAIndex(gRNAIndex){
    if ((gRNAIndex == null) || gRNAIndex == "" || Object.values(library.rows).length == 0){
        return "X"
    }
    const regex = /^[ACGTU ]+$/
    for (let i = 0; i < library.rows.length; i++) {
        if (!regex.test(library.rows[i][gRNAIndex])){
            return "Found non ACGTU character"
        }
    }
    return "🗸"
}

function libraryStatusSymbolIndex(symbolIndex){
    if ((symbolIndex == null) || symbolIndex == "" || Object.values(library.rows).length == 0){
        return "X"
    }
    if (Object.values(library.rows)[0][symbolIndex])
        return "🗸"
    return "X"
}

function libraryStatusRankIndex(rankingIndex){
    if (Object.values(library.rows).length == 0){
        return "X"
    }
    if ((rankingIndex == null) || rankingIndex == "" ){
        return "🗸"
    }
    var cell = Object.values(library.rows)[0][rankingIndex]

    if (isNaN(cell))
        return "Found non number in column"
    if (  0 <= cell && cell <= 1){
        return "🗸"
    }
    return "X"
}

function libraryStatusNumberOfSymbols(settings){
    if (settings["libraryName"] == ""){
        return "Error no library selected"
    }
    var len = Object.keys(library.rows).length
    if (len == 0)
        return "Error no symbols found"
    return `Unique symbols found: ${len}`
}

function getSearchstatus(){
    return library["statusSearch"]
}

function libraryStatusSynonyms(settings){
    var status = {}
    settings.searchSymbols[0].forEach(symbol =>{
        symbol = symbol.trim()
        if (!(library.rows.hasOwnProperty(symbol))){
            var synonyms = _getSynonymsInLibrary(symbol, settings)
            status[symbol] = synonyms
            //if (synonyms.length != 0){
             //   status[symbol] = synonyms
            //}
        }
    })
    return status
}

function _getSynonyms(element, settings){
    for (let i = 0; i < settings["synonyms"][0].length; i++) {
        if (settings["synonyms"][0][i].includes(element)){
            return settings["synonyms"][0][i].filter(symbol => symbol !== element)
        }
            
    }
    return []
}

function _getSynonymsInLibrary(element, setting){
    var synonymList = _getSynonyms(element, setting)
    synonymList = synonymList.filter(synonym => library.rows.hasOwnProperty(synonym))
    return synonymList
}
