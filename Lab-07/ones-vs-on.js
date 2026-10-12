const EventEmitter = require('events');
const app = new EventEmitter();

app.once('firstLogin', (user) => {
  console.log(`Welcome bonus applied for ${user}!`);
});

app.on('login', (user) => {
  console.log(`${user} logged in.`);
});

app.emit('firstLogin', 'Aman'); // fires
app.emit('login', 'Aman');      // fires
app.emit('firstLogin', 'Aman'); // should NOT fire again
app.emit('login', 'Aman');      // SHOULD fire again