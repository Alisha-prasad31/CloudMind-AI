import React, { useEffect, useState } from 'react'
import { dummyCreationData } from '../assets/assets'
import { Gem, Sparkle } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading,setLoading]=useState(true)
  const {getToken}=useAuth()

  const getDashboardData = async () => {
    try {
      const {data} =await axios.get('/api/user/get-user-creations',{
        headers:{Authorization:`Bearer ${await getToken()}`}
      })

      if (data.success){
        setCreations(data.creations)
      }else{
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
      
    }
    setLoading(false)
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex flex-wrap gap-6">
        {/* Total Creations Card */}
        <div className="flex justify-between items-center w-72 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Creations</p>
            <h2 className="text-3xl font-bold text-gray-800">{creations.length}</h2>
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <Sparkle className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="flex justify-between items-center w-72 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Plan</p>
            <h2 className="text-3xl font-bold text-gray-800">
              <Protect plan="premium" fallback="Free">Premium</Protect>
            </h2>
          </div>
          <div className="bg-purple-50 p-3 rounded-full">
            <Gem className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>
      {
        loading ?
        (
          <div className='flex justify-center items-center h-3/4'>
            <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
          </div>

        ):(
          <div className='space-y-3'>
        <p className='mt-6 mb-4'>Recent Creations</p>
        {
          creations.map((item)=> <CreationItem key={item.id} item={item}/>)
        }

      </div>

        )
      }
      
    </div>
  )
}

export default Dashboard
