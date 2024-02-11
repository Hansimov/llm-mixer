---
title: LLM Mixer
emoji: 🔀
colorFrom: gray
colorTo: gray
sdk: docker
app_port: 23456
---

Mirrors:
* https://hansimov-llm-mixer.hf.space

## Run
### Command Line

```sh
sudo npm install
node server.js
```

### Docker

```sh
docker build -t llm-mixer:1.0 .
docker run llm-mixer:1.0
```