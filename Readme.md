## Setup Instructions

1. **Clone/Create the project structure** as shown above

2. **Install dependencies** for each service:

   ```bash
   cd service-a && npm install
   cd ../service-b && npm install
   ```

3. **Run with Docker Compose** (recommended):

   ```bash
   docker-compose up --build
   ```

4. **Or run locally** (requires MongoDB and Redis running):

   ```bash
   # Terminal 1 - Service A
   cd service-a && npm run dev

   # Terminal 2 - Service B
   cd service-b && npm run dev
   ```

## Testing the System

1. **Send a message** (Service A):

   ```bash
   curl -X POST http://localhost:3001/messages \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "message": "Hello from the microservice system!"
     }'
   ```

2. **Get all messages** (Service A):

   ```bash
   curl http://localhost:3001/messages
   ```

3. **Check worker health** (Service B):

   ```bash
   curl http://localhost:3002/health
   ```

4. **Check worker stats** (Service B):
   ```bash
   curl http://localhost:3002/stats
   ```

## Architecture Features

- ✅ **TypeScript** across both services
- ✅ **MongoDB** shared database with Mongoose ODM
- ✅ **Redis + BullMQ** for reliable job queuing
- ✅ **Microservice separation** - independent services
- ✅ **Docker Compose** for easy deployment
- ✅ **Input validation** with express-validator
- ✅ **Error handling** and retry mechanisms
- ✅ **Health checks** and monitoring endpoints
- ✅ **Graceful shutdown** handling
- ✅ **Bonus features**: GET endpoint, validation, stats
