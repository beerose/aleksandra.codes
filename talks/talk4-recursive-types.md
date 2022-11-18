---
title: "Persistent data structures thanks to the type aliases"
tags: ["typescript"]
excerpt: ""
date: 2019-10-30
event: "Wrocław TypeScript"
type: "lecture"
duration: 30
post: "/persistent-data-structures"
img: ""
recording: ""
slides: "https://github.com/blackdahila/wroc-ts-08-talk"
place: ""
---

### Notes

**How**

With a kickass 15 minute presentation, entirely in VSCode.

**Why**

It's well known that mutability is evil and often troublesome, but you can stop shallow copying arrays (or god-forbid deep copying) every time you want to change them. Let me show you how.

Immutable data structures are the tool for the job when immutability is required.
Time to add them to our toolset.

Persistent data structures are good to know when your product needs time-travel capabilities (like text inputs -- they are pretty bad if CTRL+Z doesn't work).

**What**

What does the persistent data structure mean?
Meet Cons List
How it looks in TypeScript 3.7
How it looked before TS3.7
Functions operating on ConsList
(big reveal) Instances of fp-ts typeclasses
Benchmarks of Cons List vs Array operations
