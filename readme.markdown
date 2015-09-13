# html-version-spec

Track html file revisions with semver and inline metadata.

The purpose of this specification is to make the web more distributed,
permanent, and robust against outages, censorship, and orphaned content.

# version

You are viewing version 1.0.1 of this specification.

Versions of this specification adhere to [semver](http://semver.org).

# overview

This specification builds on existing
[subresource integrity](http://w3c.github.io/webappsec/specs/subresourceintegrity/),
[html link attributes](http://www.w3.org/wiki/HTML/Elements/link#HTML_Attributes)
and [meta-version](https://github.com/dvorapa/meta-version)
to provide a comprehensive versioning system for secure, signed, and permanent
single-page web applications.

This specification is intended as a publishing format for web developers that
application loaders will consume. An application loader might be a wrapper
around a single web application to provide versioning or a loader might provide
a collection of programs through a mobile home screen or desktop icon-style
interface, as an example.

HTML files, once published, are immutable. Some content-addressed delivery
protocols implicitly convey the hash of the content in their addressing scheme,
but for other delivery mechanisms like http there are `integrity` and
`signature` attributes to add additional verification. Embedded content hashes
create a merkle DAG structure that protects against tampering and guards against
availability outages and orphaned content. Application loaders can query
secondary archives and mirrors by hash when a primary resource is unavailable.

The design of this specification is tailored to work with existing HTTP servers,
but also to support emerging new distributed protocols such as
[ipfs](https://ipfs.io/), [webtorrent](https://webtorrent.io/), and
[ssb](https://github.com/ssbc).

# example

``` html
<html>
  <head>
    <meta name="version" content="1.2.0">
    <link rel="signature" href="https://example.com/versions/1.2.0.html.sig"
      identity="ed25519-jOT2v2uG9VFb0oGyFkGUn9w/WBwSf92HfdJZuY61brU=">
    <link rel="version" href="https://example.com/versions/1.0.0.html"
      version="1.0.0" integrity="sha256-mPjSxFzbBSy+LyCVyylIf5E/7zswbvsL4D/qxCAqrjY">
    <link rel="version" version="1.0.0"
      href="magnet:?xt=urn:btih:4822271aa656ba6913a14edb117d3c4dc50f1209">
    <link rel="version" href="https://example.com/versions/1.0.1.html"
      version="1.0.1" integrity="sha256-Qra3bKdpoprvRqkTF96gWOa0dPkA8MHYxOJqVsvkzIY=">
    <link rel="version" version="1.0.1"
      href="magnet:?xt=urn:btih:d0320ebba035cc86526baae771da14912895e113">
    <link rel="version" version="1.0.1"
      href="ipfs:QmNcojAWDNwf1RZsPsG2ABvK4FVs7yq4iwSrKaMdPwV3Sh">
    <link rel="version" href="https://example.com/versions/1.1.0.html"
      version="1.1.0" integrity="sha256-9VGwnCJuLbwo/N+TL1Ia9whqP8kVwEO8K0IFTUQk19o=">
    <link rel="version" version="1.1.0"
      href="ipfs:QmWMey8Dd1ZH9XWRP3d7N1oSoL35uou1GSMpBwt4UahFSD">
    <link rel="last" href="https://example.com/versions/latest.html">
    <link rel="last"
      href="magnet:?xt=urn:btih:4a533d47ec9c7d95b1ad75f576cffc641853b750">
    <link rel="last" href="ipns:QmWJ9zRgvEvdzBPm1pshDqqFKqMXRJoHDQ4nuocHYS2REk">
    <link rel="prev" version="1.1.0">
  </head>
  <body>
    wow
  </body>
</html>
```

You should inline all stylesheets, images, and javascript assets into a single
HTML file so that versions can be tracked under a single hash.

# elements

This specification consists of a list of `<meta>` and `<link>` elements with
certain expected attributes.

It is valid but entirely optional to use self-closing (`/>`) syntax for `<link>`
and `<meta>` tags.

It is recommended but not required to put these elements in a `<head>` block.

## meta version (required)

An html file MUST have a SINGLE meta version tag with a format specified in
[meta-version](https://github.com/dvorapa/meta-version):

* The `content` attribute MUST be a valid [semver](http://semver.org/) version.
* The `name` attribute MUST be `"version"`.

The version content refers to the semantic version of the current html file.

Example:

``` html
<meta name="version" content="1.2.3">
```

## signature link

A `<link rel="signature">` links to a cryptographic signature of the current
document contents.

* rel - "signature" (required)
* href - external resource where the detached signature data can be found
* identity - whitespace-separated list of public keys allowed to sign updates.
See the identities section below.

The content of the the signature payload at `href` depends on the cryptographic
algorithms in use. Base64 is recommended to avoid binary encoding issues.

Some protocols like ipfs, ssb, bittorrent/webtorrent (with bep44) have
cryptographic signatures built into the routing layer. For these protocols,
a signature link is not necessary. However, a different signature than the
protocol signature can provide an extra layer of verification and is recommended
if there are protocols like http in use that don't have signatures built into
the addressing mechanism.

For a public key generated by libsodium's `crypto_sign_keypair()`, the link
signature might be:

``` html
<link rel="signature" href="https://example.com/versions/1.2.0.html.sig"
  identity="ed25519-jOT2v2uG9VFb0oGyFkGUn9w/WBwSf92HfdJZuY61brU=">
```

and for the `example.html` file included in this specification, the contents of
`https://example.com/versions/1.2.0.html.sig` would be:

```
gerBksEAbycxxPN6WoNjUjWkl9r9+uwC5bWlmxR7ud5X9sr2pxY4fSJXq2pSlo/4dNVZ6ktJoP3HrErJ3+aWDA==
```

## prev link

If there are any previous versions of the application, the current html file
MUST include a `<link rel="prev">` element.

An HTML file may contain many `<link rel="prev">` elements to redundantly
enumerate different ways to fetch the desired content, but all the hrefs should
point at the exact same content.

The attributes for this `<link>` element are:

* rel - "prev" (required)
* href - external resource where the content can be found
* integrity - See the section on the integrity attribute below.
* version - if `href` is not given in this element and there is a corresponding
`<link rel="version">` defined elsewhere in the document, specifying a `version`
attribute will populate the `href` and `integrity` attributes from the found
versions.

Either `integrity` or `version` are required. It's OK to have both.

Protocols without implicit content verification such as http are strongly
recommended to use the optional `integrity` attribute. Other protocols which are
content-addressed can skip including a an `integrity` attribute.

Example:

``` html
<link rel="prev" href="https://example.com/versions/1.2.2.html"
  integrity="sha256-x8x4WcOdpYiETf5EwK0Y5Jwa4e8Tsc7gkIwwcyyu3B0=">
```

with a version tag:

``` html
<link rel="version" href="https://example.com/versions/1.2.2.html"
  integrity="sha256-x8x4WcOdpYiETf5EwK0Y5Jwa4e8Tsc7gkIwwcyyu3B0=">
<link rel="prev" version="1.2.3">
```

## last link

To tell an application loader how to fetch new content, use the
`<link rel="last">` element.

Each `<link rel="last">` element points at a resource where updates may appear.

Last links use these attributes:

* rel - "last" (required)
* href - external URI where updates may appear

If a `<link rel="signature">` element is present, an application loader should
use that identity to determine if the resource in the last link `href` attribute
is from an allowed key. If the key is not in the approved list, application
loaders should walk the merkle DAG forward from the last link `href` to the
current document to check for new identities in updates signed by already
trusted identities.

It's not necessary to check any signatures below the current document, because
the merkle DAG structure implicitly verifies their integrity.

Example:

```
<link rel="last" href="https://example.com/versions/latest.html">
<link rel="last"
  href="magnet:?xt=urn:btih:4a533d47ec9c7d95b1ad75f576cffc641853b750">
<link rel="last" href="ipns:QmWJ9zRgvEvdzBPm1pshDqqFKqMXRJoHDQ4nuocHYS2REk">
```

## version link

Provide [semantic versioning](http://semver.org) for HTML content
with a `<link rel="version">` element and these attributes:

* rel - "version" (required)
* version - semver-compatible version string (required)
* href - external resource where the content can be found
* integrity - See the section on the integrity attribute below.

There can be multiple `<link rel="version">` tags for the same version and
content, but different hrefs.
Once a version has been associated with some content, no other content may
be defined for that version. Application loaders MUST treat multiple content
mapping to the same version as integrity errors.

A document doesn't need to exaustively enumerate past versions. Version info is
intended to shortcut reading in the entire merkle DAG by traversing every `<link
rel="prev">` element recurively, reducing the number of round-trip requests.

Example:

``` html
<link rel="version" href="https://example.com/versions/1.0.0.html"
  version="1.0.0" integrity="sha256-mPjSxFzbBSy+LyCVyylIf5E/7zswbvsL4D/qxCAqrjY=">
<link rel="version" version="1.0.0"
  href="magnet:?xt=urn:btih:4822271aa656ba6913a14edb117d3c4dc50f1209">
```

# integrity attribute

The format of the `integrity` attribute is defined in the
[subresource integrity specification](http://w3c.github.io/webappsec/specs/subresourceintegrity/#the-integrity-attribute).

To briefly summarize the most common use case, integrity data begins with an
algorithm name followed by a dash followed by a base64 encoded digest.

For example, using sha256, the string "test" becomes:

```
sha256-n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=
```

Multiple hashes may be specified in the same integrity attribute value,
whitespace-separated. This is useful to gracefully upgrade to newer hashing
algorithms with a fallback for older clients.

The specification [requires that sha256, sha512, and sha384 are supported](http://w3c.github.io/webappsec/specs/subresourceintegrity/#cryptographic-hash-functions).
Additional hashing algorithms may be used.

# identity attribute

The `identity` attribute in the elements above all use the following format.
Identities are public keys used for signing content. Each identity in the
identity attribute represents a key which is allowed to sign new releases.

There can be one or more identities in an `identity` attribute. Identities are
whitespace-separated. Each identity contains the name of the public key
algorithm name followed by a literal dash (`"-"`) followed by the
base64-encoded public key data.

For example, a public key generated from libsodium's `crypto_sign_keypair()`
would be:

```
ed25519-1EG6xEDUkN9Mmx8AAXfQMiUbw4uYzLUrfa52sGjSWD8=
```

# license

This document is dedicated to the public domain.

