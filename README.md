# @prokopschield/scheduler

A fair scheduler.

### Usage

```typescript
import { Scheduler } from '@prokopschield/scheduler';

const scheduler = new Scheduler();

scheduler.add(user_id, item);

// destroy = true takes the item out of queue
scheduler.next(destroy); // yields next item

scheduler.stop(); // stops counting time
```
