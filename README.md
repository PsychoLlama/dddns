# Decentralized Address Resolution
Like DDNS, but decentralized. [Live demo](https://psychollama.github.io/dddns/).

## Purpose
Say I want to open an encrypted socket into a LAN server from a static site to power a self-hosted app. I could use a DDNS service, but what's the point of P2P networking if it's facilitated by a centralized service? I could hard-code the IP, but that changes too easily. What I want is _Decentralized_ DDNS.

So I used IPFS to store my IP candidates allowing me to read them back from a web gateway, of which several exist. You could imagine observing your IP and publishing a new JSON object under an [IPNS](https://docs.ipfs.io/concepts/ipns/) key, but you don't have to. IPFS propagates this information automatically through its [WAN peer DHT](https://docs.ipfs.io/concepts/dht/). Bonus points because IPFS already implements STUN and UPnP.

Now the problem becomes how to get the values out of the DHT from a browser. As it would happen, the libp2p team is working on exactly this problem and provides some attractive gateways serving as routing delegates. Their sole job is tracking the peer DHT. Instantiate a [libp2p](https://libp2p.io) node served by those delegates and you can (finally) open a socket.

This site serves as a light frontend to the routing delegates providing network address lookups for peer IDs. You could use the same principles to power a fully P2P application.

## Drawbacks
This approach still relies on federated servers. If they go down or change the protocol, the approach falls apart. On the flipside, you can easily [host your own](https://github.com/libp2p/js-libp2p-delegated-peer-routing) and run it alongside. You should do that for any critical application anyway.

## Usage
- Start a local IPFS node using [ipfs-core](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-core):
  ```js
  // Use the JavaScript implementation.
  // The Golang version doesn't advertise in the same way.
  require('ipfs-core').create()
  ```
- Copy and paste the peer ID into [the DDDNS search form](https://psychollama.github.io/dddns/).
