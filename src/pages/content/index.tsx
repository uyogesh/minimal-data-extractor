import { createRoot } from 'react-dom/client';
import './style.css' 
import { isSharehubFloorsheetPage } from '@src/utils/content-script-utils';
import { GetData } from '@src/components/GetData';

let buttonInjected = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);
    if (message.type === 'BACKGROUND_TO_CONTENT_SCRIPT' && message.payload.action === 'DOWNLOAD_CSV') {
        const {csvContent, date} = message.payload.data;
        const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_data_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    }
})

const handleDOMLoaded = async () => {
  console.log("Extension: ", document.location.href)
  if(!isSharehubFloorsheetPage(document.location.href)) return
  console.log("Extension passed ", 1)
  let targetElem = document.querySelector('.custom-box') as HTMLElement
  console.log("Extension passed ", 2)
  targetElem = targetElem?.firstChild as HTMLElement
  console.log("Extension passed ", 3)
  targetElem = targetElem?.firstChild as HTMLElement
  console.log("Extension passed ", 4)
  if (!targetElem) return
  const renderRoot = document.createElement("div")
  renderRoot.id = "data-extractor-render-root"
  targetElem.appendChild(renderRoot)
  console.log("Extension passed ", 5)
  createRoot(renderRoot).render(<GetData />)
  buttonInjected = true;
}

if (document.readyState === "loading") {
  // Loading hasn't finished yet
  document.addEventListener("DOMContentLoaded", handleDOMLoaded);
} else {
  // `DOMContentLoaded` has already fired
  handleDOMLoaded();
}

setInterval(() => {
  if (buttonInjected) return
  console.log("Checking to inject button...")
  handleDOMLoaded();
}, 2000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  // Handle messages from background script if needed
  if (message.type === "BACKGROUND_TO_CONTENT_SCRIPT") {
    // Handle the message accordingly
    if (message.payload.action === "DOWNLOAD_CSV") {
      const { csvContent, date } = message.payload.data;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted_data_${date}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
});