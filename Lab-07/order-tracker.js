const EventEmitter = require('events');

class OrderTracker extends EventEmitter {
  constructor() {
    super();
    this.customersWithBonus = new Set(); // remember who already got the bonus
  }

  placeOrder(customer, item) {
    this.emit('orderPlaced', customer, item);

    // firstOrderBonus only the FIRST time this customer orders
    if (!this.customersWithBonus.has(customer)) {
      this.emit('firstOrderBonus', customer);
      this.customersWithBonus.add(customer);
    }

    setTimeout(() => this.emit('orderPrepared', customer, item), 1000);
    setTimeout(() => this.emit('orderDelivered', customer, item), 2000);
  }
}

const tracker = new OrderTracker();

// orderPlaced -> 2 listeners : customer notification + internal log
tracker.on('orderPlaced', (customer, item) => {
  console.log(`[Customer] Hi ${customer}, your ${item} has been placed!`);
});
tracker.on('orderPlaced', (customer, item) => {
  console.log(`[Log] orderPlaced recorded: ${customer} -> ${item}`);
});

// orderPrepared -> 2 listeners
tracker.on('orderPrepared', (customer, item) => {
  console.log(`[Customer] ${customer}, your ${item} is prepared and out for delivery!`);
});
tracker.on('orderPrepared', (customer, item) => {
  console.log(`[Log] orderPrepared recorded: ${customer} -> ${item}`);
});

// orderDelivered -> 2 listeners
tracker.on('orderDelivered', (customer, item) => {
  console.log(`[Customer] ${customer}, your ${item} has been DELIVERED. Enjoy!`);
});
tracker.on('orderDelivered', (customer, item) => {
  console.log(`[Log] orderDelivered recorded: ${customer} -> ${item}`);
});

// firstOrderBonus -> .once() : fires only the first time
tracker.once('firstOrderBonus', (customer) => {
  console.log(`[Bonus] First order bonus applied for ${customer} (20% off)!`);
});

// safe 'error' handling -> never crashes the process
tracker.on('error', (err) => {
  console.log(`[Error] Handled gracefully: ${err.message}`);
});

// Simulate a full lifecycle with delays between stages
console.log('--- Order 1 : Yadev (first order) ---');
tracker.placeOrder('Yadev', 'Pizza');

setTimeout(() => {
  console.log('--- Order 2 : Yadev again (no bonus this time) ---');
  tracker.placeOrder('Yadev', 'Burger');
}, 2500);

setTimeout(() => {
  tracker.emit('error', new Error('Payment gateway timed out'));
  console.log('--- Tracker still alive, process did not crash ---');
}, 3000);