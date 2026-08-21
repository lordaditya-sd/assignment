const http = require('http');

const server = http.createServer(
    (req, res) => {
        res.writeRead(200, {
            'Content Type': 'text/plain'
        } );
        res.end('hello World from node.js');
    }
);

server.listen(3000, () => {
console.log('server running....');
});