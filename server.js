const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, ".")));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/chat/completions", async (req, res) => {
    try {
        const {
            openai_endpoint,
            openai_request_method,
            openai_request_headers,
            openai_request_body,
        } = req.body;

        const response = await axios({
            method: openai_request_method,
            url: openai_endpoint + "/chat/completions",
            data: openai_request_body,
            headers: openai_request_headers,
            responseType: "stream",
        });

        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to requests OpenAI Endpoint" });
    }
});

const port = 12345;
app.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});
