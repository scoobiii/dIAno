#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-scoobiii/dIAno}"
RULESET_NAME="${RULESET_NAME:-dIAno-main-fail-closed}"

command -v gh >/dev/null || { echo "gh CLI required"; exit 1; }
gh auth status >/dev/null || { echo "Authenticate gh first"; exit 1; }

payload=$(cat <<'JSON'
{
  "name": "dIAno-main-fail-closed",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_approving_review_count": 1,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          {
            "context": "Required Governance Checks"
          }
        ]
      }
    },
    { "type": "non_fast_forward" },
    { "type": "deletion" }
  ],
  "bypass_actors": []
}
JSON
)

existing=$(gh api --method GET "repos/$REPO/rulesets" --jq '.[] | select(.name == "'"$RULESET_NAME"'") | .id' | head -n1 || true)

if [ -n "$existing" ]; then
  echo "Updating ruleset $existing"
  gh api --method PUT "repos/$REPO/rulesets/$existing" \
    --input <(printf '%s' "$payload") >/dev/null
else
  echo "Creating ruleset $RULESET_NAME"
  gh api --method POST "repos/$REPO/rulesets" \
    --input <(printf '%s' "$payload") >/dev/null
fi

echo "Verifying effective rules..."
gh api "repos/$REPO/rules/branches/main" | jq .

gh api "repos/$REPO/rules/branches/main" |
  jq -e 'any(.[]; .type == "pull_request") and
         any(.[]; .type == "required_status_checks" and
           any(.parameters.required_status_checks[]?;
             .context == "Required Governance Checks")) and
         any(.[]; .type == "non_fast_forward") and
         any(.[]; .type == "deletion")' >/dev/null

echo "PASS: main fail-closed rules are active."
