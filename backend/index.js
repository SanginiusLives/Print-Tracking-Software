const express = require("express");
const fs = require("fs"); 
const xlsx = require("xlsx");
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const cors = require("cors");
const UID = () => Math.random().toString(36).substring(2, 10);
const path = require('path');

function formatDate(date) {
    const d = date
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}-${day}-${year}`;
}

const baseFileName = 'sheets';
const reportsFolder = path.join(__dirname, 'reports');
function getFilePath(date) {
    return path.join(reportsFolder, `${baseFileName}-${formatDate(date)}.xlsx`);
}

let machines = {
    larges: {
        title: "Larges",
        items: [
            {id: 1, value: "Machine 1"},
            {id: 2, value: "Machine 2"},
            {id: 3, value: "Machine 3"},
            {id: 4, value: "Machine 4"},
            {id: 5, value: "Machine 5"},
            {id: 6, value: "Machine 6"},
            {id: 7, value: "Machine 7"},
            {id: 8, value: "Machine 8"},
            {id: 9, value: "Machine 9"},
            {id: 10, value: "Machine 10"},
        ]
    },
    cells: {
        title: "Cells",
        items: [
            {id: 11, value: "Machine 11"},
            {id: 12, value: "Machine 12"},
            {id: 13, value: "Machine 13"},
            {id: 14, value: "Machine 14"}
        ]
    }
}

app.use(cors());

let filePath;

const io = new Server(server, {
    cors: {
        origin: "*"
    }
}) 
const PORT = process.env.PORT || 5000;

app.get('/api', (req, res) => {
    res.json(machines);
});

io.on('connection', (socket => {
    console.log(`${socket.id} connected`);

    socket.on("taskDragged", (data) => {
        const {source, destination} = data;

        //Moves item to new grouping (i.e Larges or Cells)
        const itemMoved = {
            ...machines[source.droppableId.toLowerCase()].items[source.index],
        };

        machines[source.droppableId.toLowerCase()].items.splice(source.index, 1);
        machines[destination.droppableId.toLowerCase()].items.splice(
            destination.index,
        0,
        itemMoved
    );

    io.sockets.emit("machines", machines);
    });


    //Line Selection
    socket.on("linesSelected", (data) => {
        const { machineId, key, level, value, isChecked } = data;
        const trueKey = key.toLowerCase();
        const selectedMachines = machines[trueKey].items;
        const machine = selectedMachines.find(machine => machine.id === machineId);
    
        // Check if the key exists in machines
        if (machines.hasOwnProperty(trueKey)) {
            if (machine) {
                machine.selectedLines = machine.selectedLines || [];
                const existingLineIndex = machine.selectedLines.findIndex(line => line.value === value && line.level === level);
    
                if (existingLineIndex !== -1) {
                    if (isChecked) {
                        // Update existing line if it exists and is checked
                        machine.selectedLines[existingLineIndex].isChecked = isChecked;
                    } else {
                        // Remove line if it is unchecked
                        machine.selectedLines.splice(existingLineIndex, 1);
                    }
                } else if (isChecked) {
                    // Add new line if it doesn't exist and is checked
                    machine.selectedLines.push({ level, value, isChecked });
                }
    
                // Emit updated selectedLines to all clients
                io.sockets.emit("selectedLinesUpdated", { machineId, selectedLines: machine.selectedLines });
            }
        }
    });


    //Message Updating
    socket.on('messageUpdate', (data) => {
        const {machineId, group, message} = data;
        const trueKey = group.toLowerCase();
        const selectedMachines = machines[trueKey].items;
        const machine = selectedMachines.find(machine => machine.id === machineId);   
    

        if (machines.hasOwnProperty(trueKey)) {
            if(machine) {
                machine.message = message;
                io.sockets.emit('newMessage', {machineId, newMessage: machine.message})
            }
            
        }

    });

    socket.on('clearSelectedLines', (data) => {
        const {machineId, group} = data;
        const trueKey = group.toLowerCase();
        const selectedMachines = machines[trueKey].items;
        const machine = selectedMachines.find(machine => machine.id === machineId);   

        if (machine) {
            machine.selectedLines = [];
            io.sockets.emit("selectedLinesUpdated", { machineId, selectedLines: machine.selectedLines });
        }


    })



    
    socket.on('submitdata', (data) => {
        let date = new Date();
        const { machineId, group, message } = data;
        const trueKey = group.toLowerCase();
        const selectedMachines = machines[trueKey].items;
        const machine = selectedMachines.find(machine => machine.id === machineId);
    
        if (!Array.isArray(data)) {
            data = [data];
        }
    
        // Add machine selected lines to data if they exist
    if (machine && machine.selectedLines) {
        machine.message = message
        console.log(machine.message)
        // Collect all unique levels
        const uniqueLevels = [...new Set(machine.selectedLines.map(line => line.level))];

        // Join unique levels into a comma-separated string
        const levelsString = uniqueLevels.join(', ');
        let timeString = date.toLocaleTimeString('en-US', {timeZone:'America/New_York', hour12: false });

        // Add the levelsString to each data item
        data = data.map(item => ({
            ...item,
            Level: levelsString,
            Time: timeString,
            Date: formatDate(date),
        }));
    }
    

    //Write to existing workbook if it exists
    let workbook;
    const filePath = getFilePath(date);
    

    if (fs.existsSync(filePath)) {
        workbook = xlsx.readFile(filePath);
    } else {
        workbook = xlsx.utils.book_new();
    }

    const sheetName = "sample";
    let worksheet = workbook.Sheets[sheetName];

    if (worksheet) {
        const existingData = xlsx.utils.sheet_to_json(worksheet);
        const combinedData = existingData.concat(data);
        worksheet = xlsx.utils.json_to_sheet(combinedData);
    } else {
        worksheet = xlsx.utils.json_to_sheet(data);
    }

    // Remove existing sheet if it exists
    if (workbook.Sheets[sheetName]) {
        delete workbook.Sheets[sheetName];
        const sheetIndex = workbook.SheetNames.indexOf(sheetName);
        if (sheetIndex !== -1) {
            workbook.SheetNames.splice(sheetIndex, 1);
        }
    }

    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

    try {
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        fs.writeFileSync(filePath, buffer);
        console.log("Workbook written successfully");
    } catch (error) {
        console.error("Error writing file:", error);
    }
    });


    socket.on('disconnect', () => {
        socket.disconnect();
        console.log(`${socket.id} disconnected`);
    })
}));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

app.get('/download', (req, res) => {
    fs.readdir(reportsFolder, (err, files) => {
        if (err) {
            console.error("Error reading reports folder:", err);
            return res.status(500).send("Error reading reports folder");
        }

        // Filter out files that do not match the baseFileName pattern (optional)
        const filteredFiles = files.filter(file => file.startsWith(baseFileName) && file.endsWith('.xlsx'));

        res.json({ files: filteredFiles });
    });
});

app.get(`/reports/:filename`, (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(reportsFolder, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                res.status(500).send("Error downloading file");
            }
        });
    } else {
        res.status(404).send("File not found");
    }
});
