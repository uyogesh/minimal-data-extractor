export const getFloorsheetData = async (date: string, page: number, size=100) => {
    let baseUrl = `https://sharehubnepal.com/live/api/v2/floorsheet?Size=${size}&date=${date}`;
    if (page > 1) baseUrl += `&page=${page}`;
    const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching floorsheet data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}