import React, {useState, useEffect, useRef} from "react";
import Lines from "./Components/Line";
import useWebSocket from 'react-use-websocket';
import throttle from 'lodash.throttle';
import { Cursor } from "./Components/Cursor";

const renderCursors = users => {
    return Object.keys(users).map(uuid => {
        const user = users[uuid];

        return (
            <Cursor key={uuid} point={[user.state.x, user.state.y]} />
        );
    });
};

const renderMachines = (users, handleDragEnter, handleDragStart, handleDragOver, handleDrop) => {
    // Collect groups from users
    const allGroups = Object.keys(users).reduce((acc, uuid) => {
        const userGroups = users[uuid].state.groups;
        userGroups.forEach(group => {
            if (!acc.includes(group)) {
                acc.push(group);
            }
        });
        return acc;
    }, []);

    const allMachines = Object.keys(users).reduce((acc, uuid) => {
        const userMachines = users[uuid].state.machines;
        userMachines.forEach(machine => {
            if (!acc.some(m => m.id === machine.id)) {
                acc.push(machine);
            }
        });
        return acc;
    }, []);

    return (
        <>
            <div className="drag-n-drop">
                {allGroups.map(group => (
                    <div key={group} className="dnd-group" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, group)}>
                        <div className="group-title">{group}</div>
                        {allMachines ? (allMachines.filter(machine => machine.group === group).map(item => (
                            <div
                                key={item.id}
                                id={item.id}
                                className="dnd-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                            >
                                <p>{item.value}</p>
                                <Lines group={item.group} />
                            </div>
                        ))) : null }
                    </div>
                ))}
            </div>
        </>
    );
};

function DragNDrop({ machines, groups, username }) {
    const WS_URL = 'ws://localhost:8000';
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username },
        machines: machines
    });

    const THROTTLE = 50;
    const sendJsonMessageThrottle = useRef(throttle(sendJsonMessage, THROTTLE));

    useEffect(() => {
        sendJsonMessage({
            x: 0,
            y: 0,
            machines,
            groups
        });
        window.addEventListener("mousemove", e => {
            sendJsonMessageThrottle.current({
                x: e.clientX,
                y: e.clientY,
                machines,
                groups
            });
        });
    }, [machines, groups, sendJsonMessageThrottle]);

    const [list, setList] = useState(machines);
    const [dragging, setDragging] = useState(null);

    const handleDragStart = (e, item) => {
        setDragging(item);
        e.dataTransfer.setData('text/plain', item.id);
    };

    const handleDragEnter = (e, group) => {
        e.preventDefault();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, group) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const updatedMachines = list.map(machine =>
            machine.id === parseInt(id) ? { ...machine, group: group } : machine
        );
        setList(updatedMachines);
        sendJsonMessage({ type: 'update-group', machine: { ...dragging, group: group } });
        setDragging(null);
    };

    useEffect(() => {
        if (lastJsonMessage) {
            const updatedList = lastJsonMessage.machines;
            setList(updatedList);
        }
    }, [lastJsonMessage]);

    if (lastJsonMessage) {
        return <>
            {renderCursors(lastJsonMessage)}
            {renderMachines(lastJsonMessage, handleDragEnter, handleDragStart, handleDragOver, handleDrop)}
        </>;
    } else {
        return <div>Loading...</div>;
    }
}

export default DragNDrop;
