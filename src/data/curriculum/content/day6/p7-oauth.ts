import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  ol,
  table,
  callout,
  diagram,
  example,
} from '../../../helpers'

export const d6p7: StudyPage = createPage(
  'd6-p7',
  'OAuth Basics',
  14,
  [
    'Explain roles: resource owner, client, authorization server, resource server',
    'Describe authorization code flow at a high level',
    'Distinguish OAuth (authorization) from authentication / OIDC',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'OAuth 2.0 is an authorization framework: a user (resource owner) grants a client application limited access to resources on a resource server, without sharing the user’s password with the client. Tokens represent delegated permission. OpenID Connect (OIDC) layers authentication (identity) on top of OAuth.',
        ),
        h3('Why it exists'),
        p(
          'Before OAuth, “enter your Gmail password into this third-party app” was common and catastrophic. OAuth lets you approve scopes (e.g. read calendar) via the real authorization server, then revoke access later.',
        ),
        callout(
          'mistake',
          'OAuth ≠ login by itself. People say “Login with Google” — that’s usually OIDC (ID token + user info) built on OAuth. Pure OAuth answers “what can this client do?” not “who is the user?” unless you add OIDC.',
          'OAuth vs authentication',
        ),
        table(
          ['Role', 'Responsibility'],
          [
            ['Resource owner', 'User who owns the data'],
            ['Client', 'App requesting access (web app, mobile, SPA)'],
            ['Authorization server', 'Authenticates user; issues tokens after consent'],
            ['Resource server', 'API that accepts access tokens and serves data'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Authorization code flow (confidential client) — conceptual'),
        ol([
          'Client redirects browser to authorization server with client_id, redirect_uri, scope, state (CSRF protection), and PKCE challenge for public clients.',
          'User authenticates to the authorization server and consents to scopes.',
          'Authorization server redirects back with a short-lived authorization code (and state).',
          'Client backend exchanges code (+ PKCE verifier) for tokens at the token endpoint — not via the browser.',
          'Client calls resource server with access token; resource server validates token and enforces scopes + authz.',
        ]),
        diagram(
          `sequenceDiagram
  participant U as User
  participant C as Client app
  participant AS as Authorization server
  participant RS as Resource API
  U->>C: Wants to connect
  C->>AS: Redirect authorize + state + PKCE
  U->>AS: Login + consent
  AS->>C: Redirect with auth code
  C->>AS: Exchange code for tokens
  AS-->>C: Access token (+ refresh, ID token if OIDC)
  C->>RS: API call with access token
  RS-->>C: Protected resource`,
          'Authorization code flow at interview altitude',
        ),
        h3('Tokens'),
        ul([
          'Access token — presented to resource server; short-lived; opaque or JWT.',
          'Refresh token — used at token endpoint to obtain new access tokens; higher sensitivity; store carefully; rotate.',
          'ID token (OIDC) — JWT asserting user identity for the client; not a substitute for API access control by itself.',
        ]),
        h3('PKCE'),
        p(
          'Proof Key for Code Exchange binds the code exchange to the client that started the flow. Critical for public clients (mobile/SPA) and recommended broadly to prevent authorization code interception.',
        ),
        h3('Flows to treat carefully in interviews'),
        ul([
          'Implicit flow — historically returned tokens in the front channel; largely deprecated.',
          'Resource owner password credentials — client collects user password; avoid for third-party apps.',
          'Client credentials — app-to-app, no user; good for machine clients with their own identity.',
        ]),
      ]),
      section('example', 'Worked example', [
        example('“Sign in with Google” for your app', [
          p(
            'Your app is the client. Google is the authorization server (+ OIDC provider). User consents. Your backend exchanges the code, receives an ID token (who) and maybe an access token (call Google APIs). You then create your own session for your app. Scopes define what Google APIs you may call — your own API still needs your authz.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'SPA public clients can’t keep a client secret — use PKCE; consider BFF pattern to keep tokens server-side.',
          'Over-broad scopes increase blast radius — request least privilege.',
          'redirect_uri must be exact allow-listed HTTPS URLs to prevent code leakage.',
          'state (and nonce for OIDC) prevent login CSRF / mixing up responses.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Builds on authn vs authz: user authn at AS; delegated authz via scopes/tokens.',
          'Tokens subject to JWT/session storage rules from prior page.',
          'TLS required to protect codes and tokens in redirects and back-channel exchange.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “I’d use authorization code + PKCE.”'),
        p('Interviewer: “Why not implicit?”'),
        p(
          'Strong answer: “Implicit exposes tokens in the browser front channel and is obsolete. Code flow keeps tokens on the back channel; PKCE binds the exchange to the initiator.”',
        ),
        p('Interviewer: “Is OAuth authentication?”'),
        p(
          'Strong answer: “OAuth authorizes access. For authentication we use OIDC ID tokens or a separate identity assertion, then establish our own session.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Equating OAuth with authentication.',
      'Putting client secrets in mobile/SPA binaries.',
      'Skipping state/PKCE.',
      'Using access tokens as the only identity proof without validating audience/issuer.',
      'Allowing open redirect_uri patterns.',
    ],
    interviewQuestions: [
      'What problem does OAuth solve?',
      'Name the four OAuth roles.',
      'Outline the authorization code flow.',
      'What is PKCE?',
      'OAuth vs OpenID Connect?',
    ],
    intermediateInterviewQuestions: [
      'When is the client credentials flow appropriate?',
      'Why is the implicit flow discouraged?',
      'How do scopes relate to least privilege?',
      'What should a resource server validate on an access token?',
      'How does logout/revocation work with third-party tokens?',
    ],
    advancedInterviewQuestions: [
      'Design a secure OAuth integration for a native mobile app.',
      'Compare BFF vs pure SPA token handling.',
      'How do you threaten-model redirect URI manipulation?',
      'How should microservices validate opaque tokens vs JWTs from an AS?',
      'Explain token exchange / impersonation patterns at a high level.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain OAuth 2.0 authorization code flow.',
        answer:
          'OAuth lets a user grant a client limited access without sharing their password. In the authorization code flow, the client redirects the user to the authorization server to authenticate and consent. The server redirects back with a short-lived code. The client exchanges that code at the token endpoint for tokens — ideally with PKCE. The client then calls the resource server with the access token. OAuth is about delegated authorization; OIDC adds identity via ID tokens for login use cases.',
      },
    ],
    keyTakeaways: [
      'OAuth = delegated authorization; OIDC adds authentication.',
      'Know the four roles and authorization code + PKCE.',
      'Protect redirect_uri, state, secrets, and token storage.',
    ],
  },
)
