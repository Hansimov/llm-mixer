---
title: LLM Mixer
emoji: 🔀
colorFrom: gray
colorTo: gray
sdk: docker
app_port: 12345
---

Mirrors:
* https://hansimov-llm-mixer.hf.space


## Run
### Command Line

```sh
git clone https://github.com/Rob--W/cors-anywhere.git cors-anywhere

cd cors-anywhere
# Set proxy or registry if needed:
#   npm config set proxy http://<server>:<port>
#   npm config set registry https://registry.npmmirror.com
# Or set proxy directly:
#   npm --porxy http://<server>:<port> install <*>
sudo npm install && sudo npm install http-server -g

cd ..
PORT=12349 node ./cors-anywhere/server.js &
http-server -p 12345
```
