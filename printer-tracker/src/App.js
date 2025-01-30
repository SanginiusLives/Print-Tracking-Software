import './App.css';
// import DragNDrop from './DragNDrop';
import React, {useEffect, useState} from 'react';
import Login from './Components/Login';
import Machines from './Components/Machines';
import {createBrowserRouter, RouterProvider, Route} from "react-router-dom";
import ListDownload from './Components/ListDownLoad';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/machines',
    element: <Machines />
  },
  {
    path: '/machines/download',
    element: <ListDownload/>
  }
])


function App() {
  const [username, setUsername] = useState("");


  const groups = ["Larges", "Cells"]

  const machines = [
    {id: 1, group: groups[0], value: "Machine 1"},
    {id: 2, group: groups[0], value: "Machine 2"},
    {id: 3, group: groups[1], value: "Machine 15"}
  ]

  return (
    <RouterProvider router={router}/>
  ) 
}

export default App;
