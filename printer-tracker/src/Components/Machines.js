import React, { useState, useEffect } from "react";
import Lines from "./Lines";
import Message from "./Message";
import PrintLines from "./PrintLines";
import socketIO from "socket.io-client";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000'
//



const socket = socketIO.connect(BASE_URL);

function Machines() {
  const [machines, setMachines] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [currentMessages, setNewMessage] = useState({});
  const [resetStates, setResetStates] = useState({});

  useEffect(() => {
    // Fetch initial data from the API
    const getData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api`);
        const data = await response.json();
        setMachines(data);

         // Set initial selected items based on fetched data
      const initialSelectedItems = {};
      const initialMessages = {};

      // Iterate over larges and cells to extract selected lines
      ['larges', 'cells'].forEach(groupKey => {
        if (data[groupKey] && data[groupKey].items) {
          data[groupKey].items.forEach(machine => {
            initialSelectedItems[machine.id] = machine.selectedLines || [];
            initialMessages[machine.id] = machine.message || '';
          });
        }
      });

      setSelectedItems(initialSelectedItems);
      setNewMessage(initialMessages);

      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    getData();

    // Set up WebSocket listeners
    socket.on("machines", (data) => {
      
      setMachines(data);
    });

    socket.on("selectedLinesUpdated", (data) => {
      const { machineId, selectedLines } = data;
      setSelectedItems((prevSelectedItems) => ({
        ...prevSelectedItems,
        [machineId]: selectedLines,
      }));
    });

    socket.on("newMessage", (data) => {
      const { machineId, newMessage } = data;
      setNewMessage((previousMessages) => ({
        ...previousMessages,
        [machineId]: newMessage,
      }));
    });

    // Clean up listeners on component unmount
    return () => {
      socket.off("machines");
      socket.off("selectedLinesUpdated");
      socket.off("newMessage");
    };
  }, []);

  function handleDragEnd({ destination, source }) {
    if (!destination) return;
    if (destination.index === source.index && destination.droppableId === source.droppableId) return;

    // TODO: Handle drag and drop logic here

    socket.emit('taskDragged', {
      source,
      destination,
    });
  };

  //handle messaging
  const handleMessage = (machineId, group, message) => {
    socket.emit('messageUpdate', {
        machineId,
        group,
        message
    })
  }

//handle selecting line
  const handleSelect = (machineId, key, level, isChecked, value) => {
    socket.emit('linesSelected', {
        machineId,
        key,
        level,
        isChecked,
        value
      })
  };


  //handle submitting data
  const handleSendJson = (machineId, group, message) => {
    socket.emit('submitdata', {
      machineId,
      group,
      message
    })
  }

  //handle clear selected
  const handleClear = (machineId, group) => {
    // Trigger reset for the specific machine
    setResetStates((prevResetStates) => ({
      ...prevResetStates,
      [machineId]: true,
    }));

    setSelectedItems((prevSelectedItems) => ({
      ...prevSelectedItems,
      [machineId]: []
    }))

    socket.emit('clearSelectedLines', {
      machineId,
      group,
      selectedLines: []
    })
  
    // Reset the reset state back to false after a short delay
    setTimeout(() => {
      setResetStates((prevResetStates) => ({
        ...prevResetStates,
        [machineId]: false,
      }));
    }, 100);
  };





  return (
    <div className="max-width">
    <div className="drag-n-drop">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.entries(machines).map(([key, group]) => (
          <div key={key} className="dnd-group">
            <h3 className='group-title'>{group.title}</h3>
            <Droppable droppableId={group.title}>
              {(provided) => (
                <div className="group-grid" ref={provided.innerRef} {...provided.droppableProps}>
                  {group.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={`${item.id}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="dnd-item"
                          
                        >
                         <div className="flex top"><b className="machineTitle" onClick={() => handleClear(item.id, group.title)}>{item.value}</b>
                         <button onClick={() => handleSendJson(item.id, group.title, currentMessages[item.id])}>Submit Data</button></div> 
                          <Lines group={group.title}
                          onSelect={(level, isChecked, value) => handleSelect(item.id, group.title, level, isChecked, value)}
                          reset={resetStates[item.id] || false} />
                          <PrintLines selectedLines={selectedItems[item.id]|| []} />
                          <Message onMessage={(message) => handleMessage(item.id, group.title, message)}
                          value={currentMessages[item.id]}/>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
          </div>
        ))}
      </DragDropContext>
    </div>
    </div>
  );
}

export default Machines;
