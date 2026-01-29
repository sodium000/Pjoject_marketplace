# MongoDB Setup Guide

## Installation

### Windows

1. **Download MongoDB**:
   - Visit [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Download MongoDB Community Server for Windows
   - Run the installer (.msi file)

2. **Installation Options**:
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Start MongoDB**:
   ```powershell
   # If installed as a service
   net start MongoDB
   
   # Or check if it's already running
   Get-Service MongoDB
   ```

### Alternative: MongoDB Atlas (Cloud)

For a cloud-based solution without local installation:

1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a free cluster
4. Get connection string
5. Update `.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project_marketplace
   ```

## Verifying Installation

```powershell
# Check MongoDB is running
mongosh

# You should see MongoDB shell
# Type 'exit' to quit
```

## Database Setup

**No manual setup required!** MongoDB will automatically:
- Create the database when the app first connects
- Create collections when models are first used
- Build indexes based on the Mongoose schemas

## Creating First Admin User

After registering your first user through the app:

### Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select `project_marketplace` database
4. Select `users` collection
5. Find your user
6. Click "Edit" and change `role` to `"admin"`
7. Click "Update"

### Using mongosh (Command Line)
```javascript
mongosh

use project_marketplace

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

exit
```

## Troubleshooting

### MongoDB won't start
```powershell
# Check if data directory exists
# Default: C:\data\db
New-Item -Path "C:\data\db" -ItemType Directory -Force

# Start MongoDB manually
mongod --dbpath="C:\data\db"
```

### Connection refused
- Ensure MongoDB service is running
- Check firewall settings
- Verify connection string in `.env`

### Cannot find mongosh
- Add MongoDB bin folder to PATH
- Default location: `C:\Program Files\MongoDB\Server\6.0\bin`
