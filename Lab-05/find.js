const http = require('http');
const url = require('url');

const students = [
    { id: 1, name: "Valery", course: "BCA", marks: 20 },
    { id: 2, name: "Legasov", course: "BCA", marks: 20 },
    { id: 3, name: "Vladimir", course: "BCA", marks: 30 },
    { id: 4, name: "Ivan", course: "BCA", marks: 35 },
    { id: 5, name: "Anatoly", course: "Psy", marks: 56 },
    { id: 6, name: "Georgy", course: "Psy", marks: 45 },
    { id: 7, name: "Leonid", course: "Forensic", marks: 64 },
    { id: 8, name: "yuri", course: "Forensic", marks: 58 }
];

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { pathname, query } = url.parse(req.url, true);

    // /students or /students/course/BCA
    let course = query.course;
    if (pathname.startsWith('/students/course/'))
        course = pathname.split('/')[3];

    if (pathname !== '/students' && !pathname.startsWith('/students/course/')) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: "Route not found" }));
    }

    let result = [...students];

    // Filters
    if (course)
        result = result.filter(s => s.course.toLowerCase() === course.toLowerCase());

    if (query.minMarks !== undefined) {
        if (query.minMarks === '' || isNaN(query.minMarks)) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "minMarks must be a number" }));
        }
        result = result.filter(s => s.marks >= Number(query.minMarks));
    }

    if (query.search)
        result = result.filter(s =>
            s.name.toLowerCase().includes(query.search.toLowerCase())
        );

    // Sorting
    if (query.sort) {
        if (!['name', 'marks'].includes(query.sort)) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "Invalid sort field" }));
        }

        const order = query.order === 'desc' ? -1 : 1;

        result.sort((a, b) =>
            query.sort === 'marks'
                ? (a.marks - b.marks) * order
                : a.name.localeCompare(b.name) * order
        );
    }

    res.end(JSON.stringify(result, null, 2));
});

server.listen(3000, () => console.log('Server running on port 3000'));


