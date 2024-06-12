


function serverUppdateFile(libraryFile, settings, fileIndex){
    
    const payload = {libraryFile: libraryFile};
    fetch('/loadTxtFile', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
    })
    .then(data => {
        libraryUppdate(data, settings, fileIndex)
    })
    
}


