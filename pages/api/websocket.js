import { WebSocketServer } from 'ws';

export default function handler(req, res) {
  // Upgrade the request to WebSocket if it's a WebSocket upgrade
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    // Create a WebSocket server on the same HTTP server
    const wss = new WebSocketServer({ noServer: true });

    // Handle the upgrade
    req.socket.server.once('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });

    wss.on('connection', (ws) => {
      // Broadcast to all clients
      ws.on('message', (message) => {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      // Send a welcome message
      ws.send(JSON.stringify({ type: 'system', text: 'Welcome to the chat!' }));
    });

    // Prevent the default response (we already handled it)
    return;
  }

  // For non-WebSocket requests, return a simple page
  res.status(200).json({ message: 'WebSocket server is running' });
}
