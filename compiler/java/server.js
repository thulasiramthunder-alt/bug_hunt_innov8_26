const express = require("express");

const app = express();

const PORT = process.env.PORT || 8001;

app.get("/", (req, res) => {
  res.json({
    status: "Java Compiler Running"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
