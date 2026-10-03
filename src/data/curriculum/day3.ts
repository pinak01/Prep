import type { Day } from '@/types/curriculum'
import { sumPageMinutes } from '../helpers'
import { m1Pages } from './content/day3/m1-models-addressing'
import { m2Pages } from './content/day3/m2-core-services'
import { m3Pages } from './content/day3/m3-transport'
import { m4Pages } from './content/day3/m4-application'
import { m5Pages } from './content/day3/m5-revision'

const modules = [
  {
    id: 'd3-m1',
    title: 'Networking Models & Addressing',
    description: 'Layered models, IP addressing, subnetting, and CIDR.',
    pages: m1Pages,
  },
  {
    id: 'd3-m2',
    title: 'Core Network Services',
    description: 'ARP, DHCP, DNS, and routing fundamentals.',
    pages: m2Pages,
  },
  {
    id: 'd3-m3',
    title: 'Transport Layer: TCP & UDP',
    description: 'Reliability, handshake, flow/congestion control, and sliding windows.',
    pages: m3Pages,
  },
  {
    id: 'd3-m4',
    title: 'Application Layer & Web Infrastructure',
    description:
      'HTTP versions, TLS, REST, WebSockets, proxies, CDNs, and end-to-end request path.',
    pages: m4Pages,
  },
  {
    id: 'd3-m-revision',
    title: 'Revision & Interview Prep',
    description:
      'Fast checklist, common traps, and a 20-question rapid-fire drill for Day 3.',
    pages: m5Pages,
  },
]

export const day3: Day = {
  id: 'day-3',
  number: 3,
  title: 'Computer Networks',
  shortTitle: 'Computer Networks',
  description:
    'OSI/TCP-IP models, addressing, core protocols, TCP reliability, HTTP/TLS, and how the web stack fits together.',
  topics: [
    'OSI & TCP/IP',
    'IP & Subnetting',
    'DNS / DHCP / ARP',
    'TCP & UDP',
    'HTTP / HTTPS / TLS',
    'Proxies & Load Balancers',
    'What happens when you type a URL?',
  ],
  estimatedMinutes: sumPageMinutes(modules.flatMap((m) => m.pages)),
  modules,
  quiz: {
    id: 'quiz-day-3',
    dayId: 'day-3',
    title: 'Day 3 Assessment — Computer Networks',
    description:
      'Assess layered networking, TCP, HTTP/TLS, and web request path knowledge.',
    timeLimitMinutes: 30,
    passingScore: 70,
    questions: [],
  },
}
