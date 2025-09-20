import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading,setLoading]=useState(true)
  const {getToken}=useAuth()

  const fetchCreations = async () => {
    try {
      const {data}=await axios.get('/api/user/get-published-creations',{headers:{Authorization:`Bearer ${await getToken()}`}})
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

  const imageLikeToggle= async(id)=>{
    try {
      const {data}=await axios.post('/api/user/toggle-like-creation',{id},{headers:{Authorization:`Bearer ${await getToken()}`}})

      if(data.success){
        toast.success(data.message)
        await fetchCreations()
      }else{
        toast.error(data.message)
      }
      
      
    } catch (error) {
      toast.error(error.message)
      
    }

  }

  useEffect(() => {
    if (user) {
      fetchCreations()
    }
  }, [user])

  const toggleLike = (index) => {
    setCreations((prev) => {
      const newCreations = [...prev]
      const likes = newCreations[index].likes
      if (likes.includes(user.id)) {
        // Remove like
        newCreations[index].likes = likes.filter((id) => id !== user.id)
      } else {
        // Add like
        newCreations[index].likes = [...likes, user.id]
      }
      return newCreations
    })
  }

  return !loading ? (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h2 className="text-xl font-semibold">Creations</h2>
      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll p-2 flex flex-wrap gap-4">
        {creations.map((creation, index) => (
          <div
            key={index}
            className="relative group w-full sm:w-[48%] lg:w-[32%] rounded-lg overflow-hidden"
          >
            <img
              src={creation.content}
              alt=""
              className="w-full h-60 object-cover rounded-lg"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>

            {/* Content over image */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white z-10">
              <p className="text-sm max-w-[70%]">{creation.prompt}</p>
              <div className="flex items-center gap-1">
                <p>{creation.likes.length}</p>
                <Heart
                  onClick={() => imageLikeToggle(creation.id)}
                  className={`w-5 h-5 cursor-pointer ${
                    creation.likes.includes(user?.id)
                      ? 'fill-red-500 text-red-600'
                      : 'text-white'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ):(
    <div className='flex justify-center items-center h-full'>
      <span className='w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin'></span>
    </div>
  )
}

export default Community
