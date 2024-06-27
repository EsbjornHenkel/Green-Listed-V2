


async function serverUppdateFile(libraryName){
    const payload = {libraryName: libraryName}
    try {
        
        const response = await fetch('/loadLibrary', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        if (!response.ok) {
            throw new Error('/loadLibrary Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('/loadLibrary There has been a problem with your fetch operation:', error);
    }
}


async function getDefaultSettings(){
    try {
        
        const response = await fetch('/defaultSettings')
        if (!response.ok) {
            throw new Error('/loadLibrary Network response was not ok');
        }
        const settings = await response.json();
        return settings
    } catch (error) {
        console.error('/loadLibrary There has been a problem with your fetch operation:', error);
    }
}



