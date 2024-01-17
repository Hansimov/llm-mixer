const decoder = new TextDecoder("utf-8");

export function stringify_stream_bytes(bytes) {
    return decoder.decode(bytes);
}

export function jsonize_stream_data(data) {
    var json_chunks = [];
    var buffer = ""
    data = data
        .replace(/^data:\s*/gm, "")
        .replace(/\[DONE\]/gm, "")
        .split("\n")
        .filter(function (line) {
            return line.trim().length > 0;
        })
        .map(function (line) {
            try {
                // TODO: Single line broken into multiple chunks
                let json_chunk = JSON.parse(line.trim());
                json_chunks.push(json_chunk);
                buffer = ""
            } catch {
                buffer += line;
                console.log(`Failed to parse: ${line}`);
            }
        });
    return json_chunks;
}

export function transform_footnote(text) {
    return text
        .replace(/\[\^(\d+)\^\]\[\d+\]/g, "[$1]")
        .replace(/\[(\d+)\]:\s*(.*)\s*""/g, "[$1] $2 \n");
}
