---
title: "Static typing: which language to choose?"
tags: ["static typing", "typescript", "reason", "elm", "purescript"]
excerpt: ""
date: 2020-03-21
event: "FrontConf Munich"
type: "lecture"
duration: 30
post: ""
img: ""
recording: "https://www.youtube.com/watch?v=oQFkvEoh1BA"
slides: "https://slides.com/aleksandrasikora/static-typing"
place: "online"
---

#### CFP

**Elevator pitch**

Statically typed language? Sounds cool! Statically typed language and large JavaScript codebase? Sounds like a lot of work... Learn how we evaluated our options in Hasura and made the decision on which language to choose!

**Short summary**

We wanted to introduce a statically typed frontend language to the Hasura Console for quite some time now. Recently we evaluated some options such as PureScript, TypeScript, ReasonML, and Elm. We had the following points to consider:

- We use React extensively, so we need something that goes with React well.
- Hasura Console has a pretty big codebase already, migration cost really matters.
- We want to enhance developer experience for us and for the external contributors.

During this talk, I'm going to show the pros and cons of the languages we analyzed. I'll present how their adoption would look like and what catches we would face along the way. I will also tell what we finally chose and which aspects affected our decision the most.

#### Notes

**How will I deliver the talk?**

- Lecture
- Code snippets
- Charts, flowcharts

**What will I show?**

- Why bother about static typing. All the pros and cons of statically typed languages that need to be considered. In general. I won't focus on Hasura here.
- Why did we consider statically typed language?
- ReasonML — what, why, how
- TypeScript — what, why, how
- PureScript — what, why, how
- Elm — what, why, how
- Comparison between these languages — some charts: DX vs. Safety, from different perspectives, etc.
- Summary — what did we choose and why.

**What is the one thing I want people to learn?**

How to make the decision whether to adopt statically typed language. And which one.

**Why?**

The decision is hard. I'd like to present what aspects are crucial and need to be considered. I'll also show that you can give up on something to get something else. There's no one best choice for each project.
