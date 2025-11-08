type Message = {
    type: 'CONTENT_SCRIPT_TO_BACKGROUND';
    payload: {
        action: 'START_DATA_EXTRACTION' | 'STOP_DATA_EXTRACTION';
        [key: string]: unknown;
    }
}
export const sendMessageToBackground = async (message: Message) => {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(response);
            });
        } catch (error) {
            reject(error);
        }
    });
}