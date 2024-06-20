import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './App.css'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default App
