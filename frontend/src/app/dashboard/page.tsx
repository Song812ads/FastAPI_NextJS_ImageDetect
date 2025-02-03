'use client';
import React , { useState, useEffect } from 'react'
import GoBack from './GoBack';
import { useRouter } from 'next/navigation';


const Dashboard = () => {
  const itemsPerPage = 5;
  const router = useRouter()
  const [data, setData] = useState<Array<{
    date: string;
    time: string;
    number_of_detected_box: number;
    path: string;
    id: number;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [colQuery, setcolQuery] = useState('')
  const [keyQuery, setkeyQuery] = useState('')
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/db_all"); // Backend API URL
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result); // Update state with data
        console.log(result)
      } catch {
          alert('Error fetching resource ')
        // alert("Something wrong when fetching resource")
        router.push("..")
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchData(); // Call the function on component mount
  }, []);

  const paginatedData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sendQuery = async ()=>{
    try {
      setCurrentPage(1)
      const response = await fetch(`/api/db_query?typeQuery=${colQuery}&query=${keyQuery}`); // Backend API URL
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result); // Update state with data
    } catch  {
      alert("Error send query")
      router.push("..")
    } finally {
      setLoading(false); // Set loading to false when done
    }
  }

  return (
    loading ? <p>Loading data from resource ... </p> :
    <div className="flex flex-col min-h-screen">
    <header className="bg-gray-800 text-white text-center py-8">
        <h1 className="text-4xl font-bold">AI JUNIOR TEST</h1>
        <p className="text-lg mt-2">People detection</p>
      </header>
      <main>
    <div className='py-8'>
    <div className="w-full flex justify-between items-center mb-3 mt-1 pl-3">
      <GoBack/>
      <div className="ml-3 flex items-center gap-2">
        {/* Column Selection Dropdown */}
        <select
          className="bg-white border border-slate-200 rounded p-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:border-slate-400 hover:border-slate-400"
          // value={selectedColumn}
          onChange={(e) => setcolQuery(e.target.value)}
          defaultValue='default'
        >
          <option value="default" disabled hidden>Select Column</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
          <option value="quantity">People detected quantity</option>
        </select>

        {/* Search Input */}
        <div className="w-full max-w-sm min-w-[200px] relative">
          <input
            className="bg-white w-full pr-11 h-10 pl-3 py-2 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
            placeholder={`Search in ...`}
            onChange={(e)=>setkeyQuery(e.target.value)}
            value={keyQuery}
          />
          <button
            className="absolute h-8 w-8 right-1 top-1 my-auto px-2 flex items-center bg-white rounded"
            type="button"
            onClick = {()=>sendQuery()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-8 h-8 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
 
<div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border">
  <table className="w-full text-left table-auto min-w-max">
    <thead>
      <tr>
        <th className="p-4 border-b border-slate-200 bg-slate-50">
          <p className="text-sm font-normal leading-none text-slate-500">
            ID
          </p>
        </th>
        <th className="p-4 border-b border-slate-200 bg-slate-50">
          <p className="text-sm font-normal leading-none text-slate-500">
            Date
          </p>
        </th>
        <th className="p-4 border-b border-slate-200 bg-slate-50">
          <p className="text-sm font-normal leading-none text-slate-500">
            Time
          </p>
        </th>
        <th className="p-4 border-b border-slate-200 bg-slate-50">
          <p className="text-sm font-normal leading-none text-slate-500">
            People detected quantity
          </p>
        </th>
        <th className="p-4 border-b border-slate-200 bg-slate-50">
          <p className="text-sm font-normal leading-none text-slate-500">
            Image path
          </p>
        </th>
        
        
      </tr>
    </thead>
    <tbody>
    { paginatedData  ?paginatedData.map((item)=>(
              <tr key = {item.id} className="hover:bg-slate-50 border-b border-slate-200">
              <td className="p-4 py-5">
                <p className="block font-semibold text-sm text-slate-800">{item.id}</p>
              </td>
              <td className="p-4 py-5">
                <p className="text-sm text-slate-500">{item.date}</p>
              </td>
              <td className="p-4 py-5">
                <p className="text-sm text-slate-500">{item.time}</p>
              </td>
              <td className="p-4 py-5">
                <p className="text-sm text-slate-500">{item.number_of_detected_box}</p>
              </td>
              
              <td className="p-4 py-5">
                <p className="text-sm text-slate-500">{item.path}</p>
              </td>
            </tr>
      )):<div>No data available</div>
    }
    </tbody>  

  </table>
 
  <div className="flex justify-between items-center px-4 py-3">
    <div className="text-sm text-slate-500">
    Showing <b>{(currentPage - 1) * 5 + 1}-{Math.min(currentPage * 5, 45)}</b> of {data?.length}
    </div>
    <div className="flex space-x-1">
      <button onClick={()=>setCurrentPage(currentPage == 1 ? currentPage : currentPage -1 )}className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease">
        Prev
      </button>
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)} 
            className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease"
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button onClick={()=>setCurrentPage(currentPage == totalPages ? currentPage : currentPage + 1 )} className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease">
        Next
      </button>
    </div>
  </div>
</div>
</div>
</main>
<footer className="bg-gray-800 text-white text-center py-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Logo */}
          <img
            src="/img/contact.png"
            alt="Logo"
            className="rounded-full"
            height={120}
            width={120}
          />

          {/* Contact Info */}
          <div className="text-sm text-center md:text-left">
            <p className="font-semibold text-lg">Tran Ngoc Minh Song</p>
            <p className="text-gray-300">📧 songtran91105712@gmail.com</p>
            <p className="text-gray-300">📞 0389543650</p>
          </div>
        </div>

      
      </footer>
 </div>

  )
}

export default Dashboard