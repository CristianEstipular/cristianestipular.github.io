const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('Routes loaded:');
  console.log(require("./routes/Incidentroute.js"));
});