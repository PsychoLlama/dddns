import P2P from 'libp2p';
import { NOISE } from 'libp2p-noise';
import MPLEX from 'libp2p-mplex';
import Websockets from 'libp2p-websockets';
import DelegatedPeerRouter from 'libp2p-delegated-peer-routing';
import IpfsHttpClient from 'ipfs-http-client';
import PeerId from 'peer-id';

// I don't need your judgement.
const $ = document.querySelector.bind(document);

async function main() {
  const delegates = Array(4).fill()
    .map((_, i) => i)
    .map(replica => `node${replica}.delegate.ipfs.io`)
    .map(host => ({ host, port: 443, protocol: 'https' }))
    .map(config => new IpfsHttpClient(config))
    .map(client => new DelegatedPeerRouter(client));

  updateStatus('Initializing node...');
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

  // Prevent slower queries from knocking out newer ones.
  let searchNumber = 0;

  $('form').addEventListener('submit', async () => {
    updateStatus('Resolving network addresses...');
    const thisSearch = ++searchNumber;

    const peerCid = $('#peer-id').value;
    const results = await search(peerCid);

    if (searchNumber === thisSearch) {
      updateStatus(results);
    }
  });

  updateStatus('Ready');

  async function search(peerCid) {
    try {
      const peerId = PeerId.createFromCID(peerCid);
      const { multiaddrs } = await p2p.peerRouting.findPeer(peerId);
      const formattedAddrs = JSON.stringify(multiaddrs, null, 2);
      return `Resolved:\n${formattedAddrs}`;
    } catch (error) {
      return `Failed:\n${error}`;
    }
  }
}

// Keep the user loosely informed.
function updateStatus(status) {
  $('#status').innerText = status;
}

// Don't reload the page.
$('form').addEventListener('submit', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

main();
