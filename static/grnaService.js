


async function serverUppdateFile(libraryName){

    try {
        const librariesResponse = await fetch('/getLibraries')
        const libraries = await librariesResponse.json()
        const library = libraries.find(library => library.name == libraryName)
    
        const payload = {libraryFileName: library.fileName}

        try {
            
            const response = await fetch('/getLibraryData', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!response.ok) {
                throw new Error('/loadLibrary Network response was not ok');
            }
            
            const fileData = await response.text()
            library["fileData"] = fileData
            return library
        } catch (error) {
            console.error('/loadLibrary There has been a problem with your fetch operation:', error);
        }
    } catch (error) {
        console.error('grnaService serverUppdateFile There has been a problem with your fetch operation:', error);
    }
}

async function getDefaultSettings(){
    try {
        const settingsResponse = await fetch('/getSettings')
        const settings = await settingsResponse.json()

        const librariesResponse = await fetch('/getLibraries')
        if (!settingsResponse.ok) {
            throw new Error('/getDefaultSettings Network response was not ok');
        }
        
        const libraries = await librariesResponse.json();
        settings["libraryNames"] = libraries.map(library => library.name)
        return settings
    } catch (error) {
        console.error('/getDefaultSettings There has been a problem with your fetch operation:', error);
    }
}


