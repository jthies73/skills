---
"mattpocock-skills": patch
---

`land-the-work` now caps the commit subject at **50 characters**, counted across the whole line including the `type:` prefix and any scope. Fifty is the width `git log --oneline` and every host's commit list are built around, so a longer subject is one that gets truncated at exactly the moment someone is scanning for it, and the request that step 6 opens inherits the same unreadable title.

The cap is not one of the things the step 1 override check can lift. An override sets a *maximum*, so a documented limit shorter than 50 wins and a longer one buys nothing: a 50-character subject satisfies a `commitlint` `header-max-length` of 100 either way.

Step 5 measures rather than eyeballs, with `git log -1 --pretty=%s | awk '{ print length }'`, and amends before pushing where the subject came out over. The remedy is to cut, never to truncate: detail moves down into the body, which has no limit, and a subject that still will not fit once the detail has moved is telling you the commit is two commits. That diagnostic is most of what the cap is worth.
