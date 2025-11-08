import { useCallback, useEffect, useMemo, useState } from "react"
import { FetchDataState } from "./types"
import { ActionButton } from "./sharehub/ActionButton"
import { sendMessageToBackground } from "@src/messaging"
import { trimFixedDateString } from "@src/utils/content-script-utils"

export const GetData = () => {
    const [fetchDataState, setFetchDataState] = useState(FetchDataState.Idle)
    const [metaData, setMetaData] = useState({})

    const fetchMetaData = useCallback(() => {
        const lastPageElemSiblings = document.querySelector("[role='navigation'] ul")?.children as HTMLCollection
        const lastPageComp = lastPageElemSiblings[lastPageElemSiblings.length - 2]
        const numPages = parseInt((lastPageComp as HTMLElement).innerText)
        // const today = new Date()
        // const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
        // let dateElem = (document.querySelector("[aria-controls='radix-:r3:'] span") as HTMLElement).innerText
        // if (dateElem === "Select date")
        // dateElem = todayString
        const tableCells = (document.querySelector("table tbody tr") as HTMLElement).children
        const dateElem = (tableCells[6] as HTMLElement).innerText.split(",")[0].trim()

        setMetaData({
            date: trimFixedDateString(dateElem),
            numPages
        })

        sendMessageToBackground({
            type: 'CONTENT_SCRIPT_TO_BACKGROUND',
            payload: {
                action: "START_DATA_EXTRACTION",
                data: {
                    date: trimFixedDateString(dateElem),
                    numPages,
                }
            }
        })
    }, [])

    const btnLable = useMemo(() => {
        if (fetchDataState === FetchDataState.GettingMetadata) {
            return (<div>
                Getting Metadata ...
            </div>)
        }
        if (fetchDataState === FetchDataState.Idle) {
            return (
                <div className="flex gap-2 justify-center items-center">
                    Get
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play" viewBox="0 0 16 16">
                        <path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z"></path>
                    </svg>
                </div>
            )
        }
        if (fetchDataState === FetchDataState.InProgress) {
            <div className="flex gap-2 justify-center items-center">
                Pause
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause" viewBox="0 0 16 16">
                <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"></path>
                </svg>
            </div>
        }
        if (fetchDataState === FetchDataState.Completed) {
            <div className="flex gap-2 justify-center items-center">
                Done
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"></path>
                </svg>
            </div>
        }
    }, [fetchDataState])

    const handleClick = useCallback( () => {
        if (fetchDataState === FetchDataState.Completed) return
        if (fetchDataState === FetchDataState.Idle) {
            setFetchDataState(FetchDataState.GettingMetadata)
            fetchMetaData()
        }
    }, [fetchDataState])

    return (<ActionButton label={btnLable} handleClick={handleClick}/>)
}