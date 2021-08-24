import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

type QueryProps = {
  name: string;
  id: string;
};

let peer: any = null;

export default function Video() {
  const navigation = useRouter();
  const { id, name } = navigation.query as QueryProps;

  const socket = useMemo(() => io('http://localhost:3333/video'), []);

  const peers: any = {};

  const getVideo = () => {
    const myVideo = document.createElement('video');
    return myVideo;
  };

  const addVideoStream = (video: any, stream: any) => {
    const videoGrid = document.getElementById('video-grid');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    videoGrid!.append(video);
  };

  const connectToNewUser = (userId: string, stream: any) => {
    console.log('connectToNewUser', userId);
    var call = peer.call(userId, stream);
    const video = getVideo();
    call.on('stream', function (remoteStream: any) {
      console.log('connectToNewUser', 'on', 'stream');
      addVideoStream(video, remoteStream);
    });
    call.on('close', () => {
      console.log('close');
      video.remove();
    });
    peers[userId] = call;
  };

  //   removePeer(userId){
  //     if(this.peers[userId])
  //         this.peers[userId].close();
  // }

  useEffect(() => {
    // if (!id || !name) navigation.push('/');
    const boot = async () => {
      const Peer = (await import('peerjs')).default;
      peer = new Peer({
        host: 'localhost',
        port: 9000,
        path: '/myapp',
      });

      window.navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: { width: 60, height: 60 },
        })
        .then((stream) => {
          const myVideo = getVideo();
          myVideo.muted = true;
          addVideoStream(myVideo, stream);

          socket.on('user-connected', (userId) => {
            connectToNewUser(userId, stream);
          });
        });

      peer.on('open', (user_id: string) => {
        socket.emit('join', {
          user_id,
          room_id: id,
        });
      });

      peer.on('call', function (call: any) {
        window.navigator.getUserMedia(
          { video: true, audio: true },
          (stream) => {
            call.answer(stream);
            const video = getVideo();
            call.on('stream', function (remoteStream: any) {
              console.log('peer stream getUserMedia entrou');
              addVideoStream(video, remoteStream);
            });
          },
          (err) => {
            console.log('Failed to get local stream', err);
          }
        );
      });
    };
    // socket.on('receive-message', (content: MessageProps) => {
    //   setMessages(oldState => [...oldState, content])
    // })

    // socket.on('receive-status-user', ({status}) => {
    //   setStatus(oldState => [...oldState, status])
    // })
    boot();
  }, []);

  return (
    <>
      <div>Video - {name} </div>
      <div id="video-grid"></div>
      {/* <div>
        {muteAudio ? (
          <button onClick={muteUnmute}>Desmute Áudio</button>
          ) : (
          <button onClick={muteUnmute}>Mute Áudio</button>
        )}
        {stopVideo ? (
          <button onClick={playStop}>Play Vídeo</button>
          ) : (
          <button onClick={playStop}>Stop Vídeo</button>
        )}
      </div> */}
    </>
  );
}
