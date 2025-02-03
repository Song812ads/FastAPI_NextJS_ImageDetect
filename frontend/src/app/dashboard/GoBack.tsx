'react client';
import React from 'react'
import { useRouter } from "next/navigation";
const GoBack = () => {
  const router = useRouter()
  return (
    <button onClick = {()=>router.push("..")} className="px-4 py-2 border border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition duration-300">
        Go back
      </button>
  )
}

export default GoBack