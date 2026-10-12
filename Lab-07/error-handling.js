const EventEmitter = require('events');
const risky = new EventEmitter();

// Add this listener -> no crash anymore
risky.on('error', (err) => {
  console.log('Handled gracefully:', err.message);
});

risky.emit('error', new Error('Something broke'));

console.log('Program is still running after the error event!');