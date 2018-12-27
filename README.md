# Consul Topology

This tool is made to vizualise latency between consul nodes based on the [Coordinate API](https://www.consul.io/docs/internals/coordinates.html) to compute the data.


![](https://i.imgur.com/j6v0iep.png)

![](./extras/screenshot.png)

## Inspiration

Some people might recognize the similarity with [Golderpinger](https://www.consul.io/docs/internals/coordinates.html) which is indeed the tool that motivated me to do this one.

The first difference is that i only wanted to vizualise things and didn't want to actually get alerted nor get metrics from this tools. But it's pretty trivial so someone need it, just ask and i might add it.

The second difference is that we don't actually need to deploy anything in your infrastructure since Consul compute pretty much all the data for us.

## Configuration

As said earlier, you don't need to deploy anything along side your infrastructure, but there are still some configuration :

- `CONSUL_HTTP_ADDR`: The address of the consul endpoint (can be either a master or client)
- `CONSUL_CACERT`: The **path** (on the FS) to the Consul CA cert
- `CONSUL_CLIENT_CERT`: The **path** (on the FS) to the client cert
- `CONSUL_CLIENT_KEY`: The **path** (on the FS) to the client private key

Of course if you can access Consul in HTTP, you don't need to configure the certificate.

Note: It's the same environment variables as the CLI so it avoid you re-configured them on your laptop if you already have the CLI :)

## Notes

I hacked this quickly during the holiday so it might not be the state of the art UX or code. Feel free to make a PR to implement the things that you want.




https://i.imgur.com/j6v0iep.png
https://i.imgur.com/undefined.png