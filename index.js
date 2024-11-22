import http from 'http';
import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { Server as SocketIO } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

let ffmpegProcess = null;

app.use(express.static(path.resolve('./public')));
app.use(express.json());

// Endpoint to set RTMP Key
app.post('/set-rtmp-key', (req, res) => {
  const { rtmpKey } = req.body;
  if (!rtmpKey) {
    return res.status(400).json({ error: 'RTMP key is required' });
  }

  const options = [
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', 25,
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', 128000 / 4,
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${rtmpKey}`,
  ];

  if (ffmpegProcess) {
    ffmpegProcess.kill();
    console.log('Previous ffmpeg process terminated.');
  }

  ffmpegProcess = spawn('ffmpeg', options);

  ffmpegProcess.stdout.on('data', (data) => {
    console.log(`ffmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on('data', (data) => {
    console.error(`ffmpeg stderr: ${data}`);
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
  });

  res.status(200).json({ message: 'RTMP key set and ffmpeg started.' });
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on('binarystream', (stream) => {
    if (ffmpegProcess) {
      console.log('binary stream coming');
      ffmpegProcess.stdin.write(stream, (err) => {
        if (err) {
          console.error('Error writing to ffmpeg stdin:', err);
        }
      });
    } else {
      console.error('ffmpegProcess is not running.');
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

server.listen(3000, () => {
  console.log('The server is running on http://localhost:3000');
});
