# Saved matchweek snapshots

The frontend now uses `epl-standings.json`, `laliga-standings.json`, and
`ucl-standings.json` for a shared competition dashboard. Each snapshot includes
current standings, predicted standings, fixtures, source, and a capture timestamp.
Domestic fixtures also retain kickoff times and EPL gameweek numbers when supplied.
Times shown in the UI are UTC; UCL has no fabricated kickoff dates.

Fetch missing snapshots once:

```sh
npm run snapshot:all
```

Refresh one competition for a new matchweek:

```sh
npm run snapshot:all -- --league=epl --force
```

Refresh every competition with `npm run snapshot:all -- --force`. Each competition
is validated and replaced atomically; failures keep its existing file. No endpoint
is called for an existing file without `--force`. The older `snapshot:ucl` command
remains supported.

`ucl-standings.json` contains the actual responses from `/ucl/standings` and
`/ucl/predicted_table`, plus the capture timestamp, backend origin, and upcoming
match predictions. The UI imports it directly: page loads, table switches, and
builds make no standings, fixture, or predicted-table requests to Hugging Face.

The match list uses the real display names from each competition's `/get_fixtures`. Scores are
recovered from each club's goals-for/goals-against changes in the predicted
table, so the cards show exactly the results applied to that table without
running 18 additional predictions. Validation requires one match per club,
matching home/away goal changes, and matching points changes. If the provider
returns a different window or multiple matches per club, refresh fails and
retains the previous snapshot. This also means double gameweeks need a backend
per-fixture prediction response before individual scores can be recovered safely.

The EPL snapshot follows the next scheduled FPL gameweek's remaining fixtures.
La Liga and UCL use the backend's upcoming three-day window; these can be partial
rounds. A daily backend CSV may already include a fixture that has since started.

Create the snapshot once with `npm run snapshot:ucl`. If the file already exists,
the command exits without contacting the backend.

To replace it for a new matchweek:

```sh
npm run snapshot:ucl -- --force
```

The script uses `UCL_API_ORIGIN` or `NEXT_PUBLIC_API_URL` from the environment
(also loading `.env.local` and `.env`). Both an origin and a URL ending in `/api`
are accepted. It makes one request per endpoint (standings, predicted table,
fixtures), validates the responses, then
atomically replaces the snapshot. Errors leave the previous snapshot intact.

For a future cron job, run the refresh command from this frontend directory,
then rebuild and redeploy the frontend so visitors receive the new snapshot.
No cron job is configured yet. Empty responses are saved and displayed as an
empty state; request errors are printed with the backend's `detail` message.

La Liga refreshes fetch current standings directly from ESPN because the backend's
daily CSV can omit matches completed since its first request. The snapshot records
this URL in `standingsSource`. Model scores are recovered against the backend's
own current/predicted table pair, then applied to the fresh ESPN table. Fixtures
whose kickoff has passed are excluded, so completed matches are not counted again.
The refresh requires 20 valid provider rows, matching club lists, and valid kickoff
times; a provider failure retains the existing snapshot instead of silently saving
the stale backend table with a new timestamp. This still requires a refresh,
rebuild, and deployment to update the published site.

Run consistency and API-contract checks with:

```sh
node --test scripts/ucl-fixture-results.test.mjs scripts/predictor-api.test.mjs scripts/standings-data.test.mjs
```
