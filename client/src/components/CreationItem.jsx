import React, { useState } from 'react'
import Markdown from 'react-markdown'

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false) // ✅ FIXED initialization

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition"
    >
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-gray-800 font-semibold">{item.prompt}</h2>
          <p className="text-gray-500 text-xs">
            {item.type} • {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-1 rounded-full text-xs font-medium">
          {item.type}
        </button>
      </div>

      {expanded && (
        <div className="mt-3">
          {item.type === 'image' ? (
            <div>
              <img
                src={item.content}
                alt="creation"
                className="mt-3 w-full max-w-md rounded-md shadow-sm"
              />
            </div>
          ) : (
            <div className="mt-3 max-h-64 overflow-y-auto text-sm text-slate-700 bg-gray-50 p-3 rounded-md">
                <div className='reset-tw'>
                    <Markdown>{item.content}</Markdown>
                   </div>
                </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
