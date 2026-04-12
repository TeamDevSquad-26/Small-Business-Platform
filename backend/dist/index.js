import { getApp } from "./app.js";
const app = getApp();
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Karobaar API listening on http://localhost:${port}`);
});
