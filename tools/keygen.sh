#!/bin/bash

mkdir keys

openssl genrsa -out keys/afip.key 2048

echo "Generating CSR for $1"

openssl req -new -key keys/afip.key -subj $1 -out keys/afip.csr
