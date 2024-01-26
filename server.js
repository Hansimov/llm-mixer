const fs = require("fs").promises;
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

app.get("/endpoints", async (req, res) => {
    try {
        let endpoints_configs_path = path.join(
            __dirname,
            "configs",
            "endpoints.json"
        );
        const data = await fs.readFile(endpoints_configs_path, "utf-8");
        const local_points = JSON.parse(data);
        res.json(local_points);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to get local endpoints: Maybe configs/endpoints.json not existed?",
        });
    }
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
        res.status(500).json({ error: "Failed to request OpenAI Endpoint" });
    }
});

app.post("/models", async (req, res) => {
    try {
        const {
            openai_endpoint,
            openai_request_method,
            openai_request_headers,
        } = req.body;

        const response = await axios({
            method: openai_request_method,
            url: openai_endpoint + "/models",
            headers: openai_request_headers,
        });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to request OpenAI Endpoint" });
    }
});

const port = 23456;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
