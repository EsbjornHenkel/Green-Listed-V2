
const SETTINGS_URL = 'settingsDefault.json';
const LIBRARIES_URL = 'settingsLibraries.json';

// Return a libarary jsen for the given linname, with data in "fileData"
async function searchLibrary(libraryName){
    try {
        const libraries = await _fetchJsonFile(LIBRARIES_URL)
        const library = libraries.find(library => library.name == libraryName)
        const fileData = await _fetchTextFile(library.fileName)

        library["fileData"] = fileData

        console.log(`grnaService.searchLibrary(${libraryName}) loaded from file '${library.fileName}'. ${fileData.split(/\r\n|\r|\n/).length} rows.` )

        return library
        
    } catch (error) {
        console.error(`grnaService.searchLibrary (${libraryName}) serverUppdateFile There has been a problem with your fetch operation:`, error);
    }
}

async function getDefaultSettings() {
   
        const settings = await _fetchJsonFile(SETTINGS_URL)
        const libraries = await _fetchJsonFile(LIBRARIES_URL)

        // Add the library names to the settings object
        settings["libraryNames"] = libraries.map(library => library.name)

        return settings;
}

// --------------------------------------------------------------------------------------------

async function _fetchJsonFile(url) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status} ${response.statusText})`)
        }
        // Ensure content type is application/json
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`GRNAService._fetchJsonFile(${url}) Expected application/json content type, but received: ${contentType}`)
        }
        return await response.json()
    } catch (error) {
        console.error(`GRNAService._fetchJsonFile(${url}) failed to fetch :`, error)
        throw error 
    }
}

async function _fetchTextFile(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
        }

        // Ensure content type is text/plain
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/plain')) {
            throw new Error(`GRNAService._fetchJsonFile(${url}) Expected text/plain content type, but received: ${contentType}`);
        }

        return await response.text();
    } catch (error) {
        console.error(`GRNAService._fetchJsonFile(${url}) Error fetching text file (${url}):`, error);
        throw error; 
    }
}



