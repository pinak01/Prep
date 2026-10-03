import type { StudyPage } from '@/types/curriculum'
import {
  callout,
  createPage,
  ol,
  p,
  section,
  ul,
} from '../../../helpers'

export const day1Module5Pages: StudyPage[] = [
  createPage(
    'd1-rev',
    '10-Minute Revision',
    10,
    [
      'Recite Day 1 core definitions without notes',
      'Sketch B+ tree and normalization checklist from memory',
    ],
    {
      sections: [
        section('checklist', 'Rapid checklist', [
          ul([
            'DBMS pieces: query processor, storage/buffer pool, transactions/recovery',
            'Relation terms + schema vs instance + SQL≠pure relations (NULL, duplicates)',
            'Keys: super → candidate → primary; FK actions CASCADE/RESTRICT',
            'FD → closure → candidate keys',
            '1NF atomic; 2NF no partial; 3NF no transitive non-primes; BCNF determinants are keys',
            'SQL: NULL, joins ON vs WHERE, WHERE vs HAVING, EXISTS anti-join',
            'Indexes: selectivity, composite leftmost, covering, write cost',
            'B+ tree: high fanout, linked leaves, range friendly',
            'EXPLAIN for slow queries; transactions = ACID intro',
          ]),
          callout('tip', 'Speak each bullet in one sentence aloud. If you stumble, revisit that page.'),
        ]),
      ],
      commonMistakes: ['Skimming without speaking aloud', 'Skipping numerical FD/key practice'],
      interviewQuestions: [
        'Define candidate key.',
        'Define 3NF.',
        'INNER vs LEFT JOIN?',
        'Why B+ trees?',
        'What is a covering index?',
      ],
      intermediateInterviewQuestions: [
        'Closure algorithm steps?',
        'Lossless join test?',
        'WHERE vs HAVING?',
        'When seq scan wins?',
        'ACID one-liners?',
      ],
      advancedInterviewQuestions: [
        '3NF not BCNF example?',
        'Index follow-up chain?',
        'NOT IN NULL trap?',
        'Physical data independence example?',
        'How to investigate slow SQL?',
      ],
      interviewReadyAnswers: [],
      keyTakeaways: ['If you can teach each bullet in 20 seconds, Day 1 stuck.'],
    },
  ),

  createPage(
    'd1-traps',
    'Interview Traps',
    10,
    [
      'Recognize common wrong answers and correct them under pressure',
    ],
    {
      sections: [
        section('traps', 'Traps and fixes', [
          ol([
            '“Index always speeds every query” → selectivity, size, write cost, wrong column order.',
            '“Normalized DBs have no duplicate values” → FKs duplicate keys; measurements can repeat.',
            '“B-tree is a binary tree” → multiway, page-sized nodes.',
            '“WHERE col = NULL” → IS NULL.',
            '“LEFT JOIN + WHERE right.id = 5” still outer → often becomes inner.',
            '“BCNF always best” → dependency preservation exceptions.',
            '“Transactions mean SERIALIZABLE always” → defaults often READ COMMITTED.',
          ]),
        ]),
      ],
      commonMistakes: ['Defending a trap answer instead of correcting'],
      interviewQuestions: [
        'Name three index myths.',
        'Name two SQL NULL traps.',
        'Name one normalization myth.',
        'Name one join trap.',
        'Name one transaction myth.',
      ],
      intermediateInterviewQuestions: [
        'How do you recover after stating a wrong definition?',
        'Why do interviewers push “always?” questions?',
        'Give a better answer after “indexes make queries faster.”',
        'Explain leftmost prefix failure mode.',
        'Explain NOT IN trap.',
      ],
      advancedInterviewQuestions: [
        'Design a 60-second self-correction script.',
        'Which Day 1 topic produces the most false confidence?',
        'How do traps connect to production outages?',
        'Trade-off language that sounds senior?',
        'How to ask clarifying questions on vague schema prompts?',
      ],
      interviewReadyAnswers: [
        {
          question: 'You said something wrong — recover.',
          answer:
            'Acknowledge: “I oversimplified. A more precise answer is…” Then give the corrected WHAT/WHY/TRADE-OFF. Interviewers reward repair.',
        },
      ],
      keyTakeaways: ['Trap questions test nuance, not vibes'],
    },
  ),

  createPage(
    'd1-rapid',
    'Rapid Fire — 20 Questions',
    12,
    [
      'Answer 20 Day 1 questions in under 10 minutes',
    ],
    {
      sections: [
        section('questions', '20 prompts (answer aloud)', [
          ol([
            'What is physical data independence?',
            'Schema vs instance?',
            'Super key vs candidate key?',
            'Entity vs referential integrity?',
            'Define functional dependency.',
            'How do you compute X+?',
            'Name three anomalies.',
            'Define 2NF.',
            'Define BCNF.',
            'Lossless join test for two relations?',
            'DDL vs DML?',
            'Why is WHERE col = NULL wrong?',
            'LEFT vs INNER JOIN?',
            'WHERE vs HAVING?',
            'EXISTS vs IN for anti-join?',
            'What is selectivity?',
            'Leftmost prefix rule?',
            'Why B+ over binary tree?',
            'Seq scan vs index scan?',
            'Name ACID properties.',
          ]),
          p('Model answers live on the earlier pages — force recall first.'),
        ]),
      ],
      commonMistakes: ['Looking up answers immediately'],
      interviewQuestions: [
        'What is physical data independence?',
        'Schema vs instance?',
        'Super key vs candidate key?',
        'Define functional dependency.',
        'Define 2NF.',
      ],
      intermediateInterviewQuestions: [
        'Define BCNF.',
        'LEFT vs INNER JOIN?',
        'WHERE vs HAVING?',
        'Leftmost prefix rule?',
        'Seq scan vs index scan?',
      ],
      advancedInterviewQuestions: [
        'Lossless join test?',
        'EXISTS vs IN anti-join?',
        'Why B+ over binary tree?',
        'Entity vs referential integrity?',
        'Name three anomalies with examples.',
        'How do you compute X+?',
        'DDL vs DML vs TCL?',
        'What is selectivity with example?',
        'ACID one-liners?',
        'Covering index definition?',
      ],
      interviewReadyAnswers: [],
      keyTakeaways: ['Rapid fire builds retrieval speed for assessment centres'],
    },
  ),
]
