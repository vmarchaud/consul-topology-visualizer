# Consul Topology

This tool is made to vizualise latency between consul nodes based on the [Coordinate API](https://www.consul.io/docs/internals/coordinates.html) to compute the data.

**Demo**: I've deployed a [demo there](https://consul-topology-demo.cloud.pm2.io/) if you want to checkout, note that it's use the demo cluster of hashicorp ([available here](https://demo.consul.io/))


**Totally shameless promotion** : If you are looking for monitoring your NodeJS infrastructure, i work on [PM2 Enterprise](https://pm2.io/enterprise) which can help you, for more details send me an email: valentin at keymetrics dot io


![](https://i.imgur.com/j6v0iep.png)


## Inspiration

Some people might recognize the similarity with [Golderpinger](https://github.com/bloomberg/goldpinger) which is indeed the tool that i used to kickstart my version, so big thanks you to them for open sourcing this tool in the first place.

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
I've built an image for deployment it into my production environment so if you want to re-use it: https://cloud.docker.com/repository/docker/vmarchaud/consul-topology

## More screenshots
- https://i.imgur.com/j6v0iep.png
- https://i.imgur.com/pML1dIH.png