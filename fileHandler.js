


async function fetchJsonFile(url) {
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

async function fetchTextFile(url) {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
        }

        // Ensure content type is text/plain
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('text/plain')) {
            throw new Error(`GRNAService._fetchJsonFile(${url}) Expected text/plain content type, but received: ${contentType}`);
        }

        return await response.text();
    } catch (error) {
        console.error(`GRNAService._fetchJsonFile(${url}) Error fetching text file (${url}):`, error)
        throw error
    }
}
