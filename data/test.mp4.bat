ffmpeg -re -stream_loop -1  -i test.mp4  -rtsp_transport tcp -c copy -f rtsp rtsp://127.0.0.1:9554/live/test
cmd