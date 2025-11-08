
import { getFloorsheetData } from '@src/api';
import { saveCurrentPage, getCurrentPage, saveBulkData, getAllData } from '../../utils/indexeddb-utils';

export type PageMetaData = {
    Size: number;
    page: number;
    total: number;
    date: string;
    tabId: number;
}

const setUpAlarm = (data: { numPages: number; date: string }, tabId?: number) => {
    chrome.alarms.get('dataExtractionAlarm', (alarm) => {
        
        if (!alarm) {
            saveCurrentPage({
                id: `date-${data.date}-page-1`,
                Size: 100,
                page: 1,
                total: Math.ceil(data.numPages / 10),
                date: data.date,
                tabId: tabId || -1,
            } as PageMetaData)
            chrome.alarms.create('dataExtractionAlarm', { periodInMinutes: 0.5 });
        } else {
            console.log('Alarm already exists:', alarm);
        }
    });
}

const fetchAndStoreData = async () => {
    const pages = await getCurrentPage() as PageMetaData[];
    const page = pages.sort((a: PageMetaData, b: PageMetaData) => b.page - a.page)[0];

    if (!page) {
        console.error('No page info found in indexedDB');
        return;
    }
        const data = await getFloorsheetData(page.date, page.page, page.Size);

        saveBulkData(data.data.content).then(() => {
            console.log('Data saved to indexedDB');
        }).catch(console.error);

        // Example: Save current page info
        const currentPage = {
            ...page,
            id: `date-${page.date}-page-${page.page + 1}`,
            page: page.page + 1,
        };
        console.log('Current Page Info:', currentPage);
        if (currentPage.page > currentPage.total) {
            chrome.alarms.clear('dataExtractionAlarm');
            await exportSavedDataToCSV(currentPage.date, currentPage.tabId);
            console.log('Data extraction completed. Alarm cleared.');
            return false;
        }
        saveCurrentPage(currentPage).then(() => {
            console.log('Current page saved to indexedDB');
        }).catch(console.error);
        return true;
}


chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'dataExtractionAlarm') {
        console.log('Data extraction alarm triggered');
        // Example: Simulate data extraction and save to indexedDB
        
        for (let i = 0; i < 10; i++) {
            const shouldContinue = await fetchAndStoreData();
            if (!shouldContinue) break;
            await new Promise(resolve => setTimeout(resolve, 2000)); // wait for 2 seconds between fetches
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
            setUpAlarm(message.payload.data, sender.tab?.id);
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


const exportSavedDataToCSV = async (date: string, tabId: number) => {
    const data = await getAllData() as Record<string, string|number>[];
    if (!data || data.length === 0) {
        console.error('No data found in indexedDB to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => headers.map(field => row[field]).join(','))
    ];

    const csvString = csvRows.join('\n');
    chrome.tabs.sendMessage(tabId, {
        type: 'BACKGROUND_TO_CONTENT_SCRIPT',
        payload: {
            action: 'DOWNLOAD_CSV',
            data: {
                csvContent: csvString,
                date,
            }
        }
    });
};
