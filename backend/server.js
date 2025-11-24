const express = require("express");
const cors = require("cors");

const inquiryRoutes = require("./routes/inquiryRoute");

const app = express();
app.use(cors());
app.use(express.json());

// Use routes
app.use("/api/inquiries", inquiryRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
