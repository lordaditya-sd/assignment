const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(
            'Welcome to my Node.js Server!\n' +
            'Name: Aditya\n' +
            'Scholar Number: 223344\n' +
            'Course: BCA VII'
        );
    }

    else if (req.url === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(
            'Hello! My name is Aditya. I am a BCA VII semester student interested in technology and programming.'
        );
    }

    else if (req.url === '/college') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(
            'College: DSVV\n' +
            'Semester: VII'
        );
    }

    else if (req.url === '/profile') {
        res.writeHead(200, { 'Content-Type': 'application/json' });

        const profile = {
            name: 'Aditya',
            scholarNumber: 'YOUR_SCHOLAR_NUMBER',
            course: 'BCA',
            semester: 'VII',
            college: 'YOUR_COLLEGE_NAME'
        };

        res.end(JSON.stringify(profile));
    }

    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});