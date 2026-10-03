import type { StudyPage } from '@/types/curriculum'
import {
  callout,
  code,
  createPage,
  example,
  h3,
  p,
  section,
  table,
  ul,
} from '../../../helpers'

export const day1Module3Pages: StudyPage[] = [
  createPage(
    'd1-p9',
    'SQL Fundamentals',
    12,
    [
      'Write SELECT/WHERE/ORDER BY with NULL-safe predicates',
      'Distinguish DDL, DML, DCL, TCL',
      'Explain DISTINCT, LIMIT/OFFSET, and three-valued logic',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('SQL is a declarative language: you describe the result set; the optimizer chooses access paths. Interview fluency means predicates, NULL, sorting, and knowing which statements change schemas vs data vs permissions vs transactions.'),
          table(
            ['Category', 'Examples', 'Purpose'],
            [
              ['DDL', 'CREATE, ALTER, DROP', 'Schema'],
              ['DML', 'SELECT, INSERT, UPDATE, DELETE', 'Data'],
              ['DCL', 'GRANT, REVOKE', 'Permissions'],
              ['TCL', 'BEGIN, COMMIT, ROLLBACK', 'Transactions'],
            ],
          ),
        ]),
        section('how', 'Core query shape', [
          code(
            'sql',
            `SELECT DISTINCT department_id, COUNT(*) AS n
FROM employee
WHERE hired_at >= DATE '2024-01-01'
  AND manager_id IS NOT NULL
ORDER BY n DESC
LIMIT 10 OFFSET 0;`,
            'SELECT list → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT',
          ),
          h3('NULL and three-valued logic'),
          p('Comparisons with NULL yield UNKNOWN, not TRUE. WHERE keeps only TRUE rows. Use IS NULL / IS NOT NULL. `NULL = NULL` is unknown; `WHERE col = NULL` filters nothing.'),
          callout(
            'mistake',
            'Using `WHERE col = NULL` instead of `IS NULL` is a classic interview trap.',
          ),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“What does declarative mean?” → specify what, not how.'),
          p('“Why is NULL special?” → three-valued logic; aggregates ignore NULL except COUNT(*).'),
        ]),
      ],
      commonMistakes: [
        'WHERE col = NULL',
        'Assuming ORDER BY is free without indexes',
        'Confusing LIMIT without ORDER BY (non-deterministic)',
      ],
      interviewQuestions: [
        'DDL vs DML?',
        'What does SELECT DISTINCT do?',
        'How do you filter NULL values?',
        'What is ORDER BY?',
        'Why is SQL called declarative?',
      ],
      intermediateInterviewQuestions: [
        'Explain three-valued logic with an example.',
        'COUNT(*) vs COUNT(col)?',
        'What happens if LIMIT is used without ORDER BY?',
        'What is a prepared statement and why use it?',
        'BETWEEN and inclusive bounds — pitfalls?',
      ],
      advancedInterviewQuestions: [
        'How does the optimizer use statistics for a simple SELECT?',
        'Why might SELECT * be problematic in production?',
        'Deterministic vs non-deterministic queries under concurrency?',
        'Collation and ORDER BY for strings — what can surprise you?',
        'Difference between WHERE filtering and application-side filtering?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain how WHERE handles NULL.',
          answer:
            'Any comparison with NULL yields UNKNOWN. WHERE retains only rows where the predicate is TRUE, so UNKNOWN rows disappear. That is why we write IS NULL. Aggregates like SUM skip NULL; COUNT(*) counts rows, COUNT(col) skips NULL col values.',
        },
      ],
      keyTakeaways: [
        'Know DDL/DML/DCL/TCL labels',
        'NULL ⇒ IS NULL; never = NULL',
        'ORDER BY before LIMIT for meaningful tops',
      ],
    },
  ),

  createPage(
    'd1-p10',
    'Joins',
    14,
    [
      'Apply INNER, LEFT, RIGHT, FULL, CROSS, and SELF joins',
      'Place predicates in ON vs WHERE correctly for outer joins',
      'Predict row multiplication from many-to-many joins',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('A join combines rows from two tables based on a condition. Inner joins keep matches; outer joins keep non-matches with NULLs on the padded side.'),
          table(
            ['Join', 'Keeps'],
            [
              ['INNER', 'Matching pairs only'],
              ['LEFT OUTER', 'All left + matches; NULL right if none'],
              ['RIGHT OUTER', 'All right + matches'],
              ['FULL OUTER', 'All from both; NULL pad where needed'],
              ['CROSS', 'Cartesian product'],
              ['SELF', 'Table joined to itself (aliases)'],
            ],
          ),
          diagramHint(),
        ]),
        section('on-vs-where', 'ON vs WHERE', [
          p('For INNER JOIN, ON and WHERE filtering often coincide. For LEFT JOIN, predicates on the right table in WHERE can effectively turn it into an inner join by rejecting NULL-padded rows.'),
          code(
            'sql',
            `-- Keep customers even without orders in 2024:
SELECT c.id, o.id
FROM customer c
LEFT JOIN orders o
  ON o.customer_id = c.id AND o.year = 2024;
-- vs AND in WHERE o.year = 2024 which drops customers with no 2024 order`,
          ),
        ]),
        section('pitfalls', 'Row explosion', [
          example('Fan-out', [
            p('Joining orders to order_lines multiplies rows per line. Aggregating after join without care double-counts order totals. Fix: aggregate lines in a subquery first, or use careful GROUP BY.'),
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“Difference INNER vs LEFT?” → LEFT keeps unmatched left rows.'),
          p('“When does LEFT become INNER?” → filtering right columns in WHERE.'),
          p('“How does the engine join?” → nested loop / hash / merge — Day 1 awareness; details with EXPLAIN.'),
        ]),
      ],
      commonMistakes: [
        'Forgetting aliases on self-joins',
        'Unexpected duplicates from missing join predicates',
        'Putting right-table filters in WHERE on a LEFT JOIN accidentally',
      ],
      interviewQuestions: [
        'INNER vs LEFT JOIN?',
        'What is a CROSS JOIN?',
        'What is a self-join use case?',
        'What is FULL OUTER JOIN?',
        'Why do joins multiply rows?',
      ],
      intermediateInterviewQuestions: [
        'ON vs WHERE with outer joins?',
        'Write a query for customers with no orders.',
        'Hash join vs nested loop — when each?',
        'How do you debug unexpected row counts after a join?',
        'Join elimination / join order — why optimizer cares?',
      ],
      advancedInterviewQuestions: [
        'Implement anti-join with NOT EXISTS vs LEFT JOIN IS NULL — plans?',
        'Skewed join keys and hash join spills — what happens?',
        'Why avoid SELECT * in multi-join APIs?',
        'Lateral joins / CROSS APPLY awareness?',
        'How would you join on non-equality predicates?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain LEFT JOIN and a common pitfall.',
          answer:
            'LEFT JOIN returns every left row. If there is no match, right columns are NULL. If I then write WHERE right.id IS NOT NULL or WHERE right.col = 1, I filter out unmatched left rows and behave like an inner join. Filters on the right side that should preserve outer semantics belong in the ON clause.',
        },
      ],
      keyTakeaways: [
        'Know all join types and anti-join patterns',
        'ON vs WHERE matters for outer joins',
        'Watch fan-out before aggregating',
      ],
    },
  ),

  createPage(
    'd1-p11',
    'GROUP BY, HAVING & Aggregates',
    12,
    [
      'Use COUNT/SUM/AVG/MIN/MAX with NULL semantics',
      'Distinguish WHERE vs HAVING',
      'Follow SELECT-list rules with GROUP BY',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('GROUP BY partitions rows into groups; aggregates collapse each group to one row. HAVING filters groups after aggregation; WHERE filters rows before.'),
          code(
            'sql',
            `SELECT department_id, COUNT(*) AS n, AVG(salary) AS avg_sal
FROM employee
WHERE active = TRUE
GROUP BY department_id
HAVING COUNT(*) >= 5
ORDER BY avg_sal DESC;`,
          ),
          ul([
            'WHERE: row-level, before groups',
            'HAVING: group-level, after aggregates',
            'COUNT(*) counts rows; COUNT(col) ignores NULL col',
            'SUM/AVG ignore NULL inputs',
          ]),
        ]),
        section('rules', 'SELECT list rules', [
          p('In strict SQL, every non-aggregated selected expression must appear in GROUP BY (or be functionally dependent on it — Postgres allows PK dependency).'),
          callout(
            'mistake',
            'Selecting employee.name while grouping by department_id without aggregating name — invalid/ambiguous.',
          ),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“WHERE vs HAVING?” → rows vs groups.'),
          p('“Can HAVING use columns not in SELECT?” → yes, if aggregated or grouped.'),
        ]),
      ],
      commonMistakes: [
        'Filtering aggregates in WHERE',
        'Misunderstanding COUNT NULL behavior',
        'Assuming AVG includes NULL as zero',
      ],
      interviewQuestions: [
        'WHERE vs HAVING?',
        'COUNT(*) vs COUNT(col)?',
        'What does GROUP BY do?',
        'List five aggregate functions.',
        'Can you use ORDER BY with aliases of aggregates?',
      ],
      intermediateInterviewQuestions: [
        'Write top-N per group (conceptually).',
        'How do NULLs in GROUP BY columns behave?',
        'FILTER clause / conditional aggregation?',
        'Why is SELECT * invalid with GROUP BY?',
        'DISTINCT vs GROUP BY?',
      ],
      advancedInterviewQuestions: [
        'Window functions vs GROUP BY — when each?',
        'How does the optimizer compute GROUP BY (hash vs sort)?',
        'Cardinality estimates after aggregation?',
        'Partial aggregation in parallel query plans?',
        'Write a query detecting duplicate groups.',
      ],
      interviewReadyAnswers: [
        {
          question: 'WHERE vs HAVING?',
          answer:
            'WHERE filters individual rows before grouping. HAVING filters groups after aggregate functions run. Example: WHERE active = true removes inactive employees first; HAVING COUNT(*) >= 5 keeps departments with at least five remaining employees.',
        },
      ],
      keyTakeaways: [
        'WHERE → GROUP BY → HAVING → SELECT → ORDER BY mental model',
        'Know NULL aggregate semantics',
        'SELECT list must respect grouping rules',
      ],
    },
  ),

  createPage(
    'd1-p12',
    'Subqueries and Views',
    12,
    [
      'Write correlated and non-correlated subqueries',
      'Choose EXISTS vs IN appropriately',
      'Explain views vs materialized views',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('A subquery is a query nested in another. Non-correlated subqueries can run once; correlated subqueries reference outer rows and conceptually run per outer row (optimizer may rewrite).'),
          code(
            'sql',
            `-- Employees earning above dept average (correlated)
SELECT e.name, e.salary
FROM employee e
WHERE e.salary > (
  SELECT AVG(e2.salary) FROM employee e2
  WHERE e2.department_id = e.department_id
);

-- Anti-join with EXISTS
SELECT c.* FROM customer c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);`,
          ),
          callout(
            'tip',
            'EXISTS stops at first match; good for semi/anti-joins. IN with a subquery that returns NULL can surprise you — prefer EXISTS for anti-joins.',
          ),
        ]),
        section('views', 'Views', [
          ul([
            'View: stored query / virtual table; expanded into the outer query',
            'Updatable views: limited cases; often read-only in practice',
            'Materialized view: stored result, refreshed on schedule/trigger — denormalization managed by DB',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“Correlated vs not?” → depends on outer row or not.'),
          p('“EXISTS vs IN?” → NULL pitfalls; EXISTS is often safer for existence checks.'),
          p('“Why views?” → abstraction, security, reuse — not magic performance.'),
        ]),
      ],
      commonMistakes: [
        'NOT IN (subquery with NULLs) returning empty unexpectedly',
        'Assuming views always improve performance',
        'Correlated subquery written when a join would be clearer',
      ],
      interviewQuestions: [
        'What is a subquery?',
        'Correlated vs non-correlated?',
        'EXISTS vs IN?',
        'What is a view?',
        'What is a materialized view?',
      ],
      intermediateInterviewQuestions: [
        'Write customers with no orders three ways.',
        'When can a view be updated?',
        'Scalar subquery in SELECT list — pitfalls?',
        'CTE vs subquery readability/performance?',
        'How do views interact with permissions?',
      ],
      advancedInterviewQuestions: [
        'Optimizer decorrelation of subqueries — what is the idea?',
        'Materialized view maintenance costs?',
        'Lateral subquery use cases?',
        'Why might a view prevent index use? (myth vs reality)',
        'Security: views for column/row hiding — limits?',
      ],
      interviewReadyAnswers: [
        {
          question: 'When do you use EXISTS?',
          answer:
            'When I care about existence of related rows, especially anti-joins. NOT EXISTS (SELECT 1 FROM child WHERE ...) is robust. NOT IN breaks when the subquery can return NULL. Optimizers often turn EXISTS into semi-joins.',
        },
      ],
      keyTakeaways: [
        'Correlated subqueries reference the outer query',
        'Prefer EXISTS for existence/anti-join patterns',
        'Views abstract; materialized views cache',
      ],
    },
  ),
]

function diagramHint() {
  return callout(
    'info',
    'Picture INNER as intersection of keys; LEFT as all left circles with optional right matches glued on.',
  )
}
