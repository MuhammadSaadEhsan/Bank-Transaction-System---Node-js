const app = require('./src/app');
const PORT = process.env.port || 3000
const connectToDatabase = require('./src/config/connection');

connectToDatabase()

app.listen(PORT, () => {
    console.log("server is running on ", PORT)
})