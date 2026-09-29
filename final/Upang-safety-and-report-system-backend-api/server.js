const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const connectDB = require('./config/DataConnection');
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '127.0.0.1';

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be set');
    }
    await connectDB();
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exitCode = 1;
  }
};

startServer();