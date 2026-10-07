module.exports = [
    {
        id: '01',
        title: 'Node.js Basics',
        topic: 'Node.js variables and console output',
        type: 'script',
        file: '../Lab-01/app.js'
    },
    {
        id: '02',
        title: 'Simple HTTP Server',
        topic: 'http module and response handling',
        type: 'server',
        file: '../Lab-02/server1.js',
        try: '/'
    },
    {
        id: '03',
        title: 'Node.js Routing Server',
        topic: 'HTTP routing and JSON response',
        type: 'server',
        file: '../Lab-03/server.js',
        try: '/'
    },
    {
        id: '04',
        title: 'Student Directory API',
        topic: 'JSON data and route parameters',
        type: 'server',
        file: '../Lab-04/students-server.js',
        try: '/students'
    },
    {
        id: '05',
        title: 'Student Filtering API',
        topic: 'query parameters, filtering and sorting',
        type: 'server',
        file: '../Lab-05/find.js',
        try: '/students?course=BCA&sort=marks&order=desc'
    },
    {
        id: '06',
        title: 'Async/Await Food Delivery',
        topic: 'Promise and async/await',
        type: 'script',
        file: '../Lab-06/async-await-version.js'
    }
];
