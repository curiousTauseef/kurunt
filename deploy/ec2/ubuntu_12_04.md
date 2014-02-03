# AWS EC2 Benchmarking and Testing of Kurunt

## Setup EC2

These instructions are for using Ubuntu 12.04 LTS.

Open ports in security group, port 22 so can ssh into instance. You will also need to open ports for the following (if required).  

```
8888  # Web admin (default port).
9001  # Stram report.
5555  # http input stream.
6001+ # tcp/udp input stream (from web admin, as set by their apikey).
7001+ # tcp/udp input stream (from asmodule, as set by their apikey).

```
Kurunt uses axon for its message processing, if you have setup kurunt to run across multiple machines you will need to set your topology.json, if any of these machines are outside of the AWS security group you will need to open thous ports acordingly.  

After creating instance.  

Log into instance, using the instances public dns address:
```
ssh -i /Documents/kurunt/hosting/AWS/ec2.pem ubuntu@ec2-54-234-30-169.compute-1.amazonaws.com
```

### Commands:

For root access.
```
sudo su
```

Update.
```
apt-get -y update && apt-get upgrade
```

Install node.js.
```
apt-get install -y python-software-properties python g++ make
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get install nodejs
```

Install kurunt.
```
npm install -g kurunt
```

If installing globally will install in the following location.
```
/usr/lib/node_modules/kurunt
```
CLI will be linked as.
```
/usr/bin/kurunt -> /usr/lib/node_modules/kurunt/bin/cli.js
```

## Benchmarking

Tested again a single c3.large (2 cores) instance, good at around 15,000 mps.


## Notes

### top
When benchmarking to view load on each cpu.
```
top
```
Then enter.
```
1
```

