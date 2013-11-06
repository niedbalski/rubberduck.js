#!/bin/bash

for release in `git status -u -s --porcelain | cut -d " " -f2 | grep 'releases/'`; do
	git add $release;
done;

exit;
