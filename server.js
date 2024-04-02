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

async function is_file_exists(file) {
    return fs
        .access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

app.get("/endpoints", async (req, res) => {
    try {
        let endpoints_configs_path = path.join(
            __dirname,
            "configs",
            "endpoints.json"
        );
        if (!(await is_file_exists(endpoints_configs_path))) {
            endpoints_configs_path = path.join(
                __dirname,
                "configs",
                "endpoints_template.json"
            );
            console.log("agents.json not found. Use template.");
        }
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

app.get("/agents", async (req, res) => {
    try {
        let agents_configs_path = path.join(
            __dirname,
            "configs",
            "agents.json"
        );
        if (!(await is_file_exists(agents_configs_path))) {
            agents_configs_path = path.join(
                __dirname,
                "configs",
                "agents_template.json"
            );
            console.log("endpoints.json not found. Use template.");
        }
        const data = await fs.readFile(agents_configs_path, "utf-8");
        const local_agents = JSON.parse(data);
        res.json(local_agents);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to get local agents: Maybe configs/agents.json not existed?",
        });
    }
});

let httpProxyDict = false;
const loadHttpProxy = async () => {
    try {
        let secrets_configs_path = path.join(
            __dirname,
            "configs",
            "secrets.json"
        );
        const data = await fs.readFile(secrets_configs_path, "utf-8");
        const secrets = JSON.parse(data);
        if (secrets.http_proxy) {
            const url = new URL(secrets.http_proxy);
            httpProxyDict = {
                protocol: url.protocol.slice(0, -1),
                host: url.hostname,
                port: parseInt(url.port),
            };
        } else {
            console.warn("http_proxy not found in secrets");
        }
    } catch (error) {
        console.warn(
            "Failed to load http_proxy: Maybe configs/secrets.json not existed?"
        );
    }
};

loadHttpProxy();

app.post("/models", async (req, res) => {
    try {
        const {
            openai_endpoint,
            openai_request_method,
            openai_request_headers,
        } = req.body;

        let axios_config = {
            method: openai_request_method,
            url: openai_endpoint + "/v1/models",
            headers: openai_request_headers,
        };
        if (httpProxyDict) {
            axios_config.proxy = httpProxyDict;
        }
        const response = await axios(axios_config);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to request OpenAI Endpoint" });
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

        let axios_config = {
            method: openai_request_method,
            url: openai_endpoint + "/v1/chat/completions",
            data: openai_request_body,
            headers: openai_request_headers,
            responseType: "stream",
        };
        if (httpProxyDict) {
            axios_config.proxy = httpProxyDict;
        }
        console.log(`request to ${axios_config.url}`);
        const response = await axios(axios_config);
        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to request OpenAI Endpoint" });
    }
});

const port = 23456;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
