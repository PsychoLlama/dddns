import P2P from 'libp2p';
import { NOISE } from 'libp2p-noise';
import MPLEX from 'libp2p-mplex';
import Websockets from 'libp2p-websockets';
import DelegatedPeerRouter from 'libp2p-delegated-peer-routing';
import IpfsHttpClient from 'ipfs-http-client';
import PeerId from 'peer-id';

async function main() {
  const delegates = Array(4).fill()
    .map((_, i) => i)
    .map(replica => `node${replica}.delegate.ipfs.io`)
    .map(host => ({ host, port: 443, protocol: 'https' }))
    .map(config => new IpfsHttpClient(config))
    .map(client => new DelegatedPeerRouter(client));

  const p2p = await P2P.create({
    connectionManager: {
      maxPeers: 10,
      pollInterval: 5000,
    },
    modules: {
      peerRouting: delegates,
      transport: [Websockets],
      streamMuxer: [MPLEX],
      connEncryption: [NOISE],
    }
  });

  await p2p.start();

  global.resolve = function(peerId) {
    const pid = PeerId.createFromCID(peerId);
    return p2p.peerRouting.findPeer(pid);
  }
}

main();
