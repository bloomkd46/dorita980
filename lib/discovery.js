'use strict';

const dgram = require('dgram');

function discovery (cb, full, blid) {
  let broadcastInterval;
  const server = dgram.createSocket('udp4');

  server.on('error', (err) => {
    server.close();
    cb(err);
  });

  server.on('message', (msg) => {
    try {
      let parsedMsg = JSON.parse(msg);
      if (parsedMsg.hostname && parsedMsg.ip && ((parsedMsg.hostname.split('-')[0] === 'Roomba') || (parsedMsg.hostname.split('-')[0] === 'iRobot'))) {
        if (blid === undefined || parsedMsg.hostname.split('-')[1] === blid) {
          clearInterval(broadcastInterval);
          server.close();
          // console.log('Robot found! with blid/username: ' + parsedMsg.hostname.split('-')[1]);
          // console.log(parsedMsg);
          cb(null, full ? parsedMsg : parsedMsg.ip);
        }
      }
    } catch (e) {}
  });

  server.on('listening', () => {
    // console.log('Looking for robots...');
  });

  server.bind(5678, function () {
    const message = Buffer.from('irobotmcs');
    server.setBroadcast(true);
    server.send(message, 0, message.length, 5678, '255.255.255.255');
    let attempts = 0;
    broadcastInterval = setInterval(() => {
      attempts++;
      if (attempts > 3) {
        cb('No Devices Found');
        clearInterval(broadcastInterval);
      } else {
        server.send(message, 0, message.length, 5678, '255.255.255.255');
      }
    }, 5000);
  });
}

function getRobotPublicInfo (ip, cb) {
  let broadcastInterval;
  const server = dgram.createSocket('udp4');

  server.on('error', (err) => {
    server.close();
    cb(err);
  });

  server.on('message', (msg) => {
    try {
      let parsedMsg = JSON.parse(msg);
      if (parsedMsg.hostname && parsedMsg.ip && ((parsedMsg.hostname.split('-')[0] === 'Roomba') || (parsedMsg.hostname.split('-')[0] === 'iRobot'))) {
        clearInterval(broadcastInterval);
        server.close();
        parsedMsg.blid = parsedMsg.hostname.split('-')[1];
        cb(null, parsedMsg);
      }
    } catch (e) {}
  });

  server.bind(5678, function () {
    const message = Buffer.from('irobotmcs');
    server.send(message, 0, message.length, 5678, ip);
    let attempts = 0;
    broadcastInterval = setInterval(() => {
      attempts++;
      if (attempts > 3) {
        cb('No Devices Found');
        clearInterval(broadcastInterval);
      } else {
        server.send(message, 0, message.length, 5678, '255.255.255.255');
      }
    }, 5000);
  });
}
module.exports = {
  discovery,
  getRobotPublicInfo
};
