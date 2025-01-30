import React, {useState} from "react";

function Message({onMessage, value}) {

    const handleMessage = (e) => {
        const currentMessage = e.target.value;
        onMessage(currentMessage);
    }

    return (
        <div className="message">
            <input type="text" placeholder="Enter Text" onChange={handleMessage} value={value ?? ''}/>
        </div>
    )
}

export default Message