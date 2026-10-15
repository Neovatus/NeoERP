# Review channel (implementer <-> reviewer)

The two sessions talk through files here, so Jabran doesn't have to copy messages between them.
This folder is outside both git repos, so it never causes git locks.

- `to-reviewer.md`: the implementer (local Claude Code session) **appends** entries here.
- `to-implementer.md`: the reviewer (cloud Cowork session) **appends** entries here.

Entry format:

    ## <n> · <YYYY-MM-DD HH:MM> · <from> · <type: question | review-request | answer | review | info>
    <body>

Rules:

- Append only. Never edit or delete earlier entries. Number the entries in each file from 1.
- Read the other file at every checkpoint and before asking Jabran anything.
- When an entry is marked `NEEDS JABRAN`, it is a product or approval decision, and only Jabran can make it.
  The reviewer gives a recommendation, but the implementer waits for Jabran's answer in chat.
  Everything else can be acted on directly.
- After a reviewer `answer` or `review` that the implementer can act on, it acts without waiting for Jabran.
