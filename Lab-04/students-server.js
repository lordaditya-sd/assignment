//Import modulla
const http = require('http');
//Data
const students = [
    { id: 1, name: "Aditya", course: "BCA" },
    { id: 2, name: "Yadev", course: "BCA" },
    { id: 3, name: "Rishabh", course: "BCA" },
    { id: 4, name: "sayon", course: "BCA" },
    { id: 5, name: "Ayush", course: "BCA" },
    { id: 6, name: "Pragya", course: "BCA" },
    { id: 7, name: "Kashyap", course: "BCA" },
    { id: 8, name: "Singh", course: "BCA" },
    { id: 9, name: "Mikki", course: "BCA" },
    { id: 10, name: "Gauri", course: "BCA" },
    { id: 11, name: "Kanak", course: "BCA" },
];
//Server
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/students') {
        res.end(JSON.stringify(students));
    }
    else if (req.url.startsWith('/students/')) {
        const id = Number(req.url.split('/')[2]);
        const student = students.find(s => s.id === id);
        if (student) {
            res.end(JSON.stringify(student));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Student not found" }));
        }

    }
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Route not found" }));
    }
});
server.listen(3000, () => console.log("Server running on port 3000"));
