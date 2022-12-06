<!--
### Q: What about the transport mechanismin RPC?
The transport independence of RPC isolates the application from the physical and logical elements of the data communications mechanism and allows the application to use a variety of transports.

### Q: Why 1981? Wasn't it developed earlier?
Request–response protocols date to early distributed computing in the late 1960s, theoretical proposals of remote procedure calls as the model of network operations date to the 1970s, and practical implementations date to the early 1980s. [Bruce Jay Nelson](https://en.wikipedia.org/wiki/Bruce_Jay_Nelson "Bruce Jay Nelson") is generally credited with coining the term "remote procedure call" in 1981.

### Q: What's the difference between RPC and gRPC?
gRPC is an open-source universal API framework that is classified under RPC. Similar to RCP, gRPC allows developers to define any kind of function calls, rather than selecting from predefined options such as PUT and GET in the case of REST. It uses protobuf as IDL.

### Q: Did RPC use http initially?
No. HTTP is an application layer protocol created in the beginning of 90s. HTTP uses tcp/ip (just tcp in the initial versions). It's a transport layer.

### Q: Is UDP preferred over TCP for RPC?
UDP is not generally preferred to TCP when doing remote procedure calls. In fact, most implementations of RPC technologies like CORBA, XML-RPC, SOAP, Java RMI, use TCP and not UDP as underlying transport. TCP is preferred here because contrary to UDP it already cares about reliability (dealing with packet loss, duplication, reordering) and can also easily and transparently handle arbitrary sized messages.
UDP was used with classic Sun-RPC (used with NFS) was primarily used in a local network used UDP - contrary to current RPC technologies which are often used in more complex network environments. In this kind of environment and at this time (long ago) UDP offered a smaller overhead and a faster recovery from network problems than TCP since there is no initial handshake and necessary retransmits, reordering are in full control of the RPC layer and can be tuned to the specific use case. So while preferring UDP for specific RPC in this environment made sense it cannot be said that UDP should be preferred for any kind of RPC.

### Q: REST vs. RPC
-   With RPC the primitives typically are function names, arguments and results.
-   With REST the primitive is a 'resource representation'.

In REST you ask the server "can you give me the state of this resource" or "here's a state of this resource, please store it". In RPC you ask "can you call this procedure".

It means when a RESTful API is called, the server will _transfer_ to the client a representation of the _state_ of the requested resource.

While RPC seems to be more flexible, with REST you gain a lot of guarantees about the API.

You can implement a REST service of top of any RPC implementation by creating **methods** that conform REST constraints.

What people are really asking when they ask whether they should use RPC or REST is: _“Should I make my service RESTful by exposing my resources via vanilla HTTP, or should I build on a higher level abstraction like SOAP or XML-RPC to expose resources in a more customized way?”_.

One of the reason why REST was preferred over RPC is that it's supposed to be easier to learn. Learning RPC API is like learning a programming library — you have to make yourself familiar with the method names, custom parameters and custom responses. While in REST (if it's truly RESTful) you need to know a few URLs.

However, it's not the case anymore in the context of fullstack JavaScript apps (that I'm talking about today), because we have TypeScript and autocompletion, so we don't really have to learn the library of procedures, and we're less likely to make a mistake — TypeScript can catch if we provided wrong arguments.

### Q: REST vs. HTTP

HTTP is a contract, a communication protocol.
REST is a concept. It's an architectural style which may use HTTP, FTP or another communication protocol. But it's commonly used with HTTP. It imples a series of constraints about how server and client should interact.

REST was inspired by WWW shich laregely used HTTP.

**The HTTP 1.1 protocol was build to be the ideal protocol to follow principles of REST.**

### Q: HTTP vs. RPC
The HTTP model is an inverse of RPC.
In RPC the addressable units are procedures. In HTTP it's resources. The URL stands for Uniform **Resource** Location.
What makes HTTP significantly different from RPC is that the requests are directed to resources using a generic interface with standard semantics that can be interpreted by intermediaries almost as well as by the machines that originate services.
RPC mechanisms, in contrast, are defined in terms of language APIs, not network-based applications.

### Q: Can I use caching with Blitz RPC or tRPC?

tRPC queries are GET requests so you can use HTPP headers to handle caching.
Blitz recently added a support for GET (previously both queries and mutations were POSTs), so it's the same thing here.
-->
