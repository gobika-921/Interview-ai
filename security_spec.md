# IntervAI Security Specification

## Data Invariants
1. A user can only access their own profile.
2. A user can only access interviews they participated in.
3. Interviews are immutable once completed (though updates are allowed during the session).
4. Resume data is protected and only accessible by the owner.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a user profile for a different UID.
2. Updating `email` or `uid` in an existing profile.
3. Accessing `/interviews/{id}` belonging to another user.
4. Injecting a massive string as an `interviewId`.
5. Modifying `score` or `feedback` of a completed interview from a different account.
6. Listing all interviews in the system.
7. Creating an interview with a spoofed `userId`.
8. Updating someone else's resume data.
9. Deleting interview records (forbidden).
10. Creating a user document without a verified email (optional but recommended).
11. Bypassing `isValidId` for path variables.
12. Shadow fields injection in user profiles.

## Test Results
All paths are secured using `isOwner()` and `isSignedIn()` checks. The `firestore.rules` file enforces these constraints by comparing `request.auth.uid` with the document's relational fields.
