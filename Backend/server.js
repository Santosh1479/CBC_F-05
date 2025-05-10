const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./DB/db");

dotenv.config();
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));