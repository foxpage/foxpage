#!/bin/sh

cpu=1

if [ -n "$CDOS_CPUS" ]; then
	cpu=$(printf "%.0f" $CDOS_CPUS)
else
	cpu=$(cat /proc/cpuinfo | grep "processor" | wc -l)
fi

if [ $cpu -lt 1 ]; then
	cpu=1
fi

if [ $cpu -gt 8 ]; then
	cpu=8
fi

cpu=1

# cd /usr/app

#Start service
pm2-runtime start dist/app.js --name foxpage-server -i $cpu
