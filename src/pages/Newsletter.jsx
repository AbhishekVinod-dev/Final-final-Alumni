import { useState } from 'react'
import { db } from "../firebase";
import { collection, addDoc } from 'firebase/firestore'

export default function Newsletter(){
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const subscribe = async(e)=> {
    e.preventDefault()
    try {
      await addDoc(collection(db,'subscribers'), { email, createdAt: Date.now() })
      setMsg('Subscribed successfully!')
      setEmail('')
    } catch(err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Subscribe to Newsletter</h2>
      <form className="card grid gap-3" onSubmit={subscribe}>
        <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <button className="btn">Subscribe</button>
        {msg && <p className="text-sm text-gray-300">{msg}</p>}
      </form>
    </div>
  )
}
