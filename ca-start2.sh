#!/bin/bash
export PATH=$PATH:$PWD/../bin
export IP=192.168.21.153

docker-compose up -d ca-org{2,3}
echo "Waiting 20 secs to init..."
sleep 20

for i in {2..3}; do
    mkdir orgs/$i orgs/$i/msp orgs/$i/msp/{admincerts,cacerts,users}

    CA="$IP:705$(expr 1 + $i)"
    fabric-ca-client enroll -u http://admin:adminpw@$CA -H orgs/$i/admin
    cp -r orgs/$i/admin/msp/signcerts orgs/$i/admin/msp/admincerts

    cp orgs/$i/admin/msp/signcerts/* orgs/$i/msp/admincerts
    cp orgs/ca/$i/ca-cert.pem orgs/$i/msp/cacerts

    fabric-ca-client register -u http://$CA -H orgs/$i/admin --id.name peer --id.type peer --id.secret peerpw
    fabric-ca-client enroll -u http://peer:peerpw@$CA -H orgs/$i/peer
    cp -r orgs/$i/admin/msp/signcerts orgs/$i/peer/msp/admincerts
done