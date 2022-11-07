---
title: "SQL Tricks and Concepts You Didn't Know About"
tags: ["SQL"]
excerpt: ""
date: 2022-06-17
event: "Prisma Day"
type: "conference"
duration: 20
post: ""
img: ""
recording: "https://www.youtube.com/watch?v=QoCGmvVCqto"
slides: "https://docs.google.com/presentation/d/1gpl5gzDhFnBlQEQuAJJBQRAgm_aZZgBa5fI3SqFMplc/edit?usp=sharing"
place: "Berlin 🇩🇪"
---

### Abstract

Did you know that some SQL variants are Turing complete and let you write any program in SQL? Of course, no one's that crazy... But what are the limits of SQL? What are some crazy things we can do with it? I'm going to go over a few of them in this talk. It won't be only fun stuff, though! I'm going to show some more practical but lesser-known concepts too. Let's discover some hidden SQL traits together!

### Resources


* [Madlebrot Set implemented in T-SQL](https://thedailywtf.com/articles/stupid-coding-tricks-the-tsql-madlebrot)

* [Brainfuck interpreter SQLite](https://www.reddit.com/r/SQL/comments/81barp/i_implemented_a_brainfck_interpreter_in_pure_sql/)

* [Brainfuck interpreter with procedures in T-SQL](https://github.com/PopovMP/BrainFuck-SQL/blob/master/BrainFuck.sql)

* [ltree Docs](https://www.postgresql.org/docs/current/ltree.html)

* [Looking inside postgres at a gist index](https://patshaughnessy.net/2017/12/15/looking-inside-postgres-at-a-gist-index) by [Pat Shaughnessy](https://twitter.com/pat_shaughnessy)

* [Saving a tree in postgres using ltree](https://patshaughnessy.net/2017/12/13/saving-a-tree-in-postgres-using-ltree) by [Pat Shaughnessy](https://twitter.com/pat_shaughnessy)

* [How SQL Server handles recursive CTEs](https://www.sqlshack.com/ready-set-go-sql-server-handle-recursive-ctes/)

* [Oracle docs on the Model caluse](https://docs.oracle.com/cd/B19306_01/server.102/b14223/sqlmodel.htm)

<!-- 
### Notes

(Random notes that I made while doing research for this talk)

#### CTE

- The only way to declare variables in SQL.
- Help simplify a query
- Work as virtual tables (with records and columns), created during the execution of a query, used by the query, and eliminated after query execution
- Can act as a bridge to transform the data in source tables to the format expected by the query
- CTE is like a **named query**, whose result is stored in a virtual table (a CTE) to be referenced later in the main query
- You can think of CTE as an improved version of derived tables that more closely resemble a non-persistent type of view
- Help improve readability
    - Example: https://learnsql.com/blog/improving-query-readability-common-table-expressions/
- Let's you do multi level aggregates
    - Example: https://learnsql.com/blog/when-to-use-cte/
- CTE vs subquery: https://learnsql.com/blog/sql-subquery-cte-difference/
- Cool article on usage of CTE for a MySQL fuckup: https://blog.jooq.org/mysql-bad-idea-666/
- **Q: Is CTE a view?**
    - The key thing to remember about SQL views is that, in contrast to a CTE, **a view is a physical object in a database and is stored on a disk**. However, views store the query only, not the data returned by the query. The data is computed each time you reference the view in your query.

#### Recursive CTE 

- Use cases:
    - Organization structure
    - Tasks with subtasks
    - Links between web projects
    - Multi-level comments
    - Menu structure
- Example: water intake or habits streak
- Useful for:
    - Building hierarchies
    - Traversing the database
    - Generating arbitrary rowsets (e.g. natural numbers)
- **Recursive query** = joining a rowset with itself arbitrary number of times
- **Anchor set** = base rowset of a recursion
- **Recursive part** = operation done over the previous rowset
- At the first glance, RCTE seems like an infinite loop — to compute R we need to compute R.
    - However R doesn't actually reference itself, it references the previous result, it stops when the previous result is empty
    - Base query doesn't involve R — only the recursive part does
- Base query -> R0 -> r query (R0) -> R1 -> r query (R1) -> .... -> Rn (empty) -> r query (Rn) => UNION ALL R0...Rn
- What about the `recursive` keyword?
- __I think__ it's not needed in MS Server, but required everywhere else? At least in postgres and mysql.
- CTE: `WITH R AS (query) <query involving R>`
- RCTE: `WITH R AS (<query involving R>) <query involving R>`
- You can set MAXRECURSION

#### Window functions
- Def: aggregations / rankings (like RANK etc, assigning a rank to a row) on a subset of rows relative to the current row being transformed by select.
- You can look ahead or behind and do aggregation or rankings 
- It's like a **moving window**
```sql
myFunction (...) OVER (
  PARTITION BY <column> -- partition the data based e.g. on age
  ORDER BY <column> -- order PARTITION (it orders just the partition)
  ROWS BETWEEN ... AND ...-- how many ahead and behind, optional and not used 
)
```
- Partition works kinda like a __group by__ — the sliding window will only include the partition
- Cool example: https://blog.jooq.org/cume_dist-a-lesser-known-sql-gem/

#### ORACLE MODELS

- So if you take a look at Excel, it's an amazing example of a reactive programming — you have a cell, you have dependencies (cells that listen to it) and all dependencies are updated automatically
- Now let's say we want some reactive SQL too
- With [[ORACLE MODELS]] we can have spreadsheets in the database
- Prisma doesn't support Oracle
- Read https://docs.oracle.com/cd/B19306_01/server.102/b14223/sqlmodel.htm
```sql
SELECT ... FROM
MODEL (
  DIMENSIONS BY ... -- speadsheet dimensions
  MEASURES ... -- cell type
  RULES ... -- formulas
)
```

#### LTree

- Postgres has a ltree extension which is a part of a standard package — can be loaded in most servers (meaning should be provided by most services)
- Ltree implements a data type ltree for representing labels of data stored in a hierarchical tree-like structure.
- Good explanation: [https://patshaughnessy.net/2017/12/13/saving-a-tree-in-postgres-using-ltree](https://patshaughnessy.net/2017/12/13/saving-a-tree-in-postgres-using-ltree) -->
