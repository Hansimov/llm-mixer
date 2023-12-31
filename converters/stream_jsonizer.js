const decoder = new TextDecoder("utf-8");

export function stringify_stream_bytes(bytes) {
    return decoder.decode(bytes);
}

export function jsonize_stream_data(data) {
    var json_chunks = [];
    data = data
        .replace(/^data:\s*/gm, "")
        .replace(/\[DONE\]/gm, "")
        .split("\n")
        .filter(function (line) {
            return line.trim().length > 0;
        })
        .map(function (line) {
            try {
                // ToFix: Single line broken into multiple chunks
                json_chunks.push(JSON.parse(line.trim()));
            } catch {
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
