#!/bin/bash
export PATH=$PATH:$PWD/../bin
export IP=192.168.21.153

configtxgen -profile WSRGenesis -channelID syschannel -outputBlock orgs/0/orderer/genesis.block
configtxgen -profile WSR -channelID wsr -outputCreateChannelTx orgs/common/wsr.tx

configtxgen -profile WSR -channelID wsr -outputAnchorPeersUpdate orgs/common/1.tx -asOrg Users
configtxgen -profile WSR -channelID wsr -outputAnchorPeersUpdate orgs/common/2.tx -asOrg Shops
configtxgen -profile WSR -channelID wsr -outputAnchorPeersUpdate orgs/common/3.tx -asOrg Bank

docker-compose up -d orderer peer-org1 cli-org1
echo "Waiting 20 secs to init..."
sleep 20

docker exec -ti cli-org1 peer channel create -c wsr -o $IP:7050 -f wsr.tx

for i in {1..1}; do
    docker exec -ti cli-org$i peer channel join -o $IP:7050 -b wsr.block
    docker exec -ti cli-org$i peer channel update -c wsr -o $IP:7050 -f $i.tx
done