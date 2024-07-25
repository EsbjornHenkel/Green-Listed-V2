
//
// GRNA logic for searches etc
// Used by the UI
//

const SETTINGS_URL = 'settingsDefault.json'
const LIBRARIES_URL = 'settingsLibraries.json'


// Selects/activates a library
// does pre-processing
async function SER_selectLibrary(libraryName){
    try {
        //console.log(`grnaService.selectLibrary(${libraryName}) reading....`)
        
        // Read library data - can be 80000 rows...
        const libraries = await FH_fetchJsonFile(LIBRARIES_URL)
        const libSettings = libraries.find(library => library.name == libraryName)
        
        if (!libSettings){
            throw new Error(`Cant get librarySettings from name: ${libraryName}`)
        }
        const libData = await FH_fetchTextFile(libSettings.fileName)
        // read synonyms
        const synonymData = await FH_fetchTextFile(libSettings.synonymFileName)
        // pre-process to create search structure
        LIB_libraryUpdate(libSettings, libData,  synonymData)

        //console.log(`grnaService.selectLibrary(${libraryName}) done.`)
        return libSettings
        
    } catch (error) {
        throw new Error(`grnaService.selectLibrary failed:\n:${error}`)
    }
}


// returns settings json, see settingsDefault.json for an example
async function SET_getDefaultSettings() {
        try{
            const settings = await FH_fetchJsonFile(SETTINGS_URL)
            return settings
        }
        catch(error){
            throw new Error(`GRNAService.getDefaultSettings(${SETTINGS_URL}) invalid callback:\n ${error.message}`)
        }
        
}

async function SER_getLibraryNames() {
    const libraries = await FH_fetchJsonFile(LIBRARIES_URL)
    const libraryNames = libraries.map(library => library.name)
    return libraryNames
}

// Start the screening. 
// Settings contains all param, see default settings in settingsDefault.json
function SER_runScreening(settings){
    try{
        return LIB_libraryStartScreen(settings)
    }
    catch(error){
        throw error
    }
}

function SER_addCustomLibraryData(data, symbolColumn){
    return LIB_libraryCustomData(data, symbolColumn)
}

// ---------------------------- Status functions ------------------------------------------------


// Return a string describing the library status - for example "Unique symbols found: 19674"
function SER_getLibraryUniqueSymbols(){
    return LIB_libraryUniqueSymbols()
}

// Return a map with symbols not found (keys) and an synonym used (value - often Null)
function SER_getSynonymMap(searchSymbols){
    return LIB_libraryStatusSynonymsDisplay(searchSymbols)
}

// Return string with status of screening run- for example "Done. Time to complete: 0.2s"
function SER_getScreeningStatus(){
    return LIB_libraryStatusScreening()
}