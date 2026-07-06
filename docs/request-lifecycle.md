# CECAS Request Lifecycle

This document explains how an extra credit request moves through the system.

It exists because the PRD, baseline requirements, and current code do not all say the same thing yet. This is the version the team should use going forward when building student pages, evidence upload work, and chair review work.

## What This Document Is For

Use this document as the source for:
- what each request status means
- which status changes are allowed
- what should happen when a request is rejected
- what should happen when a student misses the evidence deadline

This is not a full rewrite of the PRD. It is a simple reference so the team can stop re-deciding the workflow in each ticket.

## The Statuses

### `PENDING`
The student has submitted a new request, and it is waiting for the chair to do the first review.

### `PRE_APPROVED`
The chair has said the activity looks eligible so far. The student still needs to upload evidence before the request can be fully approved.

### `EVIDENCE_SUBMITTED`
The student has uploaded evidence, and the request is ready for final chair review.

### `APPROVED`
The chair has approved the request. This is a finished state.

### `REJECTED`
The chair reviewed the request and decided not to approve it. This is a finished state.

### `CLOSED`
The student did not submit evidence before the deadline after pre-approval. This is a finished state.

## Canonical Lifecycle

This is the lifecycle we should use moving forward.

| From | Who acts | What happens | To |
| --- | --- | --- | --- |
| New request | Student | submits request | `PENDING` |
| `PENDING` | Chair | pre-approves request | `PRE_APPROVED` |
| `PENDING` | Chair | rejects request with feedback | `REJECTED` |
| `PRE_APPROVED` | Student | uploads evidence | `EVIDENCE_SUBMITTED` |
| `PRE_APPROVED` | System | evidence deadline passes | `CLOSED` |
| `EVIDENCE_SUBMITTED` | Chair | approves request | `APPROVED` |
| `EVIDENCE_SUBMITTED` | Chair | rejects request with feedback | `REJECTED` |

## Important Rules

- If the student misses the evidence deadline, the request becomes `CLOSED`.
- A rejected request stays rejected.
- An approved request stays approved.
- A closed request stays closed.
- A rejected request is not reopened.
- If a student wants to try again after a rejection, they create a new request.

## Why `CLOSED` And `REJECTED` Are Different

These two statuses should not mean the same thing.

- `REJECTED` means a chair reviewed the request and said no.
- `CLOSED` means the student never finished the process after pre-approval because the evidence deadline passed first.

That difference matters for the UI and for future workflow tickets. A student should be able to tell whether the request was denied by a chair or simply expired before evidence was submitted.

## Rules And Edge Cases

### Can a student upload evidence in any state besides `PRE_APPROVED`?
No. Evidence upload should only happen while the request is `PRE_APPROVED`.

### Can a chair approve a request before evidence is submitted?
No. Approval should only happen from `EVIDENCE_SUBMITTED`.

### Can a rejected request move back to `PENDING`?
No. We are abandoning that rule for simplicity for now.

### Can a closed request be reopened?
No. `CLOSED` is a finished state.

### Can a student try again after rejection?
Yes, but by creating a new request, not by reopening the old one.

## What Future Tickets Should Assume

Future tickets should build on these rules:

- evidence upload work should treat `PRE_APPROVED` as the only state where evidence can be submitted
- chair final review work should treat `EVIDENCE_SUBMITTED` as the only state that can be approved
- student status/detail pages should show `CLOSED` and `REJECTED` as different outcomes
- future state-machine updates should follow the transition table in this document

## Outdated Behavior To Ignore

Current code still includes a `REJECTED -> PENDING` resubmit path.

That is old behavior. It does not match the canonical lifecycle in this document.

Going forward, the team should treat `REJECTED` as a finished state and use a brand-new request if the student wants to try again.

## Follow-Up Work

This document sets the rule. The code still needs to be aligned with it.

Follow-up implementation should:
- update `StateMachineService` to match this lifecycle
- remove same-request resubmission from `REJECTED`
- add tests for deadline expiry
- add tests that confirm `REJECTED` is a finished state
