import { ReactNode } from "react";

export const ActionButton = ({ label, handleClick }: { label: string | ReactNode; handleClick: () => void }) => {
    return <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-primary font-bold md:text-base text-sm gap-3 text-black hover:text-white dark:text-white dark:bg-primary bg-gray-200" onClick={handleClick}>
        {label} 
    </button>
}