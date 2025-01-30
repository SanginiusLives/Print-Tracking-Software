import React, { useState, useEffect } from "react";

function ListDownload() {
    const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000'; // Update this as needed
    //

    

    const [list, setList] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/download`);
                const data = await response.json();
                setList(data.files); // Assuming the server returns { files: [...] }
            } catch (error) {
                console.log("Error fetching data:", error);
            }
        };
        
        getData();
    }, []); // Add empty dependency array to run effect only once

    return (
        <div className="max-width">
            <h2>Available Reports</h2>

            <div className="listContainer">
            {list && list.length > 0 ? (
                list.map((item, index) => (
                    <a key={index} className="listItem" href={`${BASE_URL}/reports/${item}`} download>
                        {item}
                    </a>
                ))
            ) : (
                <p>No files available for download.</p>
            )}
            </div>
        </div>
    );
}

export default ListDownload;