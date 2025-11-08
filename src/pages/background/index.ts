
import { getFloorsheetData } from '@src/api';
import { saveCurrentPage, getCurrentPage, saveBulkData } from '../../utils/indexeddb-utils';
export type PageMetaData = {
    Size: number;
    page: number;
    total: number;
    date: string;
}

const setUpAlarm = (data: { numPages: number; date: string }) => {
    chrome.alarms.get('dataExtractionAlarm', (alarm) => {
        if (!alarm) {
            saveCurrentPage({
                Size: 100,
                page: 1,
                total: Math.ceil(data.numPages / 10),
                date: data.date
            } as PageMetaData)
            chrome.alarms.create('dataExtractionAlarm', { periodInMinutes: 0.5 });
        } else {
            console.log('Alarm already exists:', alarm);
        }
    });
}

const fetchAndStoreData = async () => {
    const page = await getCurrentPage() as PageMetaData;
        const data = await getFloorsheetData(page.date, page.page, page.Size);

        saveBulkData(data.data.content).then(() => {
            console.log('Data saved to indexedDB');
        }).catch(console.error);

        // Example: Save current page info
        const currentPage = {
            ...page,
            page: page.page + 1,
        };
        console.log('Current Page Info:', currentPage);
        if (currentPage.page > currentPage.total) {
            chrome.alarms.clear('dataExtractionAlarm');
            console.log('Data extraction completed. Alarm cleared.');
            return;
        }
        saveCurrentPage(currentPage).then(() => {
            console.log('Current page saved to indexedDB');
        }).catch(console.error);
}


chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'dataExtractionAlarm') {
        console.log('Data extraction alarm triggered');
        // Example: Simulate data extraction and save to indexedDB
        
        for (let i = 0; i < 10; i++) {
            await fetchAndStoreData();
            await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second between fetches
        }
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message in background script:', message);
    if (message.type === 'CONTENT_SCRIPT_TO_BACKGROUND') {
        const action = message.payload.action;
        console.log(message);
        if (action === 'START_DATA_EXTRACTION') {
            console.log('Starting data extraction...');
            // Add logic to start data extraction
            setUpAlarm(message.payload.data);
            sendResponse({ status: 'Data extraction started' });
        } else if (action === 'STOP_DATA_EXTRACTION') {
            console.log('Stopping data extraction...');
            // Add logic to stop data extraction
            sendResponse({ status: 'Data extraction stopped' });
        } else {
            sendResponse({ status: 'Unknown action' });
        }
    }
    return true; // Indicates that we will send a response asynchronously
});