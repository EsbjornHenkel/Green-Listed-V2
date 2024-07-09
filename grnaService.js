
//
// GRNA logic for searches etc
// Used by the UI
//

const SETTINGS_URL = 'settingsDefault.json'
const LIBRARIES_URL = 'settingsLibraries.json'


// Selects/activates a library
// does pre-processing
async function selectLibrary(libraryName){
    //try {
        //console.log(`grnaService.selectLibrary(${libraryName}) reading....`)
        
        // Read library data - can be 80000 rows...
        const libraries = await fetchJsonFile(LIBRARIES_URL)
        const libSettings = libraries.find(library => library.name == libraryName)
        const libData = await fetchTextFile(libSettings.fileName)

        // read synonyms
        const synonymData = await fetchTextFile(libSettings.synonymFileName)
        // pre-process to create search structure
        libraryUpdate(libSettings, libData,  synonymData)

        //console.log(`grnaService.selectLibrary(${libraryName}) done.`)
        return libSettings
        
    //} catch (error) {
        console.error(`grnaService.selectLibrary failed:\n:${error}`)
    //}
}


// returns settings json, see settingsDefault.json for an example
async function getDefaultSettings() {
        try{
            const settings = await fetchJsonFile(SETTINGS_URL)
            return settings
        }
        catch(error){
            throw new Error(`GRNAService.getDefaultSettings(${SETTINGS_URL}) invalid callback:\n ${error.message}`)
        }
        
}

async function getLibraryNames() {
    const libraries = await fetchJsonFile(LIBRARIES_URL)
    const libraryNames = libraries.map(library => library.name)
    return libraryNames
}

// Start the screening. 
// Settings contains all param, see default settings in settingsDefault.json
function runScreening(settings){
    try{
        return libraryStartScreen(settings)
    }
    catch(error){
        throw error
    }
}

function addCustomLibraryData(data, symbolColumn){
    return libraryCustomData(data, symbolColumn)
}

// ---------------------------- Status functions ------------------------------------------------


// Return a string describing the library status - for example "Unique symbols found: 19674"
function getLibraryUniqueSymbols(){
    return libraryUniqueSymbols()
}

// Return a map with symbols not found (keys) and an synonym used (value - often Null)
function getUsedSynonyms(searchSymbols){
    return libraryStatusSynonyms(searchSymbols)
}

// Return string with status of screening run- for example "Done. Time to complete: 0.2s"
function getScreeningStatus(){
    return libraryStatusScreening()
}