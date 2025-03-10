// 
// GRNA 2.0 - 2024
// 
// Handles all file access (via urls)
// Used by grnaService
//

async function FH_fetchJsonFile(url) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status} ${response.statusText})`)
        }
        // Ensure content type is application/json
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`fileHandler.fetchJsonFile(${url}) Expected application/json content type, but received:\n ${contentType}`)
        }
        return await response.json()
    } catch (error) {
        throw new Error(`fileHandler.fetchJsonFile(${url}) failed to fetch:\n ${error}`)
    }
}

async function FH_fetchTextFile(url) {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
        }

        // Ensure content type is text/plain
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('text/plain')) {
            throw new Error(`fileHandler.fetchTextFile(${url}) Expected text/plain content type, but received: ${contentType}`)
        }

        return await response.text()
    } catch (error) {
        throw new Error(`fileHandler.fetchTextFile(${url}) Error fetching text file (${url}):\n ${error}`)
    }
}

async function FH_fetchHTMLFile(url) {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
        }
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('text/html')) {
            throw new Error(`fileHandler.fetchHTMLFile(${url}) Expected text/html content type, but received: ${contentType}`)
        }

        const txt = await response.text()
        const parser = new DOMParser();
        const doc = parser.parseFromString(txt, 'text/html');

        return doc
    } catch (error) {
        throw new Error(`fileHandler.fetchTextFile(${url}) Error fetching text file (${url}):\n ${error}`)
    }
}