const EventEmitter = require('events');
const orders = new EventEmitter();

orders.on('placed', (item) => {
  console.log(`Kitchen: prepare ${item}`);
});
orders.on('placed', (item) => {
  console.log(`Billing: charge for ${item}`);
});
orders.on('placed', (item) => {
  console.log(`SMS: order confirmed`);
});
// Task 3 addition : FOURTH listener, existing three untouched
orders.on('placed', (item) => {
  console.log(`Loyalty Points: +10 points for ordering ${item}`);
});

orders.emit('placed', 'Pizza');