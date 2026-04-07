import "dotenv/config";
import { createApp } from "./app.js";
import { PORT } from "./config.js";

const app = createApp();

app.listen(PORT, () => {
  console.log(`API desafio-qa em http://localhost:${PORT}`);
});
