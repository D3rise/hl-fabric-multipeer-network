#!/bin/bash
export PATH=$PATH:$PWD/../bin
export IP=192.168.21.153
export SIP=192.168.21.153

docker-compose up -d peer-org2 peer-org3 cli-org2 cli-org3
echo "Waiting 20 secs to init..."
sleep 20

for i in {2..3}; do
    docker exec -ti cli-org$i peer channel join -o $SIP:7050 -b wsr.block
    docker exec -ti cli-org$i peer channel update -c wsr -o $SIP:7050 -f $i.tx
done