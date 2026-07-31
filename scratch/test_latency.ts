import * as net from "net";

const host = "ep-hidden-water-azgewm1n-pooler.c-3.ap-southeast-1.aws.neon.tech";
const port = 5432;

function checkLatency() {
  const start = Date.now();
  const socket = new net.Socket();

  socket.setTimeout(5000);

  socket.connect(port, host, () => {
    const rtt = Date.now() - start;
    console.log(`Successfully connected to database in ${rtt}ms`);
    socket.destroy();
  });

  socket.on("error", (err) => {
    console.error("Connection error:", err.message);
    socket.destroy();
  });

  socket.on("timeout", () => {
    console.error("Connection timed out");
    socket.destroy();
  });
}

checkLatency();
