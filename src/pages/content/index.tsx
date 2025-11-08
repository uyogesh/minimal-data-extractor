import { createRoot } from 'react-dom/client';
import './style.css' 
import { isSharehubFloorsheetPage } from '@src/utils/content-script-utils';
import { ActionButton } from '@src/components/sharehub/ActionButton';
import { GetData } from '@src/components/GetData';


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

}

if (document.readyState === "loading") {
  // Loading hasn't finished yet
  document.addEventListener("DOMContentLoaded", handleDOMLoaded);
} else {
  // `DOMContentLoaded` has already fired
  handleDOMLoaded();
}