import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  code,
  table,
  callout,
  example,
} from '../../../helpers'

export const d6p8: StudyPage = createPage(
  'd6-p8',
  'Injection: SQLi & Command Injection',
  18,
  [
    'Explain how SQL injection occurs conceptually and why parameterization stops it',
    'Describe command injection risks and safer alternatives',
    'Answer interview questions with defensive controls — no exploit recipes',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Injection flaws happen when untrusted input is interpreted as code or commands rather than data. Two classic forms in interviews: SQL injection (SQLi) and OS command injection. This page is defensive only: what it is, how it arises conceptually, why it is dangerous, how to prevent it, and how to talk about it in interviews — not how to exploit systems.',
        ),
        h3('Why it exists'),
        p(
          'String-building queries and shell commands mix code and data in one channel. If the database or shell parser cannot tell them apart, attacker-controlled characters change the meaning of the statement. Modern APIs and ORMs help, but unsafe concatenation still appears in legacy and hastily written code.',
        ),
        callout(
          'warning',
          'Defensive study only. Do not practice exploitation against systems you do not own. In interviews, describe risk and mitigations; never provide attack payloads as “proof.”',
          'Scope',
        ),
      ]),
      section('sqli', 'SQL injection', [
        h3('What'),
        p(
          'SQLi is when attacker-influenced input alters the structure of a SQL statement — for example changing the WHERE clause logic, UNION-ing unexpected rows, or stacking statements — because the input was concatenated into the query string.',
        ),
        h3('How it happens (conceptually)'),
        p(
          'The application builds SQL with string concatenation or format strings, embedding user fields (login name, search term, id) directly. The database engine parses the combined string as SQL. Where the developer intended a string literal, the attacker’s input can close the literal early and add SQL syntax. The root cause is treating untrusted bytes as trusted SQL code.',
        ),
        code(
          'java',
          `// UNSAFE pattern (do not use) — illustrates the class of bug
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
// email is mixed into SQL syntax → parser cannot tell data from code

// SAFE pattern — parameterized query / prepared statement
PreparedStatement ps = conn.prepareStatement(
  "SELECT * FROM users WHERE email = ?"
);
ps.setString(1, email); // bound as data, not syntax`,
          'Takeaway: keep SQL structure in code; bind values separately',
        ),
        h3('Why dangerous'),
        ul([
          'Confidentiality: unauthorized reads of rows/tables.',
          'Integrity: unauthorized UPDATEs/DELETEs.',
          'Availability: destructive statements or heavy queries.',
          'Sometimes authentication bypass if login queries are injectable.',
          'Can be a stepping stone to further compromise depending on DB privileges.',
        ]),
        h3('How to prevent'),
        ul([
          'Parameterized queries / prepared statements / ORM bind parameters everywhere — including ORDER BY alternatives via allow-lists, not string concat.',
          'Least-privilege DB accounts: app role cannot DROP tables or read unrelated schemas.',
          'Input validation as defense in depth (types, length, allow-lists) — not a substitute for parameterization.',
          'Avoid dynamic SQL; if unavoidable (analytic tools), strict allow-lists for identifiers.',
          'WAF/RASP may help detect but do not replace secure coding.',
          'Store secrets out of the DB where possible; encrypt sensitive columns.',
        ]),
        h3('Interview Q'),
        p(
          'Q: “How do you prevent SQL injection?” A: “Never concatenate untrusted input into SQL. Use prepared statements so the driver sends query structure and values separately. Combine with least-privilege DB users, allow-listed dynamic parts, and tests that attempt malicious strings in CI against staging.”',
        ),
      ]),
      section('cmd', 'Command injection', [
        h3('What'),
        p(
          'Command injection is when untrusted input is passed to an OS shell or command execution API such that the shell interprets metacharacters as command separators/operators, running unintended commands under the application’s privileges.',
        ),
        h3('How it happens (conceptually)'),
        p(
          'Features like “ping this host,” “convert this file,” or “image resize via CLI” call Runtime.exec / ProcessBuilder / bash -c with a string built from user input. If the string is handed to a shell, characters that mean “end command / start new command / pipe” change what executes. Even without a full shell, careless argument construction can be unsafe depending on the API.',
        ),
        code(
          'java',
          `// Risky design: shell string built from input
// Prefer: avoid shell; use ProcessBuilder with argument list; allow-list inputs

ProcessBuilder pb = new ProcessBuilder(
  "/usr/bin/convert", inputPath, outputPath
);
// args are discrete — not interpreted as shell syntax
// still validate paths/allow-lists so tools cannot be abused`,
          'Avoid shells; pass argument arrays; allow-list arguments',
        ),
        h3('Why dangerous'),
        ul([
          'Runs with app/server privileges → read secrets, pivot, ransomware risk.',
          'Often bypasses application authz if the OS command path is reachable.',
          'Hard to detect in business logs that only show “export succeeded.”',
        ]),
        h3('How to prevent'),
        ul([
          'Prefer native libraries/APIs over shelling out.',
          'If you must run processes: no shell, fixed executable path, discrete argv array.',
          'Allow-list arguments (enums, validated IDs); never pass raw user strings to shells.',
          'Sandbox / containers with minimal OS tools and least privilege.',
          'Separate dangerous jobs into isolated workers with tight filesystem mounts.',
        ]),
        h3('Interview Q'),
        p(
          'Q: “How would you safely implement a feature that needs an external CLI?” A: “I’d question whether a library can replace it. If not, I’d invoke a fixed binary via an argument array without a shell, allow-list every user-controlled parameter, run in a locked-down worker, and never concatenate into bash -c.”',
        ),
      ]),
      section('example', 'Worked example', [
        example('Login form review', [
          p(
            'Reviewer sees email concatenated into SQL. Fix: prepared statement + unique salt password hash verify. Add automated test: input containing quote characters must not change query structure (assert only parameterized path used). DB user limited to SELECT/INSERT on needed tables.',
          ),
        ]),
        table(
          ['Flaw', 'Root cause', 'Primary fix'],
          [
            ['SQLi', 'Data mixed into SQL syntax', 'Prepared statements / bind params'],
            ['Command injection', 'Data mixed into shell syntax', 'No shell + allow-listed argv'],
          ],
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'ORMs prevent many SQLi cases but rawQuery/native SQL can reintroduce them.',
          'Stored procedures are not automatically safe if they concatenate inside the procedure.',
          'Allow-listing identifiers (sort columns) is harder than binding values — design APIs accordingly.',
          'Logging full SQL with bound values can leak PII — redact.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'XSS is injection into HTML/JS context — next page.',
          'Secure DB practices (later) reinforce least privilege and parameterization.',
          'CIA: injection primarily threatens C and I; heavy queries also A.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “We use prepared statements everywhere.”'),
        p('Interviewer: “What about dynamic ORDER BY?”'),
        p(
          'Strong answer: “Column names can’t be bound as values in most drivers. I’d map UI sort keys to a fixed allow-list of column identifiers in code — never paste user text into ORDER BY.”',
        ),
        p('Interviewer: “How do you detect residual risk?”'),
        p(
          'Strong answer: “Code search for string-built SQL, SAST, code review checklists, and least-privilege so a missed bug has smaller blast radius — plus monitoring for anomalous DB errors.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Relying only on input sanitization / blacklist of quotes.',
      'Thinking ORM = immune without checking raw SQL escapes.',
      'Escaping for shells instead of avoiding shells.',
      'Providing exploit payloads in an interview instead of mitigations.',
    ],
    interviewQuestions: [
      'What is SQL injection?',
      'How do prepared statements prevent SQLi?',
      'What is command injection?',
      'Why are blacklists a weak defense against injection?',
      'How does least privilege limit injection impact?',
    ],
    intermediateInterviewQuestions: [
      'How do you safely handle dynamic table/column names?',
      'Can stored procedures be vulnerable to SQLi?',
      'How would you redesign a “ping” admin tool safely?',
      'What tests catch injection regressions?',
      'Difference between SQLi and XSS at the conceptual level?',
    ],
    advancedInterviewQuestions: [
      'How do second-order SQL injection issues arise conceptually?',
      'Defend a reporting engine that must build dynamic SQL.',
      'How do you apply defense in depth around a legacy concatenated query you cannot fully rewrite this sprint?',
      'Compare parameterization in JDBC, JPA, and MyBatis — where do people slip?',
      'How should incident response handle a suspected injection vulnerability in production?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain SQL injection and how you prevent it.',
        answer:
          'SQL injection happens when untrusted input is concatenated into a query so the database parses it as SQL syntax instead of data. It’s dangerous because it can read or change data and sometimes escalate privileges. Prevention is primarily prepared statements/parameter binding so query structure is fixed and values are separate. I also use least-privilege DB accounts, allow-lists for any dynamic identifiers, validation as defense in depth, and avoid exposing raw DB errors to clients.',
      },
      {
        question: 'How do you prevent command injection?',
        answer:
          'Command injection happens when user input is interpreted by a shell as metacharacters or additional commands. I avoid shelling out when possible. If a process is required, I use a fixed binary path with an argument array — no bash -c concatenation — allow-list parameters, and run the job in a minimal sandbox with least privilege. Validation helps, but removing the shell is the real fix.',
      },
    ],
    keyTakeaways: [
      'Injection = untrusted input treated as code.',
      'SQLi: parameterized queries; Command injection: no shell + allow-lists.',
      'Least privilege limits blast radius when prevention slips.',
    ],
  },
)
