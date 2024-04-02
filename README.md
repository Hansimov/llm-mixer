---
title: LLM Mixer
emoji: 🔀
colorFrom: gray
colorTo: gray
sdk: docker
app_port: 23456
---


# LLM-Mixer

![](https://img.shields.io/github/v/release/hansimov/llm-mixer?label=LLM-Mixer&color=blue&cacheSeconds=60)

A lightweight UI of LLM app.

Mirror:
- https://hansimov-llm-mixer.hf.space

## Run server
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

## Screenshots

<div align="center">

<img height=400 src="./docs/llm-mixer-web-v0.9.0.png">

<b>Web</b>

<img height=400 src="./docs/llm-mixer-mobile-v0.9.0.png">

<b>Mobile</b>

</div>