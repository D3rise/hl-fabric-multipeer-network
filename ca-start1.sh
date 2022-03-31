#!/bin/bash
export PATH=$PATH:$PWD/../bin
export IP=192.168.21.153

docker-compose up -d ca-org{0,1}
echo "Waiting 20 secs to init..."
sleep 20

for i in {0..1}; do
    mkdir orgs/$i orgs/$i/msp orgs/$i/msp/{admincerts,cacerts,users}

    CA="$IP:705$(expr 1 + $i)"
    fabric-ca-client enroll -u http://admin:adminpw@$CA -H orgs/$i/admin
    cp -r orgs/$i/admin/msp/signcerts orgs/$i/admin/msp/admincerts

    cp orgs/$i/admin/msp/signcerts/* orgs/$i/msp/admincerts
    cp orgs/ca/$i/ca-cert.pem orgs/$i/msp/cacerts
done

fabric-ca-client register -u http://$IP:7051 -H orgs/0/admin --id.type orderer --id.name orderer  --id.secret ordererpw
fabric-ca-client enroll -u http://orderer:ordererpw@$IP:7051 -H orgs/0/orderer
cp -r orgs/0/admin/msp/signcerts orgs/0/orderer/msp/admincerts

for i in {1..1}; do
    CA=$IP:705$(expr 1 + $i)
    fabric-ca-client register -u http://$CA -H orgs/$i/admin --id.name peer --id.type peer --id.secret peerpw
    fabric-ca-client enroll -u http://peer:peerpw@$CA -H orgs/$i/peer
    cp -r orgs/$i/admin/msp/signcerts orgs/$i/peer/msp/admincerts
done