const EventEmitter = require('events');

class NotificationCenter extends EventEmitter {}
const notifier = new NotificationCenter();

notifier.on('newMessage', (from, text) => {
  console.log(`${from}: ${text}`);
});
notifier.on('error', (err) => {
  console.log('Handled:', err.message);
});
// Task 6 addition : one more event of my own choice
notifier.on('userOnline', (user) => {
  console.log(`System: ${user} is now online`);
});

notifier.emit('newMessage', 'Priya', 'You free?');
notifier.emit('userOnline', 'Aman');
notifier.emit('error', new Error('Connection glitch'));
console.log('Notification center finished without crashing.');