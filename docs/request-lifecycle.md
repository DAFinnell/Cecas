# CECAS Request Lifecycle

This page explains what each request status means and which changes the backend currently supports.

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
The backend can close a pre-approved request. This is a final state, but CECAS does not currently close requests automatically when a deadline passes.

## Current Status Changes

| From | Action | To |
| --- | --- | --- |
| New request | Student submits a request | `PENDING` |
| `PENDING` | Chair pre-approves it | `PRE_APPROVED` |
| `PENDING` | Chair rejects it with feedback | `REJECTED` |
| `PRE_APPROVED` | Student uploads evidence | `EVIDENCE_SUBMITTED` |
| `EVIDENCE_SUBMITTED` | Chair approves it | `APPROVED` |
| `EVIDENCE_SUBMITTED` | Chair rejects it with feedback | `REJECTED` |

The backend also has a `passDeadlineRequest` method that can move a request from `PRE_APPROVED` to `CLOSED`. No scheduled job or normal request flow currently calls it, so a request does not close just because time passes.

## Rules

- Evidence can be uploaded only while a request is `PRE_APPROVED`.
- A chair can approve a request only after evidence is submitted.
- `APPROVED`, `REJECTED`, and `CLOSED` are final states.
- After a rejection, a student can try again by creating a new request.

## Why `CLOSED` and `REJECTED` Are Different

`REJECTED` records a chair's decision. `CLOSED` is a separate outcome for a request that ends after pre-approval without evidence. Automatic deadline processing is not currently part of the app.
